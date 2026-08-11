// The theme toggle. The accent itself is owned by time-aware.ts (data-period on
// <html> + base.css) — nothing here may touch accent custom properties.
import * as sfx from './sfx';
import { setItem } from './storage';

// One crossfade for the whole page, all of it at once. Two earlier versions
// tried to make the change travel — a circle wiped outwards from the button, and
// then a wave that re-tinted block by block — and both read as odd for the same
// reason: they asked you to watch a colour change go somewhere. A theme is not
// an event with a location. The page is simply the other colour a quarter of a
// second later, and the only thing to notice is that nothing flashed.
const TINT_MS = 240; // text, borders and accents
// The one thing that is not simultaneous, and it is not a sequence you can see.
// Run the ground and the figure on the same curve and they cross in the middle
// at the same grey: for a beat the page is flat and the words are gone. Letting
// the background land first pulls that crossing early and steepens it, so the
// worst moment is soft grey text on white rather than no text at all.
const GROUND_MS = 150;
// Stripping the transition while colours are still on their last few percent
// makes them snap, which is exactly the tell to avoid.
const SETTLE_MS = 60;

export const initTheme = () => {
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle?.querySelector('.theme-icon');
  const root = document.documentElement;
  const updateThemeIcon = () => {
    const isLight = root.classList.contains('light');
    if (themeIcon) themeIcon.textContent = isLight ? '🌙' : '☀️';
    themeToggle?.setAttribute(
      'aria-label',
      isLight ? 'Switch to dark mode' : 'Switch to light mode',
    );
  };

  let settle: ReturnType<typeof setTimeout> | undefined;

  themeToggle?.addEventListener('click', () => {
    sfx.click();
    const willBeLight = !root.classList.contains('light');
    const themeColorMeta = document.getElementById('theme-color-meta');
    const doToggle = () => {
      root.classList.toggle('light');
      setItem('portfolio-theme', willBeLight ? 'light' : 'dark');
      updateThemeIcon();
      // Belongs here, not on the early-return path: the animated branch used to
      // skip it, so on desktop the browser chrome stayed dark behind a light page.
      themeColorMeta?.setAttribute('content', willBeLight ? '#ffffff' : '#050505');
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      doToggle();
      return;
    }

    // One source of truth for the durations: the CSS reads them back out.
    root.style.setProperty('--tint-ms', `${TINT_MS}ms`);
    root.style.setProperty('--tint-ground-ms', `${GROUND_MS}ms`);
    // The transition has to be in the style tree in the same recalculation as
    // the colour change, or the first paint is a snap and not a fade.
    root.classList.add('theme-morphing');
    doToggle();

    // Toggling again mid-fade restarts the crossfade, so the old timer would
    // strip the transition out from under it.
    clearTimeout(settle);
    settle = setTimeout(() => {
      root.classList.remove('theme-morphing');
      root.style.removeProperty('--tint-ms');
      root.style.removeProperty('--tint-ground-ms');
    }, TINT_MS + SETTLE_MS);
  });

  updateThemeIcon();
};
