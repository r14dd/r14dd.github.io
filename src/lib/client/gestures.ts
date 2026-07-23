// @ts-nocheck — verbatim move of the (never type-checked) inline script.
// Motion-gated extras: sim in-view activation, section-heading typing on
// reveal, pull-to-refresh, modal swipe-dismiss, pinch-zoom on sims, and
// the Konami easter egg. The whole block is skipped under reduced motion,
// exactly as in the original script.
import { prefersReducedMotion } from './motion';
import { state } from './state';
import { typed, typeH2 } from './reveal-fx';
import { closeProject } from './project-modal';
import { showToast } from './toast';

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
      new MutationObserver((_, obs) => {
        if (sec.classList.contains('section-revealed')) {
          const h2 = sec.querySelector('h2');
          if (h2 && !typed.has(h2)) {
            typed.add(h2);
            typeH2(h2);
          }
          obs.disconnect();
        }
      }).observe(sec, { attributes: true, attributeFilter: ['class'] });
    });

    // Mobile: pull-to-refresh animation (visual only)
    {
      const pullEl = document.getElementById('pull-indicator');
      if (pullEl && 'ontouchstart' in window) {
        let pullStartY = 0,
          pulling = false;
        document.addEventListener(
          'touchstart',
          (e) => {
            if (window.scrollY < 5 && !state.cmdOpen && !state.projOpen && !state.kbdOpen) {
              pullStartY = e.touches[0].clientY;
              pulling = true;
            }
          },
          { passive: true },
        );
        let lastPullDy = 0;
        document.addEventListener(
          'touchmove',
          (e) => {
            if (!pulling) return;
            const dy = e.touches[0].clientY - pullStartY;
            lastPullDy = dy;
            if (dy > 40 && dy < 200) {
              pullEl.classList.add('visible');
              // transform, not top: layout properties during an active touch
              // gesture force layout per touchmove.
              pullEl.style.transform = `translate(-50%, ${Math.min(dy * 0.3, 48) - 16}px)`;
              pullEl.style.opacity = Math.min((dy - 40) / 80, 1);
            } else if (dy <= 0) {
              pullEl.classList.remove('visible');
              pulling = false;
            }
          },
          { passive: true },
        );
        const endPull = () => {
          if (!pulling) return;
          pulling = false;
          if (lastPullDy >= 120 && pullEl.classList.contains('visible')) {
            pullEl.classList.add('refreshing');
            setTimeout(() => location.reload(), 500);
          } else {
            pullEl.classList.remove('visible');
            pullEl.style.opacity = '';
            pullEl.style.transform = '';
          }
          lastPullDy = 0;
        };
        document.addEventListener('touchend', endPull, { passive: true });
        document.addEventListener('touchcancel', endPull, { passive: true });
      }
    }

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

    // Easter egg: Konami code (desktop) + triple-tap logo (mobile)
    {
      const KONAMI = [
        'ArrowUp',
        'ArrowUp',
        'ArrowDown',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'ArrowLeft',
        'ArrowRight',
        'b',
        'a',
      ];
      let konamiIdx = 0;
      const easterOverlay = document.getElementById('easter-overlay');

      const triggerEasterEgg = () => {
        if (!easterOverlay) return;
        easterOverlay.innerHTML = '';
        easterOverlay.classList.add('active');
        const chars =
          'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
        const colCount = Math.floor(window.innerWidth / 20);
        for (let i = 0; i < colCount; i++) {
          const col = document.createElement('div');
          col.className = 'matrix-col';
          col.style.left = i * 20 + Math.random() * 6 + 'px';
          col.style.animationDuration = 2 + Math.random() * 3 + 's';
          col.style.animationDelay = Math.random() * 2 + 's';
          let str = '';
          const len = 8 + Math.floor(Math.random() * 16);
          for (let j = 0; j < len; j++) str += chars[Math.floor(Math.random() * chars.length)];
          col.textContent = str;
          easterOverlay.appendChild(col);
        }
        if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
        showToast('You found the secret');
        setTimeout(() => {
          easterOverlay.classList.remove('active');
          setTimeout(() => {
            easterOverlay.innerHTML = '';
          }, 500);
        }, 5000);
      };

      document.addEventListener('keydown', (e) => {
        if (state.cmdOpen || state.projOpen || state.kbdOpen) return;
        if (e.key === KONAMI[konamiIdx]) {
          konamiIdx++;
          if (konamiIdx === KONAMI.length) {
            konamiIdx = 0;
            triggerEasterEgg();
          }
        } else {
          konamiIdx = e.key === KONAMI[0] ? 1 : 0;
        }
      });
    }
  }
};
