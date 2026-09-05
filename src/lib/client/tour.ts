// First-visit tour. A pill offers it once; `?tour` opens it on demand. The
// visitor picks who they are and the route through the sections follows —
// a recruiter sees the work first, an engineer the terminal.
import { prefersReducedMotion } from './motion';
import { smoothScrollTo } from './nav';
import { state } from './state';
import * as focusTrap from './focus-trap';

const SEEN = 'riad-tour-seen';
const ROUTES: Record<string, string[]> = {
  hiring: ['experience', 'projects', 'skills', 'recommendations', 'resume', 'connect'],
  engineer: ['terminal', 'projects', 'skills', 'experience', 'more', 'connect'],
  curious: ['terminal', 'projects', 'teaching', 'recommendations', 'more', 'connect'],
};
// Steps without a target show a centered card.
const TARGETS: Record<string, string> = {
  terminal: 'terminal-window',
  experience: 'experience',
  projects: 'projects',
  skills: 'skills',
  teaching: 'teaching',
  recommendations: 'recommendations',
  connect: 'connect',
};

export const initTour = () => {
  const labels = () => state.currentProfile?.labels?.tour;
  if (!labels()) return;

  let seen = false;
  try {
    seen = localStorage.getItem(SEEN) === '1';
  } catch {}
  const markSeen = () => {
    try {
      localStorage.setItem(SEEN, '1');
    } catch {}
  };

  const html = String.raw;
  const el = (tag: string, cls: string, inner = '') => {
    const n = document.createElement(tag);
    n.className = cls;
    n.innerHTML = inner;
    return n;
  };

  const backdrop = el('div', 'tour-backdrop');
  const spot = el('div', 'tour-spot');
  const card = el('div', 'tour-card');
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-modal', 'true');
  card.tabIndex = -1;
  backdrop.hidden = spot.hidden = card.hidden = true;
  document.body.append(backdrop, spot, card);

  let route: string[] = [];
  let idx = -1; // -1 = role picker
  let target: HTMLElement | null = null;
  let raf = 0;

  const place = () => {
    raf = 0;
    if (!target) return;
    const r = target.getBoundingClientRect();
    const pad = 10;
    spot.style.top = `${r.top - pad}px`;
    spot.style.left = `${r.left - pad}px`;
    spot.style.width = `${r.width + pad * 2}px`;
    spot.style.height = `${r.height + pad * 2}px`;
    if (window.innerWidth < 720) return; // card is docked at the bottom
    const ch = card.offsetHeight;
    const below = r.bottom + 16;
    const above = r.top - ch - 16;
    // A section taller than the viewport leaves no room beside it: dock the
    // card in the corner instead of covering the heading.
    const dock = below + ch > window.innerHeight - 16 && above < 16;
    card.classList.toggle('tour-card-dock', dock);
    if (dock) {
      card.style.top = card.style.left = '';
      return;
    }
    card.style.top = `${below + ch < window.innerHeight - 16 ? below : above}px`;
    card.style.left = `${Math.max(16, Math.min(r.left, window.innerWidth - card.offsetWidth - 16))}px`;
  };
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(place);
  };

  const render = () => {
    const t = labels();
    if (!t) return;
    const last = idx === route.length - 1;
    if (idx < 0) {
      card.innerHTML = html`
        <p class="tour-eyebrow">${t.title}</p>
        <h3 class="tour-title">${t.question}</h3>
        <div class="tour-roles">
          ${Object.entries(t.roles)
            .map(
              ([k, v]) => `<button type="button" class="tour-role" data-role="${k}">${v}</button>`,
            )
            .join('')}
        </div>
        <div class="tour-foot">
          <button type="button" class="tour-btn" data-act="skip">${t.skip}</button>
        </div>
      `;
    } else {
      const key = route[idx];
      const s = t.steps[key];
      card.innerHTML = html`
        <p class="tour-eyebrow">${idx + 1} / ${route.length}</p>
        <h3 class="tour-title">${s.title}</h3>
        <p class="tour-text">${s.text}</p>
        ${s.link ? `<a class="tour-link" href="${s.link}">${s.linkLabel} →</a>` : ''}
        <div class="tour-foot">
          <button type="button" class="tour-btn" data-act="skip">${t.skip}</button>
          <span class="tour-nav">
            <button type="button" class="tour-btn" data-act="back">${t.back}</button>
            <button
              type="button"
              class="tour-btn tour-btn-primary"
              data-act="${last ? 'done' : 'next'}"
            >
              ${last ? t.done : t.next}
            </button>
          </span>
        </div>
      `;
    }
    card.classList.toggle('tour-card-center', !target);
    card.classList.remove('tour-card-dock');
    backdrop.classList.toggle('dim', !target);
    spot.hidden = !target;
    card.style.top = card.style.left = '';
    if (target) {
      smoothScrollTo(target);
      // Lenis eases for ~1s; keep the spotlight glued to the target meanwhile.
      const until = performance.now() + (prefersReducedMotion ? 0 : 1100);
      const tick = () => {
        place();
        if (performance.now() < until) requestAnimationFrame(tick);
      };
      tick();
    }
    card.focus({ preventScroll: true });
  };

  const go = (i: number) => {
    idx = i;
    const key = idx >= 0 ? route[idx] : '';
    target = key && TARGETS[key] ? document.getElementById(TARGETS[key]) : null;
    render();
  };

  const open = () => {
    if (state.tourOpen || state.cmdOpen || state.projOpen || state.kbdOpen) return;
    state.tourOpen = true;
    document.body.classList.add('tour-open');
    pill?.remove();
    backdrop.hidden = card.hidden = false;
    requestAnimationFrame(() => {
      backdrop.classList.add('open');
      card.classList.add('open');
    });
    focusTrap.activate(card);
    go(-1);
  };
  const close = () => {
    if (!state.tourOpen) return;
    state.tourOpen = false;
    document.body.classList.remove('tour-open');
    markSeen();
    focusTrap.deactivate();
    backdrop.classList.remove('open');
    card.classList.remove('open');
    backdrop.hidden = spot.hidden = card.hidden = true;
    target = null;
  };

  card.addEventListener('click', (e) => {
    const b = (e.target as Element).closest('button') as HTMLButtonElement | null;
    if (!b) return;
    if (b.dataset.role) {
      route = ROUTES[b.dataset.role] ?? ROUTES.curious;
      go(0);
      return;
    }
    const act = b.dataset.act;
    if (act === 'next') go(idx + 1);
    else if (act === 'back') go(idx - 1);
    else close();
  });
  backdrop.addEventListener('click', close);
  document.addEventListener(
    'keydown',
    (e) => {
      if (!state.tourOpen) return;
      if (e.key === 'Escape') close();
      else if (idx >= 0 && (e.key === 'ArrowRight' || e.key === 'Enter'))
        idx === route.length - 1 ? close() : go(idx + 1);
      else if (idx >= 0 && e.key === 'ArrowLeft') go(idx - 1);
      else return;
      e.preventDefault();
      e.stopPropagation();
    },
    true,
  );
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);

  // The offer: a pill after the intro settles, once. Dismissing it counts.
  let pill: HTMLElement | null = null;
  const url = new URL(location.href);
  if (url.searchParams.has('tour')) {
    url.searchParams.delete('tour');
    history.replaceState(history.state, '', url);
    setTimeout(open, 400);
    return;
  }
  if (seen) return;
  const t = labels();
  pill = el(
    'div',
    'tour-pill',
    html`<button type="button" class="tour-pill-cta">${t.cta}</button
      ><button type="button" class="tour-pill-x" aria-label="${t.skip}">×</button>`,
  );
  pill.querySelector('.tour-pill-cta')?.addEventListener('click', open);
  pill.querySelector('.tour-pill-x')?.addEventListener('click', () => {
    markSeen();
    pill?.remove();
    pill = null;
  });
  setTimeout(() => {
    if (state.tourOpen || !pill) return;
    document.body.append(pill);
    requestAnimationFrame(() => pill?.classList.add('open'));
  }, 2600);
};
