#!/usr/bin/env node
// Claims-as-code. Runs automatically after `npm run build` (npm `postbuild`).
//
// The site's thesis is that the craft is legible, which only works if the
// things it says about itself are true. This re-derives every stated number
// from dist/ and package.json and exits non-zero on drift, so a stale claim
// breaks the build instead of surviving as a quiet lie.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, extname } from 'node:path';
import { gzipSync } from 'node:zlib';

// fileURLToPath, not .pathname — the latter stays percent-encoded, so a repo
// living under a directory with a space or a non-ASCII character would send
// every readFileSync below to a path that does not exist.
const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');

const failures = [];
const fail = (what, expected, actual) =>
  failures.push(`${what}\n    claimed: ${expected}\n    actual:  ${actual}`);

// claims.ts is TS-with-`as const`; strip the type syntax rather than pulling in
// a TS loader for one small module.
const claimsSrc = readFileSync(join(root, 'src/data/claims.ts'), 'utf8');
const num = (key) => {
  const m = claimsSrc.match(new RegExp(`${key}:\\s*([\\d_]+)`));
  if (!m) throw new Error(`check-claims: claim "${key}" not found in claims.ts`);
  return Number(m[1].replace(/_/g, ''));
};
const list = (key) => {
  const m = claimsSrc.match(new RegExp(`${key}:\\s*\\[([^\\]]*)\\]`));
  if (!m) throw new Error(`check-claims: claim "${key}" not found in claims.ts`);
  return (m[1].match(/'([^']+)'/g) || []).map((s) => s.slice(1, -1)).sort();
};

const walk = (dir, out = []) => {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};

let files;
try {
  files = walk(dist);
} catch {
  console.error('check-claims: dist/ not found — run `npm run build` first.');
  process.exit(1);
}

// ---- runtime dependencies -------------------------------------------------
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const buildOnly = new Set(list('buildOnlyDeps'));
const runtime = Object.keys(pkg.dependencies || {})
  .filter((d) => !buildOnly.has(d))
  .sort();
const claimedRuntime = list('runtimeDeps');
if (runtime.join(',') !== claimedRuntime.join(',')) {
  fail(
    'runtime dependencies',
    claimedRuntime.join(', ') || '(none)',
    runtime.join(', ') || '(none)',
  );
}

// ---- page count -----------------------------------------------------------
const pages = files.filter((f) => extname(f) === '.html').length;
if (pages !== num('pages')) fail('page count', num('pages'), pages);

// ---- fonts ----------------------------------------------------------------
const fonts = files.filter((f) => extname(f) === '.woff2');
const fontBytes = fonts.reduce((n, f) => n + statSync(f).size, 0);
if (fonts.length !== num('fontFiles')) fail('font file count', num('fontFiles'), fonts.length);
if (fontBytes !== num('fontBytes')) fail('total font bytes', num('fontBytes'), fontBytes);

// ---- wasm -----------------------------------------------------------------
const wasm = files.filter((f) => extname(f) === '.wasm');
const wasmBytes = wasm.reduce((n, f) => n + statSync(f).size, 0);
if (wasmBytes !== num('wasmBytes')) fail('wasm bytes', num('wasmBytes'), wasmBytes);

// ---- byte budgets ---------------------------------------------------------
const gz = (buf) => gzipSync(buf, { level: 9 }).length;
const homeGz = gz(readFileSync(join(dist, 'index.html')));
if (homeGz > num('homepageHtmlGzBudget')) {
  fail('homepage html gz budget', `<= ${num('homepageHtmlGzBudget')}`, homeGz);
}
const jsFiles = files.filter((f) => extname(f) === '.js' && f.includes('_astro'));
const jsGz = gz(Buffer.concat(jsFiles.map((f) => readFileSync(f))));
if (jsGz > num('totalJsGzBudget')) {
  fail('total js gz budget', `<= ${num('totalJsGzBudget')}`, jsGz);
}

// ---- prose: no resurrected ghosts -----------------------------------------
// GSAP, WebGL, ScrollTrigger and Three.js were all claimed long after being
// deleted. Negations ("no GSAP", "without WebGL") are legitimate prose, so
// strip those before flagging what's left.
const GHOSTS = ['GSAP', 'ScrollTrigger', 'WebGL', 'Three.js', 'wasm-bindgen'];
for (const rel of ['README.md', 'src/pages/colophon.astro', 'src/pages/lab.astro']) {
  const text = readFileSync(join(root, rel), 'utf8').replace(
    /\b(no|No|without|Without|not)\s+([A-Za-z.-]+)/g,
    '',
  );
  for (const ghost of GHOSTS) {
    if (text.includes(ghost)) fail(`${rel} claims "${ghost}"`, 'not present', 'still referenced');
  }
}

// ---- README numbers -------------------------------------------------------
// The colophon imports claims.ts, so its numbers cannot drift. The README is
// markdown and can't import anything, so it states its own — and did drift
// ("~27 feature modules" against 30 on disk). These are re-derived straight
// from the tree rather than from claims.ts: nothing in the colophon says them.
const readme = readFileSync(join(root, 'README.md'), 'utf8');
const clientModules = readdirSync(join(root, 'src/lib/client')).filter(
  (f) => extname(f) === '.ts',
).length;
const workerDirs = readdirSync(root, { withFileTypes: true }).filter(
  (d) => d.isDirectory() && existsSync(join(root, d.name, 'wrangler.toml')),
);

for (const [what, re, actual] of [
  ['README wasm bytes', /(\d+)-byte artifact/, wasmBytes],
  ['README client module count', /(\d+) hand-rolled feature modules/, clientModules],
  ['README runtime dependency count', /\*\*Runtime dependencies:\*\* (\d+)/, runtime.length],
  ['README worker count', /\*\*Backend:\*\* (\d+) Cloudflare Workers/, workerDirs.length],
]) {
  const m = readme.match(re);
  if (!m) fail(`${what} — no claim matching ${re.source}`, 'a stated number', 'nothing matched');
  else if (Number(m[1]) !== actual) fail(what, m[1], actual);
}

// ---- report ---------------------------------------------------------------
if (failures.length) {
  console.error(`\n  check-claims: ${failures.length} claim(s) no longer true\n`);
  for (const f of failures) console.error(`  ✗ ${f}\n`);
  console.error('  Fix the site or fix src/data/claims.ts — but do not ship the lie.\n');
  process.exit(1);
}
console.log(
  `  ✓ claims verified — ${runtime.length} runtime dep, ${pages} pages, ` +
    `${fonts.length} fonts (${Math.round(fontBytes / 1024)}KB), ` +
    `html ${Math.round(homeGz / 1024)}KB gz, js ${Math.round(jsGz / 1024)}KB gz, ` +
    `README ${clientModules} modules / ${workerDirs.length} workers`,
);
