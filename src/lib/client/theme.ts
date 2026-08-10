// The theme toggle. The accent itself is owned by time-aware.ts (data-period on
// <html> + base.css) — nothing here ever chooses an accent. It does hold the
// current one still for a few frames mid-toggle; see PALETTE.
import * as sfx from './sfx';

// A wave, not a wipe. Every block re-tints in place on its own delay, ordered by
// how far it sits from the toggle, and nothing is ever painted on top of the
// page: there is no overlay for the page to sit under and no far corner for an
// edge to crawl to. The circular wipe this replaced spent 43% of its life on the
// last 15% of its radius — a circle sweeps slowest exactly where it still has
// the most ground to cover, so the corner always finished long after the rest.
const TINT_MS = 300; // how long one block takes to change colour
const GROUND_MS = 170; // backgrounds land first, so text is never dark on dark
const SPREAD_MS = 130; // how much later the furthest block starts than the first
// The page canvas is a single element: it cannot ripple, it can only flip once,
// and every block whose text is still mid-fade is stranded on it. Flipping it
// first strands the far blocks (light text on a white page); flipping it last
// strands the near ones. Dead centre of the wave splits that mismatch evenly,
// and measured, it disappears: at 0.4 the furthest block stood as light text on
// a white canvas for ~110ms on a phone at 4x CPU throttle, and at 0.5 that
// window closes without opening one at the near end.
const GROUND_DELAY_MS = Math.round(SPREAD_MS * 0.5);
// Stripping the transition while a block is still on its last few percent makes
// that block snap, which is exactly the tell to avoid.
const SETTLE_MS = 140;
const BLOCKS =
  '.section-block, .connect-footer, .terminal-window, .side-nav, .side-links, .lang-switcher, .cmd-trigger, .mobile-nav';

// Every custom property that differs between the two themes. Staging is done by
// writing these onto an element: an inline copy of the OLD palette makes it deaf
// to html.light, and writing the NEW one over it is what releases it. Neither
// set is a colour decision — both are read straight back out of the cascade that
// base.css and time-aware.ts produced, accent included, so a block lands on
// exactly the value it would have had with no ripple at all, and the pins are
// gone again by the time the wave settles.
//
// It has to work this way because CSS transition-delay is unusable on this page.
// A delayed transition on a descendant is retargeted every frame the inherited
// variable changes, and re-arms its delay each time: measured, the text advanced
// 4% and then hung for ~350ms before snapping. Delays live in setTimeout now and
// the CSS transition always starts immediately.
const PALETTE = [
  '--bg',
  '--bg-rgb',
  '--text',
  '--text-soft',
  '--muted',
  '--accent',
  '--accent-rgb',
  '--border',
  '--surface',
  '--surface-solid',
  '--surface-panel',
  '--overlay',
  '--overlay-strong',
  '--shadow',
  '--shadow-strong',
  '--noise-opacity',
  '--card-hover',
  '--selection',
  '--marker',
];

export const initTheme = () => {
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle?.querySelector('.theme-icon');
  const updateThemeIcon = () => {
    const isLight = document.documentElement.classList.contains('light');
    if (themeIcon) themeIcon.textContent = isLight ? '🌙' : '☀️';
    themeToggle?.setAttribute(
      'aria-label',
      isLight ? 'Switch to dark mode' : 'Switch to light mode',
    );
  };

  const root = document.documentElement;
  const readPalette = () => {
    const cs = getComputedStyle(root);
    return PALETTE.map((v) => cs.getPropertyValue(v));
  };
  const write = (el: HTMLElement, values: string[]) => {
    for (let i = 0; i < PALETTE.length; i++) el.style.setProperty(PALETTE[i], values[i]);
  };

  const staged = new Set<HTMLElement>();
  let timers: ReturnType<typeof setTimeout>[] = [];

  const clearRipple = () => {
    for (const t of timers) clearTimeout(t);
    timers = [];
    root.classList.remove('theme-morphing');
    root.style.removeProperty('--tint-ms');
    root.style.removeProperty('--tint-ground-ms');
    for (const el of staged) for (const v of PALETTE) el.style.removeProperty(v);
    staged.clear();
  };

  // Hand each block its delay, pin the whole page to the palette it is wearing
  // now, flip the theme, and let the pins come off one block at a time.
  // Distances are measured against the furthest viewport corner, so the spread
  // is the same gesture on a laptop and on a phone; blocks below the fold clamp
  // to the end of the wave, where nobody is looking anyway.
  const ripple = (x: number, y: number, flip: () => void) => {
    const reach = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const old = readPalette();

    // Every measurement before every write: a pin dirties style, so interleaving
    // the two would recalculate the tree once per block.
    const wave: { el: HTMLElement; delay: number }[] = [];
    for (const el of document.querySelectorAll<HTMLElement>(BLOCKS)) {
      const r = el.getBoundingClientRect();
      const d = Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y);
      wave.push({ el, delay: Math.round(Math.min(d / reach, 1) * SPREAD_MS) });
    }
    // html and body both paint the canvas, and body carries everything that is
    // not inside a staged block — the hero above all. They are the ground, and
    // they move together in the middle of the wave.
    wave.push({ el: document.body, delay: GROUND_DELAY_MS });

    for (const { el } of wave) {
      write(el, old);
      staged.add(el);
    }

    // One source of truth for the durations: the CSS reads them back out.
    root.style.setProperty('--tint-ms', `${TINT_MS}ms`);
    root.style.setProperty('--tint-ground-ms', `${GROUND_MS}ms`);
    // The transition has to be in the style tree in the same recalculation as
    // the colour change, or the first release is a snap and not a fade.
    root.classList.add('theme-morphing');
    flip();

    // Read the new palette off :root while :root is still unpinned, then pin it.
    // Nothing paints between the flip and the pin — this is all one turn — so
    // the canvas never shows the new theme early.
    const next = readPalette();
    write(root, old);
    staged.add(root);
    wave.push({ el: root, delay: GROUND_DELAY_MS });

    // Releasing by writing the new values rather than by removing the pin keeps
    // the wave order-independent: a block that comes off early does not have to
    // wait for its still-pinned ancestors to catch up.
    let last = 0;
    for (const { el, delay } of wave) {
      timers.push(setTimeout(() => write(el, next), delay));
      last = Math.max(last, delay);
    }
    timers.push(setTimeout(clearRipple, last + TINT_MS + SETTLE_MS));
  };

  themeToggle?.addEventListener('click', () => {
    sfx.click();
    // Before anything is read: a toggle landing mid-wave must snap the page to
    // where it was headed, or the next wave would pin the half-faded values it
    // is standing on and hold them as if they were a theme.
    clearRipple();

    const willBeLight = !root.classList.contains('light');
    const themeColorMeta = document.getElementById('theme-color-meta');
    const doToggle = () => {
      root.classList.toggle('light');
      localStorage.setItem('portfolio-theme', willBeLight ? 'light' : 'dark');
      updateThemeIcon();
      // Belongs here, not on the early-return path: the animated branch used to
      // skip it, so on desktop the browser chrome stayed dark behind a light page.
      themeColorMeta?.setAttribute('content', willBeLight ? '#ffffff' : '#050505');
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      doToggle();
      return;
    }

    const rect = themeToggle.getBoundingClientRect();
    ripple(rect.left + rect.width / 2, rect.top + rect.height / 2, doToggle);
  });

  updateThemeIcon();
};
