// @ts-nocheck
import { getItem, setItem } from './storage';

const WORKER_URL = 'https://toy-api.riad-mrv.workers.dev';
const STORAGE_KEY = 'riad-reader-number';
const NOTRACK_KEY = 'riad-notrack';

export const initVisitorNumber = () => {
  if (getItem(NOTRACK_KEY)) return;

  const footer = document.querySelector('footer');
  if (!footer) return;

  const el = document.createElement('div');
  el.className = 'reader-number';
  footer.appendChild(el);

  const cached = getItem(STORAGE_KEY);
  if (cached) {
    show(el, Number(cached));
    return;
  }

  fetch(`${WORKER_URL}/visitor/increment`, { method: 'POST' })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (!data?.number) return;
      setItem(STORAGE_KEY, String(data.number));
      show(el, data.number);
    })
    .catch(() => el.remove());
};

function show(el, n) {
  el.textContent = `you are reader #${n.toLocaleString()}`;
  el.classList.add('visible');
}
