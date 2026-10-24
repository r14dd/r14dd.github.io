/**
 * poll-api: Cloudflare Worker + Durable Object (SQLite-backed) for live
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
 * Runs fully offline under `wrangler dev` (the DO is emulated locally): there
 * are no external calls.
 */

const VALID_CHOICES = new Set(['A', 'B', 'C', 'D']);
const ID_RE = /^[A-Za-z0-9._-]{1,64}$/;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const VOTE_CAP = 60;

// Game mode scoring: a correct answer is worth 500 plus up to 500 more for
// speed (linear over the question's time limit, server clock only).
const GAME_BASE_POINTS = 500;
const GAME_SPEED_POINTS = 500;
const GAME_DEFAULT_LIMIT_MS = 20 * 1000;
const NICK_MAX = 16;
const BOARD_SIZE = 10;

// Printable, trimmed, length-capped nickname; '' when nothing usable is left.
function cleanNick(raw) {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/[\u0000-\u001f\u007f-\u009f<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, NICK_MAX);
}

// Constant-time secret comparison (Cloudflare Workers crypto.subtle extension).
const _enc = new TextEncoder();
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const ab = _enc.encode(a),
    bb = _enc.encode(b);
  if (ab.byteLength !== bb.byteLength) return false;
  return crypto.subtle.timingSafeEqual(ab, bb);
}

// Per-session /vote flood guard (NAT-safe). The whole class sits behind ONE
// corporate NAT, so any per-IP limit tight enough to matter would lock out the
// room (~30 phones polling /state every 3s ≈ 600 req/min from one IP). Vote
// INFLATION is already bounded by VOTE_CAP + voterId dedup, so this is only a
// cheap backstop against a script hammering one poll: cap THIS session's write
// rate inside its own Durable Object. 300/60s is far above any real class
// (~30 students x a few rounds ≈ ≤120 vote requests) so it never blocks legit
// use. In-memory only, no storage writes, per DO instance.
const VOTE_RATE_LIMIT = 300; // max /vote requests per session per window
const VOTE_RATE_WINDOW_MS = 60 * 1000; // sliding-window length

const isId = (v) => typeof v === 'string' && ID_RE.test(v);

// CORS allow-list: prod site, any localhost / loopback port, and (only when
// env.ALLOW_LAN is enabled) private-LAN origins so phones can hit a laptop
// running `wrangler dev` during class. Browsers set the Origin header
// themselves, so this can't be spoofed cross-origin.
function cors(origin, env) {
  const o = origin || '';
  const lan = env && (env.ALLOW_LAN === 'true' || env.ALLOW_LAN === true || env.ALLOW_LAN === '1');
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
    Vary: 'Origin',
  };
}

function json(data, origin, env, status = 200) {
  return Response.json(data, { status, headers: cors(origin, env) });
}

