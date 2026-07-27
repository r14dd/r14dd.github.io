// @ts-nocheck
export const initFerris = () => {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 6) return;

  const FERRIS_SVG = `<svg viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="20" cy="18" rx="10" ry="7" fill="var(--accent)" opacity="0.8"/>
    <line x1="14" y1="11" x2="13" y2="6" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="26" y1="11" x2="27" y2="6" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="13" cy="4.5" r="2.5" fill="var(--accent)"/>
    <circle cx="27" cy="4.5" r="2.5" fill="var(--accent)"/>
    <circle cx="12.5" cy="4" r="1.2" fill="var(--bg)"/>
    <circle cx="26.5" cy="4" r="1.2" fill="var(--bg)"/>
    <path d="M8 15 Q3 11 5 6 Q6.5 3.5 8 6" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/>
    <path d="M32 15 Q37 11 35 6 Q33.5 3.5 32 6" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/>
    <line x1="12" y1="23" x2="7" y2="27" stroke="var(--accent)" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="16" y1="24" x2="11" y2="27" stroke="var(--accent)" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="24" y1="24" x2="29" y2="27" stroke="var(--accent)" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="28" y1="23" x2="33" y2="27" stroke="var(--accent)" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`;

  const ferris = document.createElement('div');
  ferris.className = 'ferris';
  ferris.innerHTML = FERRIS_SVG;
  ferris.setAttribute('aria-hidden', 'true');

  // Every offset stays positive: a negative one hangs the sprite over the
  // section edge, where an ancestor's overflow clips it in half.
  let target;
  if (hour >= 6 && hour < 12) {
    target = document.querySelector('.terminal-window')?.closest('section');
    if (target) {
      ferris.style.right = '8px';
      ferris.style.bottom = '24px';
    }
  } else if (hour >= 12 && hour < 18) {
    target = document.getElementById('projects');
    if (target) {
      ferris.style.right = '12px';
      ferris.style.top = '56px';
    }
  } else {
    target = document.getElementById('recommendations');
    if (target) {
      ferris.style.left = '8px';
      ferris.style.top = '72px';
      ferris.classList.add('ferris-wander');
    }
  }

  if (!target) return;
  target.style.position = 'relative';
  target.appendChild(ferris);

  let snipping = false;
  ferris.addEventListener('click', (e) => {
    e.stopPropagation();
    if (snipping) return;
    snipping = true;
    ferris.classList.add('ferris-snip');
    setTimeout(() => {
      ferris.classList.remove('ferris-snip');
      snipping = false;
    }, 600);
  });
};
