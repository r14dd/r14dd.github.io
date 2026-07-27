// @ts-nocheck
import songs from '../../data/songs.json';

const WORKER_URL = 'https://toy-api.riad-mrv.workers.dev';
const SEED = songs[0];

export const initSongRelay = () => {
  const spotifyLine = document.getElementById('spotify-line');
  if (!spotifyLine) return;

  const card = document.createElement('div');
  card.className = 'relay-card';
  card.setAttribute('aria-label', 'Song relay');
  spotifyLine.insertAdjacentElement('afterend', card);

  let currentSong = null;

  const ago = (ts) => {
    if (!ts) return 'a while';
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const spotifySearch = (s) =>
    `https://open.spotify.com/search/${encodeURIComponent(s.title + ' ' + s.artist)}`;

  const render = (song, timestamp) => {
    const s = song || SEED;
    currentSong = s;
    const timeLabel = song ? `a visitor ${ago(timestamp)}` : 'the site';
    card.innerHTML = `<span class="relay-from">${timeLabel} left you this &rarr;</span>
      <a class="relay-song" href="${spotifySearch(s)}" target="_blank" rel="noopener">
        <span class="relay-note">&#9835;</span>
        <span class="relay-title">${s.title}</span>
        <span class="relay-artist">${s.artist}</span>
      </a>
      <button class="relay-pass" type="button">pass it on</button>`;
    card.classList.add('visible');

    card.querySelector('.relay-pass').addEventListener('click', openPicker);
  };

  const openPicker = () => {
    const existing = document.querySelector('.relay-picker');
    if (existing) {
      existing.remove();
      return;
    }
    const picker = document.createElement('div');
    picker.className = 'relay-picker';
    const pool = songs.filter(
      (s) => !(currentSong && s.title === currentSong.title && s.artist === currentSong.artist),
    );
    picker.innerHTML = pool
      .map(
        (s, i) =>
          `<button class="relay-pick" type="button" data-i="${i}">
        <span class="relay-pick-title">${s.title}</span>
        <span class="relay-pick-artist">${s.artist}</span>
      </button>`,
      )
      .join('');
    card.appendChild(picker);

    picker.addEventListener('click', (e) => {
      const btn = e.target.closest('.relay-pick');
      if (!btn) return;
      const idx = Number(btn.dataset.i);
      const chosen = pool[idx];
      if (!chosen) return;
      picker.remove();
      pass(chosen);
    });
  };

  const pass = (song) => {
    render(song, Date.now());
    card.querySelector('.relay-pass').textContent = 'passed!';
    card.querySelector('.relay-pass').disabled = true;
    fetch(`${WORKER_URL}/relay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: song.title, artist: song.artist }),
    }).catch(() => {});
  };

  fetch(`${WORKER_URL}/relay`)
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => render(data?.song, data?.timestamp))
    .catch(() => render(null, null));
};
