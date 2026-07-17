// Build-time git + build metadata. Runs in Node during `astro build`/`dev`
// (frontmatter + static endpoints), never in the browser. Used by /lab for the
// `git log` command, the "last pushed" line, and the colophon SHA.
import { execSync } from "node:child_process";

function sh(cmd: string, fallback = ""): string {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return fallback;
  }
}

export type Commit = {
  hash: string;
  short: string;
  subject: string;
  date: string; // ISO
  relative: string; // e.g. "3 hours ago"
};

export type BuildInfo = {
  commits: Commit[];
  branch: string;
  builtAt: string; // ISO
  head: Commit | null;
  count: number; // total commits on the branch
};

const US = "\x1f"; // unit separator — safe field delimiter

export function getBuildInfo(limit = 8): BuildInfo {
  const log = sh(`git log -${limit} --pretty=format:%H${US}%h${US}%s${US}%cI${US}%cr`);
  const commits: Commit[] = log
    ? log.split("\n").map((line) => {
        const [hash, short, subject, date, relative] = line.split(US);
        return { hash, short, subject, date, relative };
      })
    : [];
  const branch = sh("git rev-parse --abbrev-ref HEAD", "main");
  const count = Number(sh("git rev-list --count HEAD", "0")) || commits.length;
  return {
    commits,
    branch,
    builtAt: new Date().toISOString(),
    head: commits[0] ?? null,
    count,
  };
}
