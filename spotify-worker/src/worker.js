const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';
const ALLOWED_ORIGIN = 'https://riad.cc';

let cachedToken = null;
let tokenExpiry = 0;
let lastPlaying = null;

async function getAccessToken(env) {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: env.SPOTIFY_REFRESH_TOKEN,
      client_id: env.SPOTIFY_CLIENT_ID,
      client_secret: env.SPOTIFY_CLIENT_SECRET,
    }),
  });

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

function cors(origin) {
  const allowed = origin === ALLOWED_ORIGIN || origin.startsWith('http://localhost:');
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors(origin) });
    }

    try {
      const token = await getAccessToken(env);
      const headers = { Authorization: `Bearer ${token}` };
      const noCache = { headers, cf: { cacheTtl: 0 } };

      const nowRes = await fetch(NOW_PLAYING_URL, noCache);

      if (nowRes.status === 200) {
        const data = await nowRes.json();
        if (data.is_playing && data.item) {
          lastPlaying = {
            track: data.item.name,
            artist: data.item.artists.map(a => a.name).join(', '),
            url: data.item.external_urls.spotify,
          };
          return Response.json({ playing: true, ...lastPlaying }, { headers: cors(origin) });
        }
      }

      if (lastPlaying) {
        return Response.json({ playing: false, ...lastPlaying }, { headers: cors(origin) });
      }

      return Response.json({ playing: false, track: null }, { headers: cors(origin) });
    } catch {
      if (lastPlaying) {
        return Response.json({ playing: false, ...lastPlaying }, { headers: cors(origin) });
      }
      return Response.json({ playing: false, track: null }, { headers: cors(origin), status: 500 });
    }
  },
};
