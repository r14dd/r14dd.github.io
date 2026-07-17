const badgeCache: Record<string, number> = {};

function animateCount(el: HTMLElement, target: number, duration = 2500) {
  const start = performance.now();
  const isK = target >= 1000;
  function tick(now: number) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    const current = Math.round(ease * target);
    el.textContent = isK ? (current / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(current);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const badgeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target as HTMLElement;
      const raw = parseInt(el.dataset.badgeRaw!, 10);
      if (!raw) return;
      badgeObserver.unobserve(el);
      animateCount(el, raw);
    });
  },
  { threshold: 0.5 },
);

export async function fetchBadges(root?: HTMLElement | null) {
  // Each call renders fresh badge nodes (language switch replaces innerHTML) —
  // drop observations of the now-detached previous generation.
  badgeObserver.disconnect();
  const badges = Array.from(
    (root || document).querySelectorAll('.proj-badge-live'),
  ) as HTMLElement[];
  for (const el of badges) {
    const api = (el as HTMLElement).dataset.badgeApi;
    if (!api) continue;
    const countEl = el.querySelector('.badge-count') as HTMLElement;
    if (badgeCache[api] != null) {
      countEl.dataset.badgeRaw = String(badgeCache[api]);
      countEl.textContent = '0';
      badgeObserver.observe(countEl);
      continue;
    }
    try {
      const res = await fetch(api, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) {
        countEl.textContent = '—';
        continue;
      }
      const data = await res.json();
      const count = api.includes('github.com') ? data.stargazers_count : data.crate?.downloads;
      if (count != null) {
        badgeCache[api] = count;
        countEl.dataset.badgeRaw = String(count);
        countEl.textContent = '0';
        badgeObserver.observe(countEl);
      }
    } catch {
      countEl.textContent = '—';
    }
  }
}
