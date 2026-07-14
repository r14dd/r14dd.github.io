/**
 * poll-api — Cloudflare Worker + Durable Object (SQLite-backed) for live
 * classroom polls.
 *
 * Architecture
 *   - The default export is a thin router. It validates input, enforces the
 *     admin key on /reset and /close, attaches CORS, and forwards the request
 *     to the per-session Durable Object (env.POLL_ROOM.idFromName(session)).
 *   - class PollRoom is the single source of truth for one poll session. Being
 *     single-threaded per object, its count increments are atomic with no
 *     read-modify-write races. State is held in memory and mirrored to the
 *     DO's SQLite-backed storage so it survives eviction; a 24h alarm
 *     self-cleans abandoned rooms.
 *
 * Runs fully offline under `wrangler dev` (the DO is emulated locally) — there
 * are no external calls.
 */

const VALID_CHOICES = new Set(['A', 'B', 'C', 'D']);
const ID_RE = /^[A-Za-z0-9._-]{1,64}$/;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const VOTE_CAP = 60;

// Per-session /vote flood guard (NAT-safe). The whole class sits behind ONE
// corporate NAT, so any per-IP limit tight enough to matter would lock out the
// room (~30 phones polling /state every 3s ≈ 600 req/min from one IP). Vote
// INFLATION is already bounded by VOTE_CAP + voterId dedup, so this is only a
// cheap backstop against a script hammering one poll: cap THIS session's write
// rate inside its own Durable Object. 300/60s is far above any real class
// (~30 students x a few rounds ≈ ≤120 vote requests) so it never blocks legit
// use. In-memory only — no storage writes, per DO instance.
const VOTE_RATE_LIMIT = 300;            // max /vote requests per session per window
const VOTE_RATE_WINDOW_MS = 60 * 1000;  // sliding-window length

const isId = (v) => typeof v === 'string' && ID_RE.test(v);

// CORS allow-list: prod site, any localhost / loopback port, and (only when
// env.ALLOW_LAN is enabled) private-LAN origins so phones can hit a laptop
// running `wrangler dev` during class. Browsers set the Origin header
// themselves, so this can't be spoofed cross-origin.
function cors(origin, env) {
  const o = origin || '';
  const lan =
    env && (env.ALLOW_LAN === 'true' || env.ALLOW_LAN === true || env.ALLOW_LAN === '1');
  const allowed =
    o === 'https://riad.cc' ||
    o.startsWith('http://localhost:') ||
    o.startsWith('http://127.0.0.1:') ||
    (lan && (o.startsWith('http://192.168.') || o.startsWith('http://10.')));
  return {
    'Access-Control-Allow-Origin': allowed ? o : 'https://riad.cc',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
  };
}

function json(data, origin, env, status = 200) {
  return Response.json(data, { status, headers: cors(origin, env) });
}

// Hand a request to the session's Durable Object. The action is the pathname;
// the caller's Origin rides along as ?o= so the DO can echo correct CORS.
function forward(env, session, path, origin, payload) {
  const id = env.POLL_ROOM.idFromName(session);
  const stub = env.POLL_ROOM.get(id);
  const url = 'https://do' + path + '?o=' + encodeURIComponent(origin || '');
  const init = { method: 'POST' };
  if (payload) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(payload);
  }
  return stub.fetch(url, init);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);
    const method = request.method;

    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(origin, env) });
    }

    try {
      // POST /vote {session, choice, voterId}
      if (method === 'POST' && url.pathname === '/vote') {
        const body = await request.json().catch(() => null);
        if (!body) return json({ error: 'Invalid JSON' }, origin, env, 400);
        const { session, choice, voterId } = body;
        if (!isId(session) || !isId(voterId)) {
          return json({ error: 'Invalid session or voterId' }, origin, env, 400);
        }
        if (!VALID_CHOICES.has(choice)) {
          return json({ error: 'Choice must be A, B, C, or D' }, origin, env, 400);
        }
        return forward(env, session, '/vote', origin, { choice, voterId });
      }

      // GET /results?s=SESSION
      if (method === 'GET' && url.pathname === '/results') {
        const session = url.searchParams.get('s');
        if (!isId(session)) return json({ error: 'Invalid session' }, origin, env, 400);
        return forward(env, session, '/results', origin);
      }

      // GET /state?s=SESSION  (counts-free; phones poll this for re-vote rounds)
      if (method === 'GET' && url.pathname === '/state') {
        const session = url.searchParams.get('s');
        if (!isId(session)) return json({ error: 'Invalid session' }, origin, env, 400);
        return forward(env, session, '/state', origin);
      }

      // POST /reset?s=SESSION  (Authorization: Bearer RESET_SECRET)
      if (method === 'POST' && url.pathname === '/reset') {
        const session = url.searchParams.get('s');
        if (!isId(session)) return json({ error: 'Invalid session' }, origin, env, 400);
        const authKey = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '') || url.searchParams.get('key');
        if (authKey !== env.RESET_SECRET) {
          return json({ error: 'Unauthorized' }, origin, env, 401);
        }
        return forward(env, session, '/reset', origin);
      }

      // POST /close?s=SESSION  (Authorization: Bearer RESET_SECRET)
      if (method === 'POST' && url.pathname === '/close') {
        const session = url.searchParams.get('s');
        if (!isId(session)) return json({ error: 'Invalid session' }, origin, env, 400);
        const authKey = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '') || url.searchParams.get('key');
        if (authKey !== env.RESET_SECRET) {
          return json({ error: 'Unauthorized' }, origin, env, 401);
        }
        return forward(env, session, '/close', origin);
      }

      return json({ error: 'Not found' }, origin, env, 404);
    } catch (e) {
      return json({ error: 'Internal error' }, origin, env, 500);
    }
  },
};

