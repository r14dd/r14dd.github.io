// @ts-nocheck
import { state } from './state';

export const initBeneath = () => {
  const content = document.querySelector('.content');
  if (!content) return;

  const HOLD_MS = 400;
  const HEAL_MS = 1500;

  const sketchSvg = buildSketch();

  const layer = document.createElement('div');
  layer.className = 'beneath-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = sketchSvg;
  document.body.appendChild(layer);

  const curl = document.createElement('div');
  curl.className = 'beneath-curl';
  curl.setAttribute('aria-hidden', 'true');
  document.body.appendChild(curl);

  // ── Corner curl + tear ────────────────────────────────────────
  let tearing = false;
  let tearStart = null;

  curl.addEventListener('mousedown', (e) => {
    e.preventDefault();
    tearing = true;
    tearStart = { x: e.clientX, y: e.clientY };
    layer.classList.add('tearing');
  });

  document.addEventListener('mousemove', (e) => {
    if (!tearing || !tearStart) return;
    const dx = tearStart.x - e.clientX;
    const dy = tearStart.y - e.clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const pct = Math.min(dist / Math.max(innerWidth, innerHeight), 1);
    layer.style.setProperty('--tear', `${pct * 100}%`);
  });

  const endTear = () => {
    if (!tearing) return;
    tearing = false;
    tearStart = null;
    layer.classList.add('healing');
    layer.style.setProperty('--tear', '0%');
    setTimeout(() => {
      layer.classList.remove('tearing', 'healing');
    }, HEAL_MS);
  };

  document.addEventListener('mouseup', endTear);

  // cursor proximity for curl hint
  document.addEventListener('mousemove', (e) => {
    if (tearing) return;
    const dx = innerWidth - e.clientX;
    const dy = innerHeight - e.clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    curl.classList.toggle('near', dist < 120);
  });

  // ── X-ray lens ────────────────────────────────────────────────
  let holdTimer = null;
  let lens = null;

  const isInteractive = (el) => {
    if (!el) return false;
    return (
      el.closest(
        'a, button, input, textarea, select, [contenteditable], [role="button"], .terminal-body, .terminal-dots, .cmd-palette, .proj-modal, .kbd-overlay, .lang-menu, .ferris, .beneath-curl',
      ) !== null
    );
  };

  document.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    if (state.cmdOpen || state.projOpen || state.kbdOpen) return;
    if (isInteractive(e.target)) return;

    holdTimer = setTimeout(() => {
      lens = document.createElement('div');
      lens.className = 'beneath-lens';
      lens.setAttribute('aria-hidden', 'true');
      document.body.appendChild(lens);
      layer.classList.add('xray');
      moveLens(e.clientX, e.clientY);
    }, HOLD_MS);
  });

  const moveLens = (x, y) => {
    if (!lens) return;
    lens.style.left = `${x}px`;
    lens.style.top = `${y}px`;
    layer.style.setProperty('--lens-x', `${x}px`);
    layer.style.setProperty('--lens-y', `${y}px`);
  };

  document.addEventListener('mousemove', (e) => {
    if (lens) moveLens(e.clientX, e.clientY);
  });

  document.addEventListener('mouseup', () => {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
    if (lens) {
      lens.remove();
      lens = null;
      layer.classList.remove('xray');
    }
  });
};

