// @ts-nocheck — verbatim move of the (never type-checked) inline script.
// Quick-look sim overlay: clones a card's sim SVG full-screen for 3 seconds.
// "Simulate" buttons are handled by a single delegated listener on the
// #projects section (in the page orchestrator) so they survive every language
// re-render without per-button re-binding.
import { prefersReducedMotion } from './motion';

export let openSimOverlay = (_card) => {};

export const initSimOverlay = () => {
  const simOverlay = document.createElement('div');
  simOverlay.className = 'sim-overlay';
  simOverlay.innerHTML = '<div class="sim-overlay-content"></div>';
  document.body.appendChild(simOverlay);
  let simTimer = null;

  openSimOverlay = (card) => {
    const sv = card.querySelector('.sim-visual');
    if (!sv) return;
    const content = simOverlay.querySelector('.sim-overlay-content');
    content.innerHTML = sv.outerHTML;
    const cloned = content.querySelector('.sim-visual');
    if (cloned) {
      cloned.classList.add('active');
      // CSS can't stop SMIL — drop <animate> nodes under reduced motion.
      if (prefersReducedMotion) cloned.querySelectorAll('animate').forEach((a) => a.remove());
    }
    simOverlay.classList.add('open');
    simTimer = setTimeout(closeSimOverlay, 3000);
  };

  const closeSimOverlay = () => {
    clearTimeout(simTimer);
    simOverlay.classList.remove('open');
    const content = simOverlay.querySelector('.sim-overlay-content');
    setTimeout(() => {
      content.innerHTML = '';
    }, 300);
  };

  simOverlay.addEventListener('click', closeSimOverlay);
};
