const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';
const ALLOWED_ORIGIN = 'https://riad.cc';

let cachedToken = null;
let tokenExpiry = 0;
let lastPlaying = null;
let tokenCooldownUntil = 0;

let cachedResult = null;
let cachedResultTime = 0;
const CACHE_TTL = 15000;

async function getAccessToken(env) {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  if (Date.now() < tokenCooldownUntil) throw new Error('Token refresh in cooldown');

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
  if (!data.access_token) {
    tokenCooldownUntil = Date.now() + 60000;
    throw new Error('Token refresh failed');
  }
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

function cors(origin) {
  const allowed = origin === ALLOWED_ORIGIN || origin.startsWith('http://localhost:');
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET',
    Vary: 'Origin',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  };
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors(origin) });
    }

    if (request.method !== 'GET' || (url.pathname !== '/' && url.pathname !== '')) {
      return new Response('Not Found', { status: 404, headers: cors(origin) });
    }

    if (cachedResult && Date.now() - cachedResultTime < CACHE_TTL) {
      return Response.json(cachedResult, { headers: cors(origin) });
    }

    try {
      const token = await getAccessToken(env);
      const headers = { Authorization: `Bearer ${token}` };
      const noCache = { headers, cf: { cacheTtl: 0 } };

      function parseTrack(item) {
        const images = item.album?.images || [];
        return {
          track: item.name,
          artist: item.artists.map((a) => a.name).join(', '),
          url: item.external_urls.spotify,
          cover: (images.find((i) => i.width === 300) || images[0])?.url || null,
        };
      }

      let result = null;
      const nowRes = await fetch(NOW_PLAYING_URL, noCache);
      if (nowRes.status === 200) {
        const data = await nowRes.json();
        if (data.is_playing && data.item) {
          const track = parseTrack(data.item);
          if (env.LAST_PLAYED && (!lastPlaying || lastPlaying.url !== track.url)) {
            ctx.waitUntil(env.LAST_PLAYED.put('last', JSON.stringify(track)));
          }
          lastPlaying = track;
          result = {
            playing: true,
            ...lastPlaying,
            progress: data.progress_ms || 0,
            duration: data.item.duration_ms || 0,
          };
        }
      }

      if (!result) {
        if (!lastPlaying && env.LAST_PLAYED) {
          lastPlaying = await env.LAST_PLAYED.get('last', 'json');
        }
        if (lastPlaying) {
          result = { playing: false, ...lastPlaying };
        }
      }

      if (!result) {
        result = { playing: false, track: null, topTracks: [] };
      } else {
        result.topTracks = [];
      }

      cachedResult = result;
      cachedResultTime = Date.now();
      return Response.json(result, { headers: cors(origin) });
    } catch (e) {
      console.error(e);
      if (cachedResult) {
        return Response.json(cachedResult, { headers: cors(origin) });
      }
      if (lastPlaying) {
        return Response.json(
          { playing: false, ...lastPlaying, topTracks: [] },
          { headers: cors(origin) },
        );
      }
      return Response.json(
        { playing: false, track: null, topTracks: [] },
        { headers: cors(origin), status: 500 },
      );
    }
  },
};
