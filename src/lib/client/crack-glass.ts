// @ts-nocheck
import { state } from './state';

export const initCrackGlass = () => {
  // Five hits, but at the same rate three used to need (~4.3/sec) — widening the
  // window with the count keeps the gesture "rage", not "fast enough to be luck".
  const CLICK_WINDOW = 1200;
  const MIN_CLICKS = 5;
  const REPAIR_DELAY = 2500;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  let glassActive = false;
  let repairTimer = null;
  const clickLog = [];

  let pane = null;
  let svg = null;
  // Each fracture keeps the point it was struck at, so the crew can walk to that
  // exact spot and mend it there rather than clearing the glass wholesale.
  const fractures = [];

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
    fractures.push({ el: g, x, y });
    pane.classList.add('cracked');
  };

  // Impacts landing on top of each other are one job, not several. Merging also
  // bounds the walk: a long rage-click burst still resolves in a few stops.
  const clusterImpacts = () => {
    let radius = 90;
    let groups = [];
    for (let attempt = 0; attempt < 6; attempt++) {
      groups = [];
      for (const f of fractures) {
        const near = groups.find((c) => Math.hypot(c.x - f.x, c.y - f.y) <= radius);
        if (near) {
          // The first impact stays the anchor the crew walks to.
          near.items.push(f);
        } else {
          groups.push({ x: f.x, y: f.y, items: [f] });
        }
      }
      if (groups.length <= 5) break;
      radius *= 1.7;
    }
    return groups;
  };

  const tween = (ms, onFrame) =>
    new Promise((resolve) => {
      let t0 = null;
      const step = (ts) => {
        if (t0 === null) t0 = ts;
        const p = Math.min((ts - t0) / ms, 1);
        onFrame(p < 1 ? p * p * (3 - 2 * p) : 1); // smoothstep
        p < 1 ? requestAnimationFrame(step) : resolve();
      };
      requestAnimationFrame(step);
    });

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const spawnCrew = async () => {
    if (!pane) return;
    pane.classList.add('repairing');

    const crew = document.createElement('div');
    crew.className = 'repair-crew active';
    ['\u{1F9F9}', '\u{1F527}'].forEach((ch, i) => {
      const w = document.createElement('span');
      w.className = 'repair-worker';
      w.textContent = ch;
      w.style.animationDelay = `${i * 0.12}s`;
      crew.appendChild(w);
    });
    pane.appendChild(crew);

    const stops = clusterImpacts();
    const place = (x, y) => {
      crew.style.transform = `translate(${x}px, ${y}px)`;
    };

    // Walk in from whichever side edge is closest to the first break.
    let cur = { x: stops.length && stops[0].x > innerWidth / 2 ? innerWidth + 80 : -80, y: 0 };
    cur.y = stops.length ? stops[0].y : innerHeight / 2;
    place(cur.x, cur.y);

    const PATCH_MS = stops.length > 3 ? 150 : 230;

    // Visit the nearest remaining break each time, so the path never criss-crosses.
    const remaining = stops.slice();
    while (remaining.length) {
      let bi = 0;
      let bd = Infinity;
      remaining.forEach((s, i) => {
        const dist = Math.hypot(s.x - cur.x, s.y - cur.y);
        if (dist < bd) {
          bd = dist;
          bi = i;
        }
      });
      const stop = remaining.splice(bi, 1)[0];

      const from = { ...cur };
      await tween(Math.min(Math.max(bd / 1.4, 220), 560), (p) => {
        place(from.x + (stop.x - from.x) * p, from.y + (stop.y - from.y) * p);
      });
      cur = { x: stop.x, y: stop.y };

      // Patch this break, here, before moving on.
      crew.classList.add('fixing');
      const patch = document.createElement('div');
      patch.className = 'repair-patch';
      patch.style.left = `${stop.x}px`;
      patch.style.top = `${stop.y}px`;
      pane.appendChild(patch);

      await wait(PATCH_MS);
      stop.items.forEach((f) => f.el.classList.add('crack-healed'));
      await wait(PATCH_MS);
      crew.classList.remove('fixing');
      setTimeout(() => patch.remove(), 500);
    }

    // Job done — walk off the nearest edge.
    const exitX = cur.x > innerWidth / 2 ? innerWidth + 90 : -90;
    const from = { ...cur };
    await tween(460, (p) => place(from.x + (exitX - from.x) * p, from.y));

    if (svg) svg.innerHTML = '';
    fractures.length = 0;
    if (pane) {
      pane.classList.remove('cracked', 'repairing');
      crew.remove();
    }
    document.body.classList.remove('glass-shattered');
    glassActive = false;
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
      // The burst has by now triple-clicked a paragraph into selection. Drop it
      // and suppress further selection, so this reads as hitting glass, not
      // dragging text.
      window.getSelection()?.removeAllRanges();
      document.body.classList.add('glass-shattered');
      addCrack(e.clientX, e.clientY);
      clickLog.length = 0;
      repairTimer = setTimeout(spawnCrew, REPAIR_DELAY);
    }
  });
};
