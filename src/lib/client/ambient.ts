// @ts-nocheck — verbatim move of the (never type-checked) inline script;
// typing it for strict TS would mean touching runtime logic. Separate task.
// Ambient page behaviors: Baku clock, scroll-timeline in-view observer,
// external-link exit pulse, and the connect-section arrival sync.
import * as sfx from './sfx';
import { prefersReducedMotion } from './motion';

export const initAmbient = () => {
  function updateBakuTime() {
    const el = document.getElementById('local-time');
    if (!el) return;
    el.textContent = new Date().toLocaleTimeString('en-US', {
      timeZone: 'Asia/Baku',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  updateBakuTime();
  setInterval(updateBakuTime, 30000);

  // ── SCROLL TIMELINE OBSERVER ──────────────────────
  {
    let scrollTlObs = null;
    const initScrollTl = () => {
      if (scrollTlObs) scrollTlObs.disconnect();
      const items = document.querySelectorAll('.scroll-tl-item');
      if (!items.length) return;
      scrollTlObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) e.target.classList.add('in-view');
            else e.target.classList.remove('in-view');
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
      );
      items.forEach((i) => scrollTlObs.observe(i));
    };
    initScrollTl();

    const contentEl = document.querySelector('.content');
    if (contentEl) {
      let scrollTlTimer;
      new MutationObserver((mutations) => {
        if (mutations.every((m) => m.target.closest && m.target.closest('#spotify-line'))) return;
        clearTimeout(scrollTlTimer);
        scrollTlTimer = setTimeout(initScrollTl, 200);
      }).observe(contentEl, { childList: true, subtree: true });
    }
  }

  // ── EXIT ANIMATION FOR EXTERNAL LINKS ──────────────
  if (!prefersReducedMotion) {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      const isExternal = /^https?:\/\//.test(href) && !href.startsWith(location.origin);
      if (!isExternal) return;
      if (link.target === '_blank') {
        link.classList.remove('link-exit-pulse');
        void link.offsetWidth;
        link.classList.add('link-exit-pulse');
        sfx.whoosh(false);
      }
    });
  }

  // ── CONNECT SECTION ARRIVAL — sync CTA pulse + map ping ──
  {
    const connectEl = document.getElementById('connect');
    if (connectEl) {
      const connectObs = new MutationObserver(() => {
        if (!connectEl.classList.contains('section-revealed')) return;
        connectObs.disconnect();
        const dot = connectEl.querySelector('.mini-map-dot');
        if (dot) {
          dot.style.animation = 'none';
          dot.offsetHeight;
          dot.style.animation = '';
        }
        const ctas = connectEl.querySelectorAll('.cta-btn');
        ctas.forEach((btn, i) => {
          btn.style.animationDelay = `${0.08 * (i + 1)}s`;
        });
      });
      connectObs.observe(connectEl, { attributes: true, attributeFilter: ['class'] });
    }
  }
};
