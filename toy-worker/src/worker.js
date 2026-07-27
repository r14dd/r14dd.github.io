export class VisitorCounter {
  constructor(state) {
    this.state = state;
  }

  async fetch(request) {
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

export class SongRelay {
  constructor(state) {
    this.state = state;
  }

  async fetch(request) {
    if (request.method === 'GET') {
      const song = await this.state.storage.get('song');
      const ts = await this.state.storage.get('timestamp');
      return new Response(JSON.stringify({ song: song || null, timestamp: ts || null }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'POST') {
      const { title, artist } = await request.json();
      if (!title || !artist) return new Response('Bad Request', { status: 400 });
      await this.state.storage.put('song', { title, artist });
      await this.state.storage.put('timestamp', Date.now());
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404 });
  }
}

export class PhoneRoom {
  constructor(state) {
    this.state = state;
    this.desktop = null;
    this.phone = null;
    this.lastActivity = Date.now();
  }

  async fetch(request) {
    const url = new URL(request.url);
    const role = url.searchParams.get('role');
    const upgrade = request.headers.get('Upgrade');

    if (!upgrade || upgrade !== 'websocket') {
      return new Response(JSON.stringify({ hasDesktop: !!this.desktop, hasPhone: !!this.phone }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    if (role === 'desktop') {
      if (this.desktop) {
        server.accept();
        server.send(JSON.stringify({ type: 'error', message: 'room occupied' }));
        server.close(1000);
        return new Response(null, { status: 101, webSocket: client });
      }
      this.desktop = server;
      this.setupDesktop(server);
    } else if (role === 'phone') {
      if (this.phone) {
        server.accept();
        server.send(JSON.stringify({ type: 'error', message: "someone's already driving" }));
        server.close(1000);
        return new Response(null, { status: 101, webSocket: client });
      }
      this.phone = server;
      this.setupPhone(server);
    } else {
      server.accept();
      server.send(JSON.stringify({ type: 'error', message: 'invalid role' }));
      server.close(1000);
      return new Response(null, { status: 101, webSocket: client });
    }

    this.lastActivity = Date.now();
    this.scheduleIdle();
    return new Response(null, { status: 101, webSocket: client });
  }

  setupDesktop(ws) {
    ws.accept();
    ws.send(JSON.stringify({ type: 'connected', role: 'desktop' }));

    ws.addEventListener('message', (e) => {
      this.lastActivity = Date.now();
      if (this.phone)
        try {
          this.phone.send(e.data);
        } catch {}
    });

    ws.addEventListener('close', () => {
      this.desktop = null;
      if (this.phone)
        try {
          this.phone.send(JSON.stringify({ type: 'desktop-left' }));
        } catch {}
    });
  }

  setupPhone(ws) {
    ws.accept();
    ws.send(JSON.stringify({ type: 'connected', role: 'phone' }));
    if (this.desktop) {
      try {
        this.desktop.send(JSON.stringify({ type: 'phone-joined' }));
      } catch {}
    }

    ws.addEventListener('message', (e) => {
      this.lastActivity = Date.now();
      if (this.desktop)
        try {
          this.desktop.send(e.data);
        } catch {}
    });

    ws.addEventListener('close', () => {
      this.phone = null;
      if (this.desktop)
        try {
          this.desktop.send(JSON.stringify({ type: 'phone-left' }));
        } catch {}
    });
  }

  scheduleIdle() {
    if (this._idleAlarm) return;
    this._idleAlarm = true;
    setTimeout(() => {
      this._idleAlarm = false;
      if (Date.now() - this.lastActivity > 5 * 60 * 1000) {
        if (this.desktop)
          try {
            this.desktop.close(1000, 'idle');
          } catch {}
        if (this.phone)
          try {
            this.phone.close(1000, 'idle');
          } catch {}
        this.desktop = null;
        this.phone = null;
      } else {
        this.scheduleIdle();
      }
    }, 60 * 1000);
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

    if (path === '/visitor/increment' && request.method === 'POST') {
      const id = env.COUNTER.idFromName('global');
      res = await env.COUNTER.get(id).fetch(request);
    } else if (path === '/relay' && (request.method === 'GET' || request.method === 'POST')) {
      const id = env.RELAY.idFromName('global');
      res = await env.RELAY.get(id).fetch(request);
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
    } else if (path === '/room') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('Bad Request', { status: 400, headers });
      const id = env.ROOMS.idFromName(code);
      return env.ROOMS.get(id).fetch(request);
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
