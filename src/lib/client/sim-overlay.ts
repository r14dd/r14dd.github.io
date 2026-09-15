// Quick-look sim overlay: clones a card's sim SVG full-screen for 3 seconds.
// "Simulate" buttons are handled by a single delegated listener on the
// #projects section (in the page orchestrator) so they survive every language
// re-render without per-button re-binding.
import { prefersReducedMotion } from './motion';

export let openSimOverlay = (_card: Element) => {};

export const initSimOverlay = () => {
  const simOverlay = document.createElement('div');
  simOverlay.className = 'sim-overlay';
  const content = document.createElement('div');
  content.className = 'sim-overlay-content';
  simOverlay.appendChild(content);
  document.body.appendChild(simOverlay);
  let simTimer: ReturnType<typeof setTimeout> | undefined;

  openSimOverlay = (card) => {
    const sv = card.querySelector('.sim-visual');
    if (!sv) return;
    content.innerHTML = sv.outerHTML;
    const cloned = content.querySelector('.sim-visual');
    if (cloned) {
      cloned.classList.add('active');
      // CSS can't stop SMIL, so drop <animate> nodes under reduced motion.
      if (prefersReducedMotion) cloned.querySelectorAll('animate').forEach((a) => a.remove());
    }
    simOverlay.classList.add('open');
    simTimer = setTimeout(closeSimOverlay, 3000);
  };

  const closeSimOverlay = () => {
    clearTimeout(simTimer);
    simOverlay.classList.remove('open');
    setTimeout(() => {
      content.innerHTML = '';
    }, 300);
  };

  simOverlay.addEventListener('click', closeSimOverlay);
};
