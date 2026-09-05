#!/usr/bin/env node
/**
 * Crawls the live site and checks that every link on it still resolves.
 *
 * This runs against https://riad.cc itself, not a local build — no `astro
 * build`, no `npm ci`, nothing to install. A build only proves the HTML
 * generates; it says nothing about whether a link on it still points
 * somewhere, and the thing a reader actually clicks is the deployed site.
 *
 * Run on a schedule by .github/workflows/link-check.yml; a red run is an
 * email. Zero dependencies on purpose, so CI needs no npm install.
 *
 * Sitemap → every page → every href/src on every page → every unique URL,
 * HEAD-then-GET, concurrency 8. LinkedIn and X/Twitter are known to answer
 * bots with 403/999 regardless of whether the link is good, so those hosts
 * are allow-listed as "unverifiable" rather than reported as dead.
 */

const ORIGIN = 'https://riad.cc';
const SITEMAP_INDEX = `${ORIGIN}/sitemap-index.xml`;
const FORCED_PAGES = [`${ORIGIN}/resume/`, `${ORIGIN}/ru/resume/`, `${ORIGIN}/az/resume/`];

const TIMEOUT_MS = 15000;
const CONCURRENCY = 8;
const USER_AGENT = 'riad.cc link check';

// Hosts that block bots with a 403 or a made-up 999 regardless of whether the
// link is actually good. Reporting these as dead would just be noise on every
// run, so they get a note instead of a failure.
const UNVERIFIABLE_HOSTS = new Set([
  'linkedin.com',
  'www.linkedin.com',
  'x.com',
  'www.x.com',
  'twitter.com',
  'www.twitter.com',
]);

function bareHost(url) {
  return new URL(url).hostname.replace(/^www\./, '');
}

/** Runs `worker` over `items` with at most `limit` in flight at once. */
async function pool(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function lane() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, lane));
  return results;
}

async function fetchText(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
}

/** Sitemap index → sub-sitemaps → page URLs, plus the resume pages by hand. */
async function collectPages() {
  const index = await fetchText(SITEMAP_INDEX);
  const locs = extractLocs(index);
  const pages = new Set();

  for (const loc of locs) {
    if (loc.endsWith('.xml')) {
      const sub = await fetchText(loc);
      for (const l of extractLocs(sub)) pages.add(l);
    } else {
      pages.add(loc);
    }
  }

  for (const p of FORCED_PAGES) pages.add(p);
  return [...pages];
}

const SCHEMES_TO_SKIP = /^(mailto|tel|javascript):/i;

/** Pulls every href/src out of raw HTML and resolves it against the page. */
function extractLinks(html, pageUrl) {
  const found = new Set();
  for (const m of html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
    const raw = m[1].trim();
    if (!raw || raw.startsWith('#') || SCHEMES_TO_SKIP.test(raw)) continue;
    let resolved;
    try {
      resolved = new URL(raw, pageUrl);
    } catch {
      continue; // unparseable — not this script's problem to diagnose
    }
    if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') continue;
    resolved.hash = '';
    found.add(resolved.toString());
  }
  return found;
}

/** One HEAD, a GET fallback if the server won't answer HEAD, no retries. */
async function checkUrl(url) {
  const opts = (method) => ({
    method,
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { 'User-Agent': USER_AGENT },
  });

  try {
    let res = await fetch(url, opts('HEAD'));
    if ([403, 405, 501].includes(res.status)) {
      res = await fetch(url, opts('GET'));
    }
    // A rate limit says nothing about whether the link is dead.
    if (res.status === 429) return { alive: true, status: res.status };
    if (res.status >= 200 && res.status < 400) return { alive: true, status: res.status };
    return { alive: false, status: res.status };
  } catch (e) {
    const why =
      e.name === 'TimeoutError' ? `no answer in ${TIMEOUT_MS / 1000}s` : String(e.message || e);
    return { alive: false, status: why };
  }
}

const pages = await collectPages();

// Fetch every page, extract its links, remember the first page each unique
// link was found on. A page that fails to fetch is a dead link in its own
// right — it is listed in the sitemap, so something should be there.
const foundOn = new Map();
const pageFailures = [];

await pool(pages, CONCURRENCY, async (page) => {
  let html;
  try {
    html = await fetchText(page);
  } catch (e) {
    pageFailures.push({ url: page, status: String(e.message || e) });
    return;
  }
  for (const link of extractLinks(html, page)) {
    if (!foundOn.has(link)) foundOn.set(link, page);
  }
});

const links = [...foundOn.keys()];
const results = await pool(links, CONCURRENCY, async (link) => ({
  url: link,
  page: foundOn.get(link),
  ...(await checkUrl(link)),
}));

const dead = [];
const unverifiable = [];

for (const failure of pageFailures) {
  dead.push({ url: failure.url, page: 'sitemap', status: failure.status });
}

for (const r of results) {
  if (r.alive) continue;
  if (UNVERIFIABLE_HOSTS.has(bareHost(r.url))) {
    unverifiable.push(r);
  } else {
    dead.push(r);
  }
}

for (const link of dead) {
  console.log(`✗ ${link.url}  (${link.status})  ← ${link.page}`);
}

if (unverifiable.length > 0) {
  console.log('');
  console.log('unverifiable (bot-blocked host, not counted as dead):');
  for (const link of unverifiable) {
    console.log(`~ ${link.url}  (${link.status})  ← ${link.page}`);
  }
}

console.log('');

if (dead.length > 0) {
  console.log(
    `${dead.length} dead link${dead.length === 1 ? '' : 's'} out of ${links.length} checked across ${pages.length} pages.`,
  );
  process.exit(1);
}

console.log(`✓ ${links.length} links across ${pages.length} pages`);
process.exit(0);
