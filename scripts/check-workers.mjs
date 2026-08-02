#!/usr/bin/env node
/**
 * Probes every Cloudflare Worker this site depends on.
 *
 * Everything on riad.cc that talks to a Worker fails soft: a dead endpoint
 * leaves a widget quietly absent instead of showing an error box. That is the
 * right call for a visitor and useless for the owner — nothing, anywhere, says
 * a Worker died. The spotify token could expire tonight and the only symptom
 * would be a line that stopped appearing.
 *
 * This is the thing that says it. Run on a schedule by
 * .github/workflows/health.yml; a red run is an email.
 *
 * The exit code is the whole interface: 0 means every Worker answered
 * correctly. Zero dependencies on purpose, so CI needs no npm install.
 *
 * Each Worker exposes GET /health that exercises its real dependency — the
 * Spotify token exchange, the Cloudflare GraphQL token, the Durable Object
 * bindings — rather than just proving the script is deployed. A 200 from the
 * public endpoint proves much less than it looks like it does.
 */

const TIMEOUT_MS = 15000;

const PROBES = [
  {
    name: 'spotify-now-playing',
    dir: 'spotify-worker',
    url: 'https://spotify-now-playing.riad-mrv.workers.dev/health',
    proves: 'the refresh token still exchanges for an access token',
    breaks: 'the now-playing line on the homepage',
  },
  {
    name: 'toy-api',
    dir: 'toy-worker',
    url: 'https://toy-api.riad-mrv.workers.dev/health',
    proves: 'both Durable Object bindings answer',
    breaks: 'the visitor number and the paper-airplane note box',
  },
  {
    name: 'poll-api',
    dir: 'poll-worker',
    url: 'https://poll-api.riad-mrv.workers.dev/health',
    proves: 'the POLL_ROOM binding survived the last deploy',
    breaks: '/poll',
  },
  {
    name: 'analytics-api',
    dir: 'analytics-worker',
    url: 'https://analytics-api.riad-mrv.workers.dev/health',
    proves: 'the Cloudflare Analytics API token is still valid',
    breaks: "/admin and the terminal's `perf` field column",
  },
];

/**
 * One request, no retries. At a probe every few hours a network blip costs one
 * email and a re-run; retrying costs the ability to tell a flaky Worker from a
 * healthy one, which is worse.
 */
async function probe(p) {
  let res;
  try {
    res = await fetch(p.url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'User-Agent': 'riad.cc-health-check' },
    });
  } catch (e) {
    const why =
      e.name === 'TimeoutError' ? `no answer in ${TIMEOUT_MS / 1000}s` : String(e.message || e);
    return { ...p, state: 'UNREACHABLE', detail: why };
  }

  const stale = (why) => ({
    ...p,
    state: 'STALE',
    detail: `${why} — the deployed script predates this repo. Run: npx wrangler deploy --cwd ${p.dir}`,
  });

  // The Worker is answering but has no /health route: the deployed script is
  // older than what is committed here. Worth flagging loudly — it means the
  // last edit to that Worker never shipped, and nothing else would notice.
  if (res.status === 404) return stale('no /health route');

  const text = await res.text().catch(() => '');
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    /* non-JSON body is itself a symptom; reported via detail below */
  }

  // Answered, but with something that is not a health payload at all. Same
  // diagnosis as a 404, different symptom: the deployed spotify worker, for
  // one, predates its own pathname check and returns now-playing JSON for
  // every path it is asked about.
  if (res.ok && body && !('ok' in body))
    return stale(`answered ${res.status} with a non-health body`);

  if (!res.ok || body?.ok !== true) {
    const detail = body?.error || body?.check || text.slice(0, 120) || '(empty body)';
    return { ...p, state: 'FAILING', detail: `HTTP ${res.status} — ${detail}` };
  }

  return { ...p, state: 'OK', detail: p.proves };
}

const results = await Promise.all(PROBES.map(probe));
const failed = results.filter((r) => r.state !== 'OK');
const width = Math.max(...results.map((r) => r.name.length));

console.log('');
for (const r of results) {
  const mark = r.state === 'OK' ? 'ok  ' : 'FAIL';
  console.log(`  ${mark}  ${r.name.padEnd(width)}  ${r.detail}`);
}
console.log('');

if (failed.length === 0) {
  console.log(`  all ${results.length} workers healthy`);
  process.exit(0);
}

// STALE and dead are different emergencies. A stale Worker is probably still
// serving visitors fine — it just isn't serving this repo's code, so the next
// edit anyone makes here is building on something that was never shipped.
for (const r of failed) {
  console.log(
    r.state === 'STALE'
      ? `  ${r.name}: STALE — deployed code is older than this repo. What it serves (${r.breaks}) may still work, but not from what is committed here.`
      : `  ${r.name}: ${r.state} — ${r.breaks} is down.`,
  );
}
console.log('');
console.log(`  ${failed.length} of ${results.length} workers need attention.`);
process.exit(1);
