// @ts-nocheck — verbatim move of the (never type-checked) inline script.
// Motion-gated extras: sim in-view activation, section-heading typing on
// reveal, modal swipe-dismiss, and pinch-zoom on sims. The whole block is
// skipped under reduced motion.
import { prefersReducedMotion } from './motion';
import { typed, typeH2 } from './reveal-fx';
import { closeProject } from './project-modal';

export const initGestures = () => {
  if (!prefersReducedMotion) {
    const simObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const sim = entry.target.querySelector('.sim-visual');
          if (sim) sim.classList.add('active');
          simObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.25 },
    );
    const observedSimCards = new WeakSet();
    const observeSims = () => {
      document.querySelectorAll('.proj-card').forEach((card) => {
        if (observedSimCards.has(card) || !card.querySelector('.sim-visual')) return;
        observedSimCards.add(card);
        simObserver.observe(card);
      });
    };
    observeSims();

    const contentEl = document.querySelector('.content');
    if (contentEl) {
      new MutationObserver((mutations) => {
        if (mutations.every((m) => m.target.closest && m.target.closest('#spotify-line'))) return;
        observeSims();
      }).observe(contentEl, { childList: true, subtree: true });
    }

    document.querySelectorAll('section[id]').forEach((sec) => {
      const typeOnce = () => {
        const h2 = sec.querySelector('h2');
        if (h2 && !typed.has(h2)) {
          typed.add(h2);
          typeH2(h2);
        }
      };
      // This module loads on idle — a section already revealed before we
      // attached will never mutate again, so handle it now.
      if (sec.classList.contains('section-revealed')) {
        typeOnce();
        return;
      }
      new MutationObserver((_, obs) => {
        if (sec.classList.contains('section-revealed')) {
          typeOnce();
          obs.disconnect();
        }
      }).observe(sec, { attributes: true, attributeFilter: ['class'] });
    });

    // Mobile: swipe down on bottom-sheet project modal to dismiss
    {
      const modal = document.getElementById('proj-modal');
      const modalCard = modal?.querySelector('.proj-modal-card');
      if (modal && modalCard) {
        let mStartY = 0,
          mDragging = false;
        modal.addEventListener(
          'touchstart',
          (e) => {
            if (modalCard.scrollTop > 5) return;
            mStartY = e.touches[0].clientY;
            mDragging = true;
          },
          { passive: true },
        );
        modal.addEventListener(
          'touchmove',
          (e) => {
            if (!mDragging) return;
            const dy = e.touches[0].clientY - mStartY;
            if (dy > 0) {
              modal.style.transform = `translate(-50%, calc(-50% + ${dy}px))`;
            } else {
              mDragging = false;
              modal.style.transform = '';
            }
          },
          { passive: true },
        );
        const endDrag = (e) => {
          if (!mDragging) return;
          mDragging = false;
          const dy = e.changedTouches[0].clientY - mStartY;
          if (dy > 100) {
            closeProject();
          }
          modal.style.transform = '';
        };
        modal.addEventListener('touchend', endDrag, { passive: true });
        modal.addEventListener(
          'touchcancel',
          () => {
            mDragging = false;
            modal.style.transform = '';
          },
          { passive: true },
        );
      }
    }

    // Pinch-to-zoom on sim visuals (inside project modal)
    {
      const modalEl = document.getElementById('proj-modal');
      if (modalEl && 'ontouchstart' in window) {
        let initDist = 0,
          curScale = 1,
          zooming = false,
          simTarget = null;
        const getDist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
        modalEl.addEventListener(
          'touchstart',
          (e) => {
            if (e.touches.length !== 2) return;
            simTarget = e.target.closest('.sim-visual');
            if (!simTarget) return;
            zooming = true;
            initDist = getDist(e.touches);
            const rect = simTarget.getBoundingClientRect();
            const mx =
              (((e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left) / rect.width) * 100;
            const my =
              (((e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top) / rect.height) * 100;
            simTarget.style.setProperty('--pinch-x', mx + '%');
            simTarget.style.setProperty('--pinch-y', my + '%');
            simTarget.classList.add('pinch-zooming');
          },
          { passive: true },
        );
        modalEl.addEventListener(
          'touchmove',
          (e) => {
            if (!zooming || e.touches.length !== 2 || !simTarget) return;
            const dist = getDist(e.touches);
            curScale = Math.max(1, Math.min(3, dist / initDist));
            simTarget.style.transform = `scale(${curScale})`;
          },
          { passive: true },
        );
        const endZoom = () => {
          if (!zooming || !simTarget) return;
          zooming = false;
          simTarget.style.transition = 'transform 0.3s ease';
          simTarget.style.transform = '';
          simTarget.classList.remove('pinch-zooming');
          setTimeout(() => {
            if (simTarget) simTarget.style.transition = '';
          }, 300);
          simTarget = null;
          curScale = 1;
        };
        modalEl.addEventListener('touchend', endZoom, { passive: true });
        modalEl.addEventListener('touchcancel', endZoom, { passive: true });
      }
    }
  }
};
