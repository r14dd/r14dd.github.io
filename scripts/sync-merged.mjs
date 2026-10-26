#!/usr/bin/env node
// Rewrites each openSource `merged:` count in src/data/profile.ts from GitHub.
// Run in CI before the build; the result is deployed, not committed. A failed
// lookup leaves the hand-set number alone, so the build never breaks on it.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const file = fileURLToPath(new URL('../src/data/profile.ts', import.meta.url));
const headers = { Accept: 'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

let src = readFileSync(file, 'utf8');
const entry = /url: 'https:\/\/github\.com\/([^/]+\/[^/]+)\/pulls[^']*',\n\s+merged: (\d+),/g;

for (const [whole, repo, old] of [...src.matchAll(entry)]) {
  try {
    const q = encodeURIComponent(`repo:${repo} is:pr is:merged author:r14dd`);
    const res = await fetch(`https://api.github.com/search/issues?q=${q}&per_page=1`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { total_count: n } = await res.json();
    src = src.replace(whole, whole.replace(`merged: ${old},`, `merged: ${n},`));
    console.log(`${repo}: ${old} -> ${n}`);
  } catch (e) {
    console.warn(`${repo}: kept ${old} (${e.message})`);
  }
}
writeFileSync(file, src);

// Flag upstream repos with merged PRs that have no openSource entry. Course
// and hackathon orgs are not upstream work; add new ones here if they show up.
const NOT_UPSTREAM = ['cse442-at-ub', 'xsolla-baku-gametech-hackathon', 'aykhanstoic'];
const listed = new Set([...src.matchAll(entry)].map((m) => m[1].toLowerCase()));
try {
  const q = encodeURIComponent('author:r14dd is:pr is:merged -user:r14dd');
  const res = await fetch(`https://api.github.com/search/issues?q=${q}&per_page=100`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { items } = await res.json();
  const repos = new Set(items.map((i) => i.repository_url.split('/repos/')[1].toLowerCase()));
  for (const repo of repos) {
    if (listed.has(repo) || NOT_UPSTREAM.includes(repo.split('/')[0])) continue;
    console.log(
      `::warning title=Unlisted merged PRs::${repo} has merged PRs but no openSource entry in profile.ts`,
    );
  }
} catch (e) {
  console.warn(`unlisted-repo check skipped (${e.message})`);
}
