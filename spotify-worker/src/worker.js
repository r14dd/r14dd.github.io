const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';
const RECENTLY_PLAYED_URL = 'https://api.spotify.com/v1/me/player/recently-played?limit=5';
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

      function parseTrack(item) {
        const images = item.album?.images || [];
        return {
          track: item.name,
          artist: item.artists.map(a => a.name).join(', '),
          url: item.external_urls.spotify,
          cover: (images.find(i => i.width === 300) || images[0])?.url || null,
        };
      }

      let result = null;
      const nowRes = await fetch(NOW_PLAYING_URL, noCache);
      if (nowRes.status === 200) {
        const data = await nowRes.json();
        if (data.is_playing && data.item) {
          lastPlaying = parseTrack(data.item);
          result = {
            playing: true,
            ...lastPlaying,
            progress: data.progress_ms || 0,
            duration: data.item.duration_ms || 0,
          };
        }
      }

      let recent = [];
      const recentRes = await fetch(RECENTLY_PLAYED_URL, noCache);
      if (recentRes.status === 200) {
        const recentData = await recentRes.json();
        if (recentData.items) {
          recent = recentData.items.map(i => parseTrack(i.track));
        }
      }

      if (!result && recent.length > 0) {
        lastPlaying = recent[0];
        result = { playing: false, ...recent[0] };
      }

      if (!result && lastPlaying) {
        result = { playing: false, ...lastPlaying };
      }

      if (!result) {
        return Response.json({ playing: false, track: null, recent: [] }, { headers: cors(origin) });
      }

      // Don't repeat the main track as the first history item
      if (recent.length > 0 && recent[0].url === result.url) {
        recent = recent.slice(1);
      }

      result.recent = recent;
      return Response.json(result, { headers: cors(origin) });
    } catch {
      if (lastPlaying) {
        return Response.json({ playing: false, ...lastPlaying, recent: [] }, { headers: cors(origin) });
      }
      return Response.json({ playing: false, track: null, recent: [] }, { headers: cors(origin), status: 500 });
    }
  },
};
