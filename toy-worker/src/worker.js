export class VisitorCounter {
  constructor(state) {
    this.state = state;
  }

  async fetch(request) {
    // GET reads without incrementing. The health probe needs to prove the
    // binding and the storage work, and it runs on a schedule — it must not
    // inflate the visitor number every time it does.
    if (request.method === 'GET') {
      const count = (await this.state.storage.get('count')) || 0;
      return new Response(JSON.stringify({ number: count }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }
    let count = (await this.state.storage.get('count')) || 0;
    count++;
    await this.state.storage.put('count', count);
    return new Response(JSON.stringify({ number: count }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export class MessageBox {
  constructor(state) {
    this.state = state;
    this.sql = state.storage.sql;
  }

  ensureTable() {
    this.sql.exec(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      contact TEXT,
      ip TEXT,
      created_at INTEGER NOT NULL
    )`);
  }

  async fetch(request) {
    this.ensureTable();

    if (request.method === 'POST') {
      const { text, contact, honey } = await request.json();
      if (honey) return new Response(JSON.stringify({ ok: true }));
      if (!text || typeof text !== 'string' || text.length > 280) {
        return new Response('Bad Request', { status: 400 });
      }
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const hourAgo = Date.now() - 3600000;
      const recent = this.sql
        .exec('SELECT COUNT(*) as cnt FROM messages WHERE ip = ? AND created_at > ?', ip, hourAgo)
        .one();
      if (recent.cnt >= 3) {
        return new Response(JSON.stringify({ error: 'slow down' }), { status: 429 });
      }
      this.sql.exec(
        'INSERT INTO messages (text, contact, ip, created_at) VALUES (?, ?, ?, ?)',
        text,
        contact || null,
        ip,
        Date.now(),
      );
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'GET') {
      // Count-only mode for the health probe. The message list is admin-gated
      // upstream and carries visitor contact details; /health is public, so it
      // gets a number and nothing else.
      if (new URL(request.url).searchParams.get('count') === '1') {
        const row = this.sql.exec('SELECT COUNT(*) as n FROM messages').one();
        return new Response(JSON.stringify({ count: row.n }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const messages = this.sql
        .exec(
          'SELECT id, text, contact, created_at FROM messages ORDER BY created_at DESC LIMIT 50',
        )
        .toArray();
      return new Response(JSON.stringify({ messages }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'DELETE') {
      const id = Number(new URL(request.url).searchParams.get('id'));
      if (!Number.isInteger(id) || id <= 0) {
        return new Response(JSON.stringify({ error: 'bad id' }), { status: 400 });
      }
      this.sql.exec('DELETE FROM messages WHERE id = ?', id);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404 });
  }
}

function cors(request) {
  const origin = request.headers.get('Origin') || '';
  const allowed =
    origin === 'https://riad.cc' ||
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:');
  return {
    'Access-Control-Allow-Origin': allowed ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export default {
  async fetch(request, env) {
    const headers = cors(request);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    let res;

    // Liveness probe for scripts/check-workers.mjs. Reaches into both Durable
    // Objects read-only, because the failure worth catching is a deploy that
    // drops a binding or a migration that leaves a namespace unusable — the
    // worker script itself would still answer, and every widget that depends
    // on it fails soft, so nothing on the site would say a word.
    if (path === '/health' && request.method === 'GET') {
      try {
        const counter = await env.COUNTER.get(env.COUNTER.idFromName('global')).fetch(
          new Request('https://do/health', { method: 'GET' }),
        );
        const box = await env.MESSAGES.get(env.MESSAGES.idFromName('global')).fetch(
          new Request('https://do/health?count=1', { method: 'GET' }),
        );
        const ok = counter.ok && box.ok;
        return new Response(
          JSON.stringify({
            ok,
            check: 'durable-objects',
            counter: counter.status,
            messages: box.status,
          }),
          { status: ok ? 200 : 503, headers: { ...headers, 'Content-Type': 'application/json' } },
        );
      } catch (e) {
        return new Response(
          JSON.stringify({
            ok: false,
            check: 'durable-objects',
            error: String(e.message || e).slice(0, 200),
          }),
          { status: 503, headers: { ...headers, 'Content-Type': 'application/json' } },
        );
      }
    }

    if (path === '/visitor/increment' && request.method === 'POST') {
      const id = env.COUNTER.idFromName('global');
      res = await env.COUNTER.get(id).fetch(request);
    } else if (path === '/message' && request.method === 'POST') {
      const id = env.MESSAGES.idFromName('global');
      res = await env.MESSAGES.get(id).fetch(request);
    } else if (path === '/messages' && (request.method === 'GET' || request.method === 'DELETE')) {
      const key = url.searchParams.get('key');
      if (!key || !env.ADMIN_KEY || !safeEqual(key, env.ADMIN_KEY)) {
        return new Response('Unauthorized', { status: 401, headers });
      }
      const id = env.MESSAGES.idFromName('global');
      res = await env.MESSAGES.get(id).fetch(request);
    } else {
      return new Response('Not Found', { status: 404, headers });
    }

    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  },
};
