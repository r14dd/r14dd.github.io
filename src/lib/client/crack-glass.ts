// @ts-nocheck
import { state } from './state';

export const initCrackGlass = () => {
  const CLICK_WINDOW = 700;
  const MIN_CLICKS = 3;
  const REPAIR_DELAY = 2500;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  let glassActive = false;
  let repairTimer = null;
  const clickLog = [];

  let pane = null;
  let svg = null;

  const isInteractive = (el) => {
    if (!el) return false;
    return (
      el.closest(
        'a, button, input, textarea, select, label, [contenteditable], [role="button"], [role="menuitemradio"], .terminal-body, .terminal-dots, .cmd-palette, .proj-modal, .kbd-overlay, .lang-menu, .mobile-nav-menu, .sim-visual, .theme-toggle, .lang-toggle, .cmd-trigger, .side-nav, .side-links, .hero-links, .connect-links, .find-nav-bar, .ferris',
      ) !== null
    );
  };

  const ensurePane = () => {
    if (pane) return;
    pane = document.createElement('div');
    pane.className = 'glass-pane';
    pane.setAttribute('aria-hidden', 'true');
    svg = document.createElementNS(SVG_NS, 'svg');
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
    pane.appendChild(svg);
    document.body.appendChild(pane);
  };

  const addCrack = (x, y) => {
    ensurePane();
    svg.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);

    const g = document.createElementNS(SVG_NS, 'g');

    const ringCount = 5 + Math.floor(Math.random() * 4);
    const ringR = 5 + Math.random() * 8;
    for (let i = 0; i < ringCount; i++) {
      const a = (Math.PI * 2 * i) / ringCount + (Math.random() - 0.5) * 0.3;
      const r = ringR * (0.6 + Math.random() * 0.4);
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', String(x));
      line.setAttribute('y1', String(y));
      line.setAttribute('x2', String(x + Math.cos(a) * r));
      line.setAttribute('y2', String(y + Math.sin(a) * r));
      line.setAttribute('class', 'crack-line crack-ring');
      g.appendChild(line);
    }

    const branches = 3 + Math.floor(Math.random() * 3);
    for (let b = 0; b < branches; b++) {
      const baseAngle = (Math.PI * 2 * b) / branches + (Math.random() - 0.5) * 0.7;
      const totalLen = 40 + Math.random() * 100;
      const segs = 4 + Math.floor(Math.random() * 4);
      let cx = x,
        cy = y;
      let d = `M${cx.toFixed(1)},${cy.toFixed(1)}`;
      let angle = baseAngle;

      for (let s = 0; s < segs; s++) {
        const segLen = (totalLen / segs) * (0.7 + Math.random() * 0.6);
        angle += (Math.random() - 0.5) * 0.5;
        cx += Math.cos(angle) * segLen;
        cy += Math.sin(angle) * segLen;
        d += ` L${cx.toFixed(1)},${cy.toFixed(1)}`;

        if (Math.random() > 0.55) {
          const sa = angle + (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.9);
          const sl = 8 + Math.random() * 25;
          const subPath = document.createElementNS(SVG_NS, 'path');
          subPath.setAttribute(
            'd',
            `M${cx.toFixed(1)},${cy.toFixed(1)} L${(cx + Math.cos(sa) * sl).toFixed(1)},${(cy + Math.sin(sa) * sl).toFixed(1)}`,
          );
          subPath.setAttribute('class', 'crack-line crack-sub');
          g.appendChild(subPath);
        }
      }

      const mainPath = document.createElementNS(SVG_NS, 'path');
      mainPath.setAttribute('d', d);
      mainPath.setAttribute('class', 'crack-line');
      g.appendChild(mainPath);
    }

    svg.appendChild(g);
    pane.classList.add('cracked');
  };

  const spawnCrew = () => {
    if (!pane) return;
    pane.classList.add('repairing');

    const crew = document.createElement('div');
    crew.className = 'repair-crew';

    ['\u{1F527}', '\u{1F9F9}', '\u{1F624}'].forEach((ch, i) => {
      const w = document.createElement('span');
      w.className = 'repair-worker';
      w.textContent = ch;
      w.style.animationDelay = `${i * 0.15}s`;
      crew.appendChild(w);
    });

    pane.appendChild(crew);
    requestAnimationFrame(() => crew.classList.add('active'));

    setTimeout(() => {
      if (svg) svg.innerHTML = '';
      if (pane) {
        pane.classList.remove('cracked', 'repairing');
        crew.remove();
      }
      document.body.classList.remove('glass-shattered');
      glassActive = false;
    }, 2200);
  };

  // Listen on pointerdown, not click. Rage-clicking is a burst of mousedowns;
  // waiting for `click` loses events and lands after the browser has already
  // turned the burst into a text selection.
  document.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (state.cmdOpen || state.projOpen || state.kbdOpen || state.findNavOpen) return;
    if (isInteractive(e.target)) return;

    const now = performance.now();

    if (glassActive) {
      addCrack(e.clientX, e.clientY);
      if (repairTimer) clearTimeout(repairTimer);
      repairTimer = setTimeout(spawnCrew, REPAIR_DELAY);
      return;
    }

    clickLog.push(now);
    while (clickLog.length > 0 && now - clickLog[0] > CLICK_WINDOW) {
      clickLog.shift();
    }

    if (clickLog.length >= MIN_CLICKS) {
      glassActive = true;
      // A triple-click has by now selected a paragraph. Drop it and suppress
      // further selection, so the burst reads as hitting glass, not dragging text.
      window.getSelection()?.removeAllRanges();
      document.body.classList.add('glass-shattered');
      addCrack(e.clientX, e.clientY);
      clickLog.length = 0;
      repairTimer = setTimeout(spawnCrew, REPAIR_DELAY);
    }
  });
};
