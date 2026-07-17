const SPOTIFY_API = 'https://spotify-now-playing.riad-mrv.workers.dev';

const spotifyLabels: Record<string, { playing: string; last: string; history: string; recent: string }> = {
  en: { playing: 'Currently listening to', last: 'Last listened to', history: 'Top this month', recent: 'Recently played' },
  ru: { playing: 'Сейчас слушает', last: 'Последний раз слушал', history: 'Топ за месяц', recent: 'Недавно слушал' },
  az: { playing: 'Hazırda dinləyir', last: 'Son dinlədiyi', history: 'Bu ayın ən çox dinlənilənləri', recent: 'Son dinlənilənlər' },
};

let _spotifyProgress: { start: number; offset: number; duration: number } | null = null;
let _spotifyTimer: ReturnType<typeof setInterval> | null = null;
let _lastTrackName: string | null = null;
let _spotifyFirstRender = true;
let _spotifyLastPayload = '';
let _spotifyFails = 0;
let _spotifySkipTicks = 0;

function _escHtml(s: any) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _safeSpotifyUrl(u: any) {
  return typeof u === 'string' && u.startsWith('https://open.spotify.com/') ? u : '#';
}

function fmtTime(ms: number) {
  let s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  s = s % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

export function renderSpotify(data: any) {
  const el = document.getElementById('spotify-line');
  if (!el) return;
  if (!data || !data.track) { el.style.display = 'none'; return; }
  const sig = data.track + '|' + data.playing + '|' + data.duration + '|' + (data.topTracks || []).length;
  if (sig === _spotifyLastPayload && !_spotifyFirstRender) {
    if (data.playing && data.progress != null) {
      _spotifyProgress = { start: Date.now(), offset: data.progress, duration: data.duration };
    }
    return;
  }
  _spotifyLastPayload = sig;
  const songChanged = _lastTrackName !== null && _lastTrackName !== data.track;
  _lastTrackName = data.track;
  if (songChanged) {
    el.classList.add('spotify-fade-out');
    setTimeout(() => {
      _applySpotify(el, data);
      el.classList.remove('spotify-fade-out');
    }, 300);
    return;
  }
  _applySpotify(el, data);
}

function _applySpotify(el: HTMLElement, data: any) {
  const lang = document.documentElement.lang || 'en';
  const labels = spotifyLabels[lang] || spotifyLabels.en;
  const label = data.playing ? labels.playing : labels.last;
  el.className = 'spotify-line' + (data.playing ? ' playing' : ' not-playing');
  const coverUrl = data.cover || '';
  const vinylHtml = '<span class="spotify-logo-wrap"><svg class="spotify-logo" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg><span class="spotify-expand-hint">click to expand</span></span>';
  const safeTrack = _escHtml(data.track);
  const safeArtist = _escHtml(data.artist);
  const trackText = safeTrack + ' — ' + safeArtist;
  const needsMarquee = trackText.length > 40;
  const trackHtml = needsMarquee
    ? '<span class="spotify-marquee-wrap"><span class="spotify-marquee">' + trackText + '   •   ' + trackText + '   •   </span></span>'
    : trackText;
  const progress = data.playing && data.duration
    ? '<span class="spotify-progress-row"><span class="spotify-time" id="spotify-elapsed"></span><span class="spotify-progress"><span class="spotify-progress-bar" id="spotify-bar"></span></span><span class="spotify-time" id="spotify-remaining"></span></span>'
    : '';
  const miniCover = coverUrl ? '<img class="spotify-mini-cover" src="' + coverUrl + '" alt="" width="24" height="24">' : '';
  let recentHtml = '';
  const topTracks = data.topTracks || [];
  if (topTracks.length > 0) {
    const historyLabel = (data.historySource === 'recent' ? labels.recent : labels.history) || 'Top this month';
    recentHtml = '<div class="spotify-history" id="spotify-history"><span class="spotify-history-label">' + historyLabel + '</span>';
    for (let i = 0; i < topTracks.length; i++) {
      const r = topTracks[i];
      const rCover = r.cover ? '<img class="spotify-history-cover" src="' + _escHtml(r.cover) + '" alt="" width="40" height="40">' : '';
      recentHtml += '<a href="' + _safeSpotifyUrl(r.url) + '" target="_blank" rel="noopener" class="spotify-history-item" style="--i:' + i + '">' +
        '<span class="spotify-history-idx">' + (i + 1) + '</span>' +
        rCover +
        '<span class="spotify-history-info"><span class="spotify-history-track">' + _escHtml(r.track) + '</span><span class="spotify-history-artist">' + _escHtml(r.artist) + '</span></span></a>';
    }
    recentHtml += '</div>';
  }
  const chevron = recentHtml ? '<span class="spotify-chevron" aria-hidden="true"></span>' : '';
  const safeUrl = _safeSpotifyUrl(data.url);
  const wasOpen = el.classList.contains('history-open');
  el.innerHTML = '<div class="spotify-inline" id="spotify-toggle">' + vinylHtml + label + ' <a href="' + safeUrl + '" target="_blank" rel="noopener">' + trackHtml + '</a>' + chevron + '</div>' +
    progress +
    '<div class="spotify-mini-player"><a href="' + safeUrl + '" target="_blank" rel="noopener" class="spotify-mini-link">' + miniCover + '<div class="spotify-mini-info"><span class="spotify-mini-track">' + safeTrack + '</span><span class="spotify-mini-artist">' + safeArtist + '</span></div></a></div>' + recentHtml;
  if (wasOpen) el.classList.add('history-open');
  el.style.display = '';
  if (_spotifyFirstRender) {
    _spotifyFirstRender = false;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('spotify-intro', 'spotify-revealing');
      const inlineEl = el.querySelector('.spotify-inline');
      const revealWords: HTMLElement[] = [];
      if (inlineEl) {
        const walker = document.createTreeWalker(inlineEl, NodeFilter.SHOW_TEXT);
        const textNodes: Text[] = [];
        let tnode: Text | null;
        while (tnode = walker.nextNode() as Text | null) {
          if (tnode.textContent?.trim() && !(tnode.parentNode as Element)?.closest?.('.spotify-expand-hint')) textNodes.push(tnode);
        }
        textNodes.forEach((tn) => {
          const parts = tn.textContent!.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((w) => {
            if (/^\s+$/.test(w)) {
              frag.appendChild(document.createTextNode(w));
            } else if (w) {
              const span = document.createElement('span');
              span.className = 'spotify-word';
              span.textContent = w;
              frag.appendChild(span);
              revealWords.push(span);
            }
          });
          tn.parentNode!.replaceChild(frag, tn);
        });
      }
      requestAnimationFrame(() => {
        el.classList.remove('spotify-intro');
        revealWords.forEach((span, i) => {
          setTimeout(() => { span.classList.add('revealed'); }, 150 + i * 60);
        });
        setTimeout(() => {
          el.classList.remove('spotify-revealing');
        }, 150 + revealWords.length * 60 + 250);
      });
    }
  }
  const toggle = document.getElementById('spotify-toggle');
  if (toggle) {
    if (topTracks.length > 0) {
      toggle.style.cursor = 'pointer';
      toggle.addEventListener('click', (e) => {
        if ((e.target as Element).closest('a')) return;
        el.classList.toggle('history-open');
      });
    }
    const songLink = toggle.querySelector('a');
    if (songLink && window.matchMedia('(hover: hover)').matches) {
      songLink.addEventListener('mouseenter', () => { el.classList.add('mini-hover'); });
      songLink.addEventListener('mouseleave', () => {
        setTimeout(() => {
          if (!el.querySelector('.spotify-mini-player:hover')) el.classList.remove('mini-hover');
        }, 50);
      });
      const mini = el.querySelector('.spotify-mini-player');
      if (mini) {
        mini.addEventListener('mouseleave', () => { el.classList.remove('mini-hover'); });
      }
    }
    const hint = el.querySelector('.spotify-expand-hint');
    if (hint && topTracks.length > 0 && window.innerWidth > 480) {
      setTimeout(() => { hint.classList.add('visible'); }, 800);
      setTimeout(() => { hint.classList.add('fade-out'); }, 10800);
      toggle.addEventListener('click', () => {
        hint.classList.add('fade-out');
      }, { once: true });
    }
  }

  if (_spotifyTimer) clearInterval(_spotifyTimer);
  if (data.playing && data.duration) {
    _spotifyProgress = { start: Date.now(), offset: data.progress || 0, duration: data.duration };
    function tickProgress() {
      const bar = document.getElementById('spotify-bar');
      const elapsedEl = document.getElementById('spotify-elapsed');
      const remainEl = document.getElementById('spotify-remaining');
      if (!_spotifyProgress) return;
      const elapsed = Math.min(_spotifyProgress.offset + (Date.now() - _spotifyProgress.start), _spotifyProgress.duration);
      const pct = (elapsed / _spotifyProgress.duration) * 100;
      if (bar) (bar as HTMLElement).style.transform = 'scaleX(' + (pct / 100) + ')';
      if (elapsedEl) elapsedEl.textContent = fmtTime(elapsed);
      if (remainEl) remainEl.textContent = '-' + fmtTime(_spotifyProgress.duration - elapsed);
    }
    tickProgress();
    _spotifyTimer = setInterval(tickProgress, 1000);
  }
}

async function fetchSpotify() {
  try {
    const res = await fetch(SPOTIFY_API, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      (window as any)._spotifyData = await res.json();
      renderSpotify((window as any)._spotifyData);
      _spotifyFails = 0;
      _spotifySkipTicks = 0;
    } else {
      _spotifyFails++;
      _spotifySkipTicks = Math.min(1 << _spotifyFails, 16);
    }
  } catch {
    _spotifyFails++;
    _spotifySkipTicks = Math.min(1 << _spotifyFails, 16);
  }
  if (_spotifyFails >= 5) {
    const el = document.getElementById('spotify-line');
    if (el && !el.hasChildNodes()) el.style.display = 'none';
  }
}

export function initSpotify() {
  (window as any)._spotifyData = null;
  fetchSpotify();
  setInterval(() => {
    if (document.hidden) return;
    if (_spotifySkipTicks > 0) { _spotifySkipTicks--; return; }
    fetchSpotify();
  }, 30000);
}