// Absorb polling storms before they reach the Durable Object: /state and
// /results are polled by every phone in the room, so a 1s edge cache caps DO
// reads at ~1 per second per session per colo, invisible next to the 3s
// client poll interval, but it stops a scripted GET flood from burning DO
// request quota. The cached copy is stored header-bare and CORS is re-derived
// per request, so one client's Origin never leaks into another's response.
async function cachedForward(env, ctx, session, path, origin) {
  const key = new Request('https://poll-api.cache' + path + '?s=' + encodeURIComponent(session));
  const cache = caches.default;
  const hit = await cache.match(key);
  if (hit) {
    return new Response(hit.body, {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...cors(origin, env) },
    });
  }
  const res = await forward(env, session, path, origin);
  if (res.status === 200) {
    const body = await res.clone().text();
    const copy = new Response(body, {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=1' },
    });
    ctx.waitUntil(cache.put(key, copy));
  }
  return res;
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
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);
    const method = request.method;

    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(origin, env) });
    }

    try {
      // GET /health: liveness probe for scripts/check-workers.mjs.
      //
      // Deliberately does NOT round-trip through a Durable Object: naming a
      // probe session would mint a namespace entry that then exists forever,
      // and this account's DO config is fragile enough (free-tier
      // new_sqlite_classes only) that leaving litter in it is not worth the
      // extra coverage. Checking the binding is present catches the realistic
      // failure (a deploy that drops or renames it) without persisting
      // anything.
      if (method === 'GET' && url.pathname === '/health') {
        const bound = typeof env.POLL_ROOM?.idFromName === 'function';
        return json(
          { ok: bound, check: 'durable-object-binding', binding: bound ? 'POLL_ROOM' : null },
          origin,
          env,
          bound ? 200 : 503,
        );
      }

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
        return cachedForward(env, ctx, session, '/results', origin);
      }

      // GET /state?s=SESSION  (counts-free; phones poll this for re-vote rounds)
      if (method === 'GET' && url.pathname === '/state') {
        const session = url.searchParams.get('s');
        if (!isId(session)) return json({ error: 'Invalid session' }, origin, env, 400);
        return cachedForward(env, ctx, session, '/state', origin);
      }

      // POST /reset?s=SESSION  (Authorization: Bearer RESET_SECRET)
      if (method === 'POST' && url.pathname === '/reset') {
        const session = url.searchParams.get('s');
        if (!isId(session)) return json({ error: 'Invalid session' }, origin, env, 400);
        const authKey = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
        if (!safeEqual(authKey, env.RESET_SECRET)) {
          return json({ error: 'Unauthorized' }, origin, env, 401);
        }
        return forward(env, session, '/reset', origin);
      }

      // POST /close?s=SESSION  (Authorization: Bearer RESET_SECRET)
      if (method === 'POST' && url.pathname === '/close') {
        const session = url.searchParams.get('s');
        if (!isId(session)) return json({ error: 'Invalid session' }, origin, env, 400);
        const authKey = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
        if (!safeEqual(authKey, env.RESET_SECRET)) {
          return json({ error: 'Unauthorized' }, origin, env, 401);
        }
        return forward(env, session, '/close', origin);
      }

      // ── Game mode (Kahoot-style quiz) ────────────────────────────────────
      // One session = one game. Phones join once with a nickname, then follow
      // the presenter's current question; /award scores a question.

      // POST /join {session, voterId, nick}
      if (method === 'POST' && url.pathname === '/join') {
        const body = await request.json().catch(() => null);
        if (!body) return json({ error: 'Invalid JSON' }, origin, env, 400);
        const { session, voterId, nick } = body;
        if (!isId(session) || !isId(voterId)) {
          return json({ error: 'Invalid session or voterId' }, origin, env, 400);
        }
        return forward(env, session, '/join', origin, { voterId, nick });
      }

      // POST /answer {session, voterId, pollId, choice}
      if (method === 'POST' && url.pathname === '/answer') {
        const body = await request.json().catch(() => null);
        if (!body) return json({ error: 'Invalid JSON' }, origin, env, 400);
        const { session, voterId, pollId, choice } = body;
        if (!isId(session) || !isId(voterId) || !isId(pollId)) {
          return json({ error: 'Invalid session, voterId or pollId' }, origin, env, 400);
        }
        if (!VALID_CHOICES.has(choice)) {
          return json({ error: 'Choice must be A, B, C, or D' }, origin, env, 400);
        }
        return forward(env, session, '/answer', origin, { voterId, pollId, choice });
      }

      // GET /game?s=SESSION  (counts-free; phones poll this to follow the presenter)
      // GET /board?s=SESSION (leaderboard + live counts; presenter polls this)
      if (method === 'GET' && (url.pathname === '/game' || url.pathname === '/board')) {
        const session = url.searchParams.get('s');
        if (!isId(session)) return json({ error: 'Invalid session' }, origin, env, 400);
        return cachedForward(env, ctx, session, url.pathname, origin);
      }

      // GET /me?s=SESSION&v=VOTERID  (per-player score; not cached)
      if (method === 'GET' && url.pathname === '/me') {
        const session = url.searchParams.get('s');
        const voterId = url.searchParams.get('v');
        if (!isId(session) || !isId(voterId)) {
          return json({ error: 'Invalid session or voterId' }, origin, env, 400);
        }
        return forward(env, session, '/me', origin, { voterId });
      }

      // POST /current?s=SESSION {pollId, n, limit}  (admin: presenter landed on a question)
      // POST /award?s=SESSION {pollId, correct}     (admin: reveal + score a question)
      if (method === 'POST' && (url.pathname === '/current' || url.pathname === '/award')) {
        const session = url.searchParams.get('s');
        if (!isId(session)) return json({ error: 'Invalid session' }, origin, env, 400);
        const authKey = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
        if (!safeEqual(authKey, env.RESET_SECRET)) {
          return json({ error: 'Unauthorized' }, origin, env, 401);
        }
        const body = await request.json().catch(() => null);
        if (!body || !isId(body.pollId)) {
          return json({ error: 'Invalid pollId' }, origin, env, 400);
        }
        return forward(env, session, url.pathname, origin, body);
      }

      return json({ error: 'Not found' }, origin, env, 404);
    } catch {
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
    // persisted: it's a cheap per-DO-instance backstop that resets on eviction.
    this.voteWindowStart = 0;
    this.voteWindowCount = 0;
    // Game mode (all in the g: storage namespace; see load()).
    this.players = new Map(); // voterId -> {nick, score, delta}
    this.questions = new Map(); // pollId -> {n, openedAt, limit, awarded, correct}
    this.answers = new Map(); // pollId -> Map(voterId -> {choice, t})
    this.current = null; // pollId the presenter is on
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
    // Game keys: g:cur, g:p:<voterId>, g:q:<pollId>, g:a:<pollId>:<voterId>
    // (ids never contain ':', so splitting on it is safe).
    const game = await storage.list({ prefix: 'g:' });
    for (const [key, value] of game) {
      const [, kind, a, b] = key.split(':');
      if (kind === 'cur') this.current = value;
      else if (kind === 'p') this.players.set(a, value);
      else if (kind === 'q') this.questions.set(a, value);
      else if (kind === 'a') {
        if (!this.answers.has(a)) this.answers.set(a, new Map());
        this.answers.get(a).set(b, value);
      }
    }
  }

  clearGame() {
    this.players = new Map();
    this.questions = new Map();
    this.answers = new Map();
    this.current = null;
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
        return this.reply({ ...this.counts, total: this.total(), open: this.open }, origin);
      case '/state':
        return this.reply({ open: this.open, generation: this.generation }, origin);
      case '/reset':
        await this.reset();
        return this.reply({ ok: true }, origin);
      case '/close':
        await this.close();
        return this.reply({ ok: true, open: this.open }, origin);
      case '/join': {
        const body = await request.json().catch(() => ({}));
        return this.join(body.voterId, body.nick, origin);
      }
      case '/answer': {
        const body = await request.json().catch(() => ({}));
        return this.answer(body.voterId, body.pollId, body.choice, origin);
      }
      case '/current': {
        const body = await request.json().catch(() => ({}));
        return this.setCurrent(body, origin);
      }
      case '/award': {
        const body = await request.json().catch(() => ({}));
        return this.award(body.pollId, body.correct, origin);
      }
      case '/game':
        return this.reply(this.gameState(), origin);
      case '/board':
        return this.reply(this.board(), origin);
      case '/me': {
        const body = await request.json().catch(() => ({}));
        return this.me(body.voterId, origin);
      }
      default:
        return this.reply({ error: 'Not found' }, origin, 404);
    }
  }

  // Per-session flood backstop for the write path. Slides a 60s window in
  // memory; returns true once this session exceeds VOTE_RATE_LIMIT /vote
  // requests within it. No storage work, it runs before anything is written.
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
    // Flood guard first, before any validation, dedup, cap, or storage work.
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
      // Cap reached: acknowledge without recording another vote.
      return this.reply({ ok: true, capped: true }, origin);
    }
    this.counts[choice]++;
    this.voters.set(voterId, choice);
    await this.persistCounts();
    await this.state.storage.put('v:' + voterId, choice);
    await this.refreshAlarm();
    return this.reply({ ok: true, choice }, origin);
  }

  // ── Game mode ───────────────────────────────────────────────────────────

  // The presenter's current question as phones see it. No counts, and the
  // correct letter only once the question has been awarded.
  gameState() {
    const q = this.current ? this.questions.get(this.current) : null;
    return {
      current: q ? this.current : null,
      n: q ? q.n : 0,
      openedAt: q ? q.openedAt : 0,
      limit: q ? q.limit : GAME_DEFAULT_LIMIT_MS,
      awarded: q ? q.awarded : false,
      correct: q && q.awarded ? q.correct : null,
      open: this.open,
      generation: this.generation,
      players: this.players.size,
      now: Date.now(),
    };
  }

  ranked() {
    return [...this.players.entries()]
      .map(([voterId, p]) => ({ voterId, ...p }))
      .sort((x, y) => y.score - x.score || x.nick.localeCompare(y.nick));
  }

  // Presenter view: top of the board plus live counts for the current question.
  board() {
    const q = this.current ? this.questions.get(this.current) : null;
    const counts = { A: 0, B: 0, C: 0, D: 0 };
    const answers = this.current ? this.answers.get(this.current) : null;
    if (answers) for (const a of answers.values()) counts[a.choice]++;
    return {
      ...this.gameState(),
      answered: answers ? answers.size : 0,
      counts,
      correct: q && q.awarded ? q.correct : null,
      top: this.ranked()
        .slice(0, BOARD_SIZE)
        .map(({ nick, score, delta }) => ({ nick, score, delta })),
    };
  }

  me(voterId, origin) {
    const p = this.players.get(voterId);
    if (!p) return this.reply({ error: 'Not joined' }, origin, 404);
    const rank = this.ranked().findIndex((r) => r.voterId === voterId) + 1;
    const answers = this.current ? this.answers.get(this.current) : null;
    const mine = answers ? answers.get(voterId) : null;
    return this.reply(
      {
        nick: p.nick,
        score: p.score,
        delta: p.delta,
        rank,
        of: this.players.size,
        choice: mine ? mine.choice : null,
      },
      origin,
    );
  }

  async join(voterId, rawNick, origin) {
    if (this.voteFlooding()) return this.reply({ error: 'Too many requests' }, origin, 429);
    if (!isId(voterId)) return this.reply({ error: 'Invalid voterId' }, origin, 400);
    const nick = cleanNick(rawNick);
    if (!nick) return this.reply({ error: 'Nickname required' }, origin, 400);
    for (const [id, p] of this.players) {
      if (id !== voterId && p.nick.toLowerCase() === nick.toLowerCase()) {
        return this.reply({ error: 'Nickname taken' }, origin, 409);
      }
    }
    const prev = this.players.get(voterId);
    if (!prev && this.players.size >= VOTE_CAP) {
      return this.reply({ error: 'Game full' }, origin, 403);
    }
    const player = { nick, score: prev ? prev.score : 0, delta: prev ? prev.delta : 0 };
    this.players.set(voterId, player);
    await this.state.storage.put('g:p:' + voterId, player);
    await this.refreshAlarm();
    return this.reply({ ok: true, nick }, origin);
  }

  // Presenter landed on a question. Idempotent per pollId: revisiting a slide
  // keeps its original start time, answers, and awarded state.
  async setCurrent(body, origin) {
    const { pollId } = body;
    const n = Math.max(2, Math.min(4, parseInt(body.n, 10) || 4));
    let limit = parseInt(body.limit, 10) || GAME_DEFAULT_LIMIT_MS;
    limit = Math.max(5000, Math.min(120000, limit));
    if (!this.questions.has(pollId)) {
      const q = { n, openedAt: Date.now(), limit, awarded: false, correct: null };
      this.questions.set(pollId, q);
      await this.state.storage.put('g:q:' + pollId, q);
    }
    this.current = pollId;
    await this.state.storage.put('g:cur', pollId);
    await this.refreshAlarm();
    return this.reply({ ok: true, ...this.gameState() }, origin);
  }

  async answer(voterId, pollId, choice, origin) {
    if (this.voteFlooding()) return this.reply({ error: 'Too many requests' }, origin, 429);
    if (!isId(voterId) || !isId(pollId)) return this.reply({ error: 'Invalid id' }, origin, 400);
    if (!VALID_CHOICES.has(choice)) return this.reply({ error: 'Invalid choice' }, origin, 400);
    if (!this.players.has(voterId)) return this.reply({ error: 'Not joined' }, origin, 403);
    const q = this.questions.get(pollId);
    if (!q || pollId !== this.current) return this.reply({ ok: false, closed: true }, origin);
    const answers = this.answers.get(pollId) || new Map();
    const prev = answers.get(voterId);
    if (prev) return this.reply({ error: 'Already answered', choice: prev.choice }, origin, 409);
    if (q.awarded || !this.open) return this.reply({ ok: false, closed: true }, origin);
    const entry = { choice, t: Date.now() - q.openedAt };
    answers.set(voterId, entry);
    this.answers.set(pollId, answers);
    await this.state.storage.put('g:a:' + pollId + ':' + voterId, entry);
    await this.refreshAlarm();
    return this.reply({ ok: true, choice }, origin);
  }

  // Reveal + score a question exactly once; a repeat call changes nothing.
  async award(pollId, correct, origin) {
    const q = this.questions.get(pollId);
    if (!q) return this.reply({ error: 'Unknown question' }, origin, 404);
    if (!VALID_CHOICES.has(correct)) return this.reply({ error: 'Invalid correct' }, origin, 400);
    if (q.awarded) return this.reply({ ok: true, already: true, correct: q.correct }, origin);
    q.awarded = true;
    q.correct = correct;
    const answers = this.answers.get(pollId) || new Map();
    const writes = { ['g:q:' + pollId]: q };
    for (const [voterId, p] of this.players) {
      const a = answers.get(voterId);
      let delta = 0;
      if (a && a.choice === correct) {
        const speed = Math.max(0, 1 - a.t / q.limit);
        delta = GAME_BASE_POINTS + Math.round(GAME_SPEED_POINTS * speed);
      }
      p.delta = delta;
      p.score += delta;
      writes['g:p:' + voterId] = p;
    }
    await this.state.storage.put(writes);
    await this.refreshAlarm();
    return this.reply({ ok: true, correct }, origin);
  }

  // Wipe everything and bump the generation so phones detect the new round.
  async reset() {
    await this.state.storage.deleteAll();
    this.clearGame();
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
    this.clearGame();
    this.counts = { A: 0, B: 0, C: 0, D: 0 };
    this.voters = new Map();
    this.open = true;
    this.generation = 0;
  }
}
