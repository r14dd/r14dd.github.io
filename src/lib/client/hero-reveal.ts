// Hero name reveal: word-by-word rise on first load (waits for the page
// loader's intro-done), instant text under reduced motion, and re-runs on
// language switch via weightReveal.
import { prefersReducedMotion } from './motion';

let heroFirstLoad = true;

const wordReveal = (el: HTMLElement, text: string) => {
  el.innerHTML = '';
  text.split(' ').forEach((word, i) => {
    const wrap = document.createElement('span');
    wrap.className = 'hero-word-wrap';
    const inner = document.createElement('span');
    inner.className = 'hero-word';
    inner.textContent = word;
    inner.style.animationDelay = `${0.15 * i}s, ${0.8 + 0.15 * i}s`;
    wrap.appendChild(inner);
    el.appendChild(wrap);
    if (i < text.split(' ').length - 1) el.appendChild(document.createTextNode(' '));
  });
};

export const initHeroReveal = () => {
  const heroH1 = document.getElementById('hero-name');
  if (heroH1 && !prefersReducedMotion) {
    heroH1.style.visibility = 'hidden';
  }
};

export const weightReveal = (el: HTMLElement, text: string) => {
  if (heroFirstLoad) {
    heroFirstLoad = false;
    if (prefersReducedMotion) {
      el.textContent = text;
    } else {
      const go = () => {
        el.style.visibility = 'visible';
        wordReveal(el, text);
      };
      if (document.body.classList.contains('intro-done')) {
        go();
      } else {
        const obs = new MutationObserver(() => {
          if (document.body.classList.contains('intro-done')) {
            obs.disconnect();
            setTimeout(go, 100);
          }
        });
        obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
      }
    }
  } else {
    if (prefersReducedMotion) {
      el.textContent = text;
    } else {
      wordReveal(el, text);
    }
  }
};