// ── Durable Object: one instance per poll session ──────────────────────────
export class PollRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.counts = { A: 0, B: 0, C: 0, D: 0 };
    this.voters = new Map(); // voterId -> choice
    this.open = true;
    this.generation = 0;
    // In-memory sliding window for the /vote flood guard. Deliberately NOT
    // persisted — it's a cheap per-DO-instance backstop that resets on eviction.
    this.voteWindowStart = 0;
    this.voteWindowCount = 0;
    // Hydrate from storage before any request is served.
    state.blockConcurrencyWhile(async () => {
      await this.load();
    });
  }

  async load() {
    const storage = this.state.storage;
    const counts = await storage.get('counts');
    if (counts) {
      this.counts = {
        A: counts.A || 0,
        B: counts.B || 0,
        C: counts.C || 0,
        D: counts.D || 0,
      };
    }
    const meta = await storage.get('meta');
    if (meta) {
      this.open = meta.open !== false;
      this.generation = meta.generation || 0;
    }
    const stored = await storage.list({ prefix: 'v:' });
    this.voters = new Map();
    for (const [key, choice] of stored) this.voters.set(key.slice(2), choice);
  }

  total() {
    return this.counts.A + this.counts.B + this.counts.C + this.counts.D;
  }

  persistMeta() {
    return this.state.storage.put('meta', {
      open: this.open,
      generation: this.generation,
    });
  }

  persistCounts() {
    return this.state.storage.put('counts', { ...this.counts });
  }

  // Self-clean abandoned rooms 24h after the last write.
  refreshAlarm() {
    return this.state.storage.setAlarm(Date.now() + ONE_DAY_MS);
  }

  reply(data, origin, status = 200) {
    return Response.json(data, { status, headers: cors(origin, this.env) });
  }

  async fetch(request) {
    const url = new URL(request.url);
    const origin = url.searchParams.get('o') || '';
    switch (url.pathname) {
      case '/vote': {
        const body = await request.json().catch(() => ({}));
        return this.vote(body.voterId, body.choice, origin);
      }
      case '/results':
        return this.reply(
          { ...this.counts, total: this.total(), open: this.open },
          origin
        );
      case '/state':
        return this.reply({ open: this.open, generation: this.generation }, origin);
      case '/reset':
        await this.reset();
        return this.reply({ ok: true }, origin);
      case '/close':
        await this.close();
        return this.reply({ ok: true, open: this.open }, origin);
      default:
        return this.reply({ error: 'Not found' }, origin, 404);
    }
  }

  // Per-session flood backstop for the write path. Slides a 60s window in
  // memory; returns true once this session exceeds VOTE_RATE_LIMIT /vote
  // requests within it. No storage work — it runs before anything is written.
  voteFlooding() {
    const t = Date.now();
    if (t - this.voteWindowStart >= VOTE_RATE_WINDOW_MS) {
      this.voteWindowStart = t;
      this.voteWindowCount = 0;
    }
    this.voteWindowCount += 1;
    return this.voteWindowCount > VOTE_RATE_LIMIT;
  }

  async vote(voterId, choice, origin) {
    // Flood guard first — before any validation, dedup, cap, or storage work.
    if (this.voteFlooding()) {
      return this.reply({ error: 'Too many requests' }, origin, 429);
    }
    if (!isId(voterId)) return this.reply({ error: 'Invalid voterId' }, origin, 400);
    if (!VALID_CHOICES.has(choice)) {
      return this.reply({ error: 'Invalid choice' }, origin, 400);
    }
    const prev = this.voters.get(voterId);
    if (prev) return this.reply({ error: 'Already voted', choice: prev }, origin, 409);
    if (!this.open) return this.reply({ ok: false, closed: true }, origin);
    if (this.total() >= VOTE_CAP) {
      // Cap reached — acknowledge without recording another vote.
      return this.reply({ ok: true, capped: true }, origin);
    }
    this.counts[choice]++;
    this.voters.set(voterId, choice);
    await this.persistCounts();
    await this.state.storage.put('v:' + voterId, choice);
    await this.refreshAlarm();
    return this.reply({ ok: true, choice }, origin);
  }

  // Wipe everything and bump the generation so phones detect the new round.
  async reset() {
    await this.state.storage.deleteAll();
    this.counts = { A: 0, B: 0, C: 0, D: 0 };
    this.voters = new Map();
    this.open = true;
    this.generation = this.generation + 1;
    await this.persistMeta();
    await this.refreshAlarm();
  }

  async close() {
    this.open = !this.open;
    await this.persistMeta();
    await this.refreshAlarm();
    return this.open;
  }

  // Fired ~24h after the last write: drop the room entirely.
  async alarm() {
    // Drop the room entirely: clear storage and reset in-memory state. We do NOT
    // re-persist anything, so an abandoned room leaves no residual rows behind.
    await this.state.storage.deleteAll();
    this.counts = { A: 0, B: 0, C: 0, D: 0 };
    this.voters = new Map();
    this.open = true;
    this.generation = 0;
  }
}