function buildSketch() {
  return `<svg class="beneath-svg" viewBox="0 0 840 2400" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>
      .sk { stroke: var(--accent); stroke-width: 1; opacity: 0.5; fill: none; }
      .sk-text { font-family: 'JetBrains Mono', monospace; font-size: 11px; fill: var(--accent); opacity: 0.6; }
      .sk-note { font-family: 'JetBrains Mono', monospace; font-size: 9px; fill: var(--accent); opacity: 0.4; font-style: italic; }
      .sk-ring { stroke: var(--accent); stroke-width: 0.5; fill: none; opacity: 0.15; }
    </style>

    <!-- hero sketch -->
    <rect x="40" y="60" width="400" height="24" rx="3" class="sk" stroke-dasharray="4 3"/>
    <text x="460" y="78" class="sk-note">eyebrow</text>
    <rect x="40" y="100" width="600" height="60" rx="4" class="sk"/>
    <text x="660" y="130" class="sk-note">h1 hero name</text>
    <rect x="40" y="180" width="550" height="40" rx="3" class="sk" stroke-dasharray="6 4"/>
    <text x="600" y="200" class="sk-note">about</text>

    <!-- terminal sketch -->
    <rect x="40" y="250" width="420" height="160" rx="8" class="sk"/>
    <circle cx="60" cy="270" r="4" class="sk"/>
    <circle cx="76" cy="270" r="4" class="sk"/>
    <circle cx="92" cy="270" r="4" class="sk"/>
    <line x1="60" y1="290" x2="300" y2="290" class="sk" stroke-dasharray="3 3"/>
    <line x1="60" y1="310" x2="260" y2="310" class="sk" stroke-dasharray="3 3"/>
    <line x1="60" y1="330" x2="340" y2="330" class="sk" stroke-dasharray="3 3"/>
    <text x="480" y="320" class="sk-note">terminal ← cool</text>
    <text x="480" y="338" class="sk-note">2am</text>

    <!-- hero links -->
    <rect x="40" y="440" width="120" height="30" rx="6" class="sk"/>
    <rect x="170" y="440" width="100" height="30" rx="6" class="sk"/>
    <rect x="280" y="440" width="80" height="30" rx="6" class="sk"/>

    <!-- spotify + relay -->
    <line x1="40" y1="510" x2="380" y2="510" class="sk" stroke-dasharray="8 6"/>
    <text x="400" y="514" class="sk-note">spotify / relay</text>

    <!-- education section -->
    <line x1="40" y1="580" x2="200" y2="580" class="sk"/>
    <text x="50" y="575" class="sk-text">EDUCATION</text>
    <rect x="40" y="600" width="760" height="80" rx="6" class="sk" stroke-dasharray="4 4"/>
    <rect x="40" y="700" width="760" height="80" rx="6" class="sk" stroke-dasharray="4 4"/>

    <!-- experience section -->
    <line x1="40" y1="830" x2="220" y2="830" class="sk"/>
    <text x="50" y="825" class="sk-text">EXPERIENCE</text>
    <rect x="40" y="850" width="760" height="100" rx="6" class="sk"/>
    <rect x="40" y="970" width="760" height="80" rx="6" class="sk" stroke-dasharray="4 4"/>
    <text x="710" y="900" class="sk-note">current ← warm</text>

    <!-- projects section -->
    <line x1="40" y1="1100" x2="200" y2="1100" class="sk"/>
    <text x="50" y="1095" class="sk-text">PROJECTS</text>
    <rect x="40" y="1120" width="240" height="160" rx="8" class="sk"/>
    <rect x="300" y="1120" width="240" height="160" rx="8" class="sk"/>
    <rect x="560" y="1120" width="240" height="160" rx="8" class="sk"/>
    <text x="40" y="1310" class="sk-note">redo layout ↑</text>

    <!-- skills section -->
    <line x1="40" y1="1380" x2="160" y2="1380" class="sk"/>
    <text x="50" y="1375" class="sk-text">SKILLS</text>
    <rect x="40" y="1400" width="760" height="120" rx="6" class="sk" stroke-dasharray="5 4"/>

    <!-- teaching -->
    <line x1="40" y1="1570" x2="200" y2="1570" class="sk"/>
    <text x="50" y="1565" class="sk-text">TEACHING</text>
    <rect x="40" y="1590" width="760" height="80" rx="6" class="sk" stroke-dasharray="4 4"/>

    <!-- recommendations -->
    <line x1="40" y1="1720" x2="280" y2="1720" class="sk"/>
    <text x="50" y="1715" class="sk-text">RECOMMENDATIONS</text>
    <rect x="40" y="1740" width="360" height="100" rx="8" class="sk"/>
    <rect x="420" y="1740" width="360" height="100" rx="8" class="sk"/>

    <!-- connect -->
    <line x1="40" y1="1900" x2="200" y2="1900" class="sk"/>
    <text x="50" y="1895" class="sk-text">CONNECT</text>
    <rect x="40" y="1920" width="760" height="120" rx="8" class="sk"/>
    <rect x="200" y="2060" width="440" height="180" rx="8" class="sk" stroke-dasharray="6 4"/>
    <text x="350" y="2150" class="sk-note">baku map</text>

    <!-- coffee ring stain -->
    <circle cx="700" cy="420" r="32" class="sk-ring"/>
    <circle cx="700" cy="420" r="30" class="sk-ring"/>
    <circle cx="700" cy="420" r="28" class="sk-ring" opacity="0.08"/>

    <!-- margin scribbles -->
    <text x="10" y="160" class="sk-note" transform="rotate(-90 10 160)">v1.4</text>
    <text x="780" y="1560" class="sk-note">move?</text>
    <path d="M 760 880 Q 780 860 800 870" class="sk" opacity="0.3"/>
  </svg>`;
}
