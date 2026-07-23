/**
 * analytics-api — Cloudflare Worker proxy for the riad.cc /admin dashboard.
 *
 * The static /admin page cannot call the Cloudflare GraphQL Analytics API
 * directly (the API token would be public and the API has no browser CORS),
 * so this worker holds the token as a secret, runs the RUM (Web Analytics)
 * queries, and returns a compact normalized JSON summary.
 *
 *   GET /summary?range=24h|7d|30d   (Authorization: Bearer <ADMIN_KEY>)
 *
 * Responses are cached at the edge for 5 minutes per range — the GraphQL API
 * is rate-limited and the numbers only move that fast anyway. Auth is checked
 * before the cache so the key is always required.
 */

const GRAPHQL_URL = 'https://api.cloudflare.com/client/v4/graphql';
const CACHE_TTL_S = 300;
const RANGES = { '24h': 24 * 3600 * 1000, '7d': 7 * 86400 * 1000, '30d': 30 * 86400 * 1000 };

// Constant-time secret comparison (Cloudflare Workers crypto.subtle extension).
const _enc = new TextEncoder();
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const ab = _enc.encode(a),
    bb = _enc.encode(b);
  if (ab.byteLength !== bb.byteLength) return false;
  return crypto.subtle.timingSafeEqual(ab, bb);
}

// CORS allow-list: prod site + local dev. Same policy as poll-api.
function cors(origin) {
  const o = origin || '';
  const allowed =
    o === 'https://riad.cc' || o.startsWith('http://localhost:') || o.startsWith('http://127.0.0.1:');
  return {
    'Access-Control-Allow-Origin': allowed ? o : 'https://riad.cc',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(body, status, corsHeaders, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders, ...extra },
  });
}

// One aliased GraphQL document: a time series plus five breakdowns. `count` is
// page loads, `sum.visits` is visits. Breakdowns are over-fetched (limit 15)
// and trimmed after sorting by visits, since orderBy count_DESC is the only
// ordering guaranteed across datasets.
function buildQuery(seriesDim) {
  const breakdown = (dim) => `
    ${dim}: rumPageloadEventsAdaptiveGroups(
      filter: $filter, limit: 15, orderBy: [count_DESC]
    ) { count sum { visits } dimensions { metric: ${dim} } }`;
  return `query Summary($accountTag: string, $filter: AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject) {
    viewer {
      accounts(filter: { accountTag: $accountTag }) {
        total: rumPageloadEventsAdaptiveGroups(filter: $filter, limit: 1) {
          count sum { visits }
        }
        series: rumPageloadEventsAdaptiveGroups(
          filter: $filter, limit: 744, orderBy: [${seriesDim}_ASC]
        ) { count sum { visits } dimensions { t: ${seriesDim} } }
        ${breakdown('requestPath')}
        ${breakdown('refererHost')}
        ${breakdown('countryName')}
        ${breakdown('userAgentBrowser')}
        ${breakdown('deviceType')}
      }
    }
  }`;
}

const topN = (groups, n = 8) =>
  (groups || [])
    .map((g) => ({ label: g.dimensions.metric || '(none)', visits: g.sum.visits, views: g.count }))
    .sort((a, b) => b.visits - a.visits || b.views - a.views)
    .slice(0, n);

// Zero-fill the series so charts get one point per bucket even for empty hours.
function fillSeries(groups, from, to, hourly) {
  const byKey = new Map(
    (groups || []).map((g) => [g.dimensions.t, { visits: g.sum.visits, views: g.count }]),
  );
  const out = [];
  const step = hourly ? 3600 * 1000 : 86400 * 1000;
  for (let t = from; t < to; t += step) {
    const d = new Date(t);
    const key = hourly ? d.toISOString().slice(0, 13) + ':00:00Z' : d.toISOString().slice(0, 10);
    const hit = byKey.get(key);
    out.push({ t: key, visits: hit ? hit.visits : 0, views: hit ? hit.views : 0 });
  }
  return out;
}

async function fetchSummary(env, range) {
  const now = Date.now();
  const hourly = range === '24h';
  // Hour-align so cache keys and buckets are stable within the TTL window.
  const to = Math.ceil(now / (3600 * 1000)) * 3600 * 1000;
  const from = hourly
    ? to - RANGES[range]
    : Date.parse(new Date(to - RANGES[range]).toISOString().slice(0, 10));
  // The account has a single Web Analytics site, so account + time range alone
  // already scopes correctly; SITE_TAG narrows it further only when set.
  const filters = [
    { datetime_geq: new Date(from).toISOString() },
    { datetime_lt: new Date(to).toISOString() },
  ];
  if (env.SITE_TAG) filters.push({ siteTag: env.SITE_TAG });

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.ANALYTICS_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: buildQuery(hourly ? 'datetimeHour' : 'date'),
      variables: {
        accountTag: env.ACCOUNT_TAG,
        filter: { AND: filters },
      },
    }),
  });
  const body = await res.json();
  if (!res.ok || body.errors?.length) {
    throw new Error(body.errors?.[0]?.message || `GraphQL HTTP ${res.status}`);
  }

  const acc = body.data?.viewer?.accounts?.[0] || {};
  return {
    range,
    from: new Date(from).toISOString(),
    to: new Date(to).toISOString(),
    totals: {
      visits: acc.total?.[0]?.sum.visits || 0,
      views: acc.total?.[0]?.count || 0,
    },
    series: fillSeries(acc.series, from, to, hourly),
    paths: topN(acc.requestPath),
    referers: topN(acc.refererHost),
    countries: topN(acc.countryName),
    browsers: topN(acc.userAgentBrowser),
    devices: topN(acc.deviceType, 4),
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = cors(request.headers.get('Origin'));

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
    if (request.method !== 'GET' || url.pathname !== '/summary') {
      return json({ error: 'not found' }, 404, corsHeaders);
    }

    const auth = request.headers.get('Authorization') || '';
    const key = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!env.ADMIN_KEY || !safeEqual(key, env.ADMIN_KEY)) {
      return json({ error: 'unauthorized' }, 401, corsHeaders);
    }

    const range = url.searchParams.get('range') || '7d';
    if (!RANGES[range]) return json({ error: 'bad range' }, 400, corsHeaders);

    // Edge-cache per range (auth already passed). The cache key is a synthetic
    // URL — the real request carries an Authorization header, which the Cache
    // API refuses to store.
    const cacheKey = new Request(`https://analytics-api.cache/summary?range=${range}`);
    const cache = caches.default;
    const hit = await cache.match(cacheKey);
    if (hit) {
      const cached = new Response(hit.body, hit);
      Object.entries(corsHeaders).forEach(([k, v]) => cached.headers.set(k, v));
      return cached;
    }

    try {
      const summary = await fetchSummary(env, range);
      const res = json(summary, 200, corsHeaders, {
        'Cache-Control': `public, max-age=${CACHE_TTL_S}`,
      });
      ctx.waitUntil(cache.put(cacheKey, res.clone()));
      return res;
    } catch (err) {
      return json({ error: String(err.message || err).slice(0, 300) }, 502, corsHeaders);
    }
  },
};
