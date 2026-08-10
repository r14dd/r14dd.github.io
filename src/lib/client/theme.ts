// The theme toggle with its view-transition wipe. The accent itself is owned
// by time-aware.ts (data-period on <html> + base.css) — nothing here may touch
// accent custom properties.
import * as sfx from './sfx';

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
  themeToggle?.addEventListener('click', () => {
    sfx.click();
    const willBeLight = !document.documentElement.classList.contains('light');
    const themeColorMeta = document.getElementById('theme-color-meta');
    const newBg = willBeLight ? '#ffffff' : '#050505';
    const doToggle = () => {
      document.documentElement.classList.toggle('light');
      localStorage.setItem('portfolio-theme', willBeLight ? 'light' : 'dark');
      updateThemeIcon();
      // Belongs here, not on the early-return path: the wipe branch used to skip
      // it, so on desktop the browser chrome stayed dark behind a light page.
      themeColorMeta?.setAttribute('content', newBg);
    };
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (
      !document.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      isMobile
    ) {
      doToggle();
      return;
    }
    const rect = themeToggle.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    const transition = document.startViewTransition(doToggle);
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
        {
          // The wipe is a circle, so the edge sweeps slowest exactly where it has
          // the most ground left to cover — the far corner. The old pairing
          // (900ms, cubic-bezier(0.4, 0, 0.2, 1)) spent 387ms of that on the last
          // 15% of the radius: the corner crawled, and the page sat under the
          // transition layer, unresponsive, for ~300ms after it looked finished.
          // Half the duration and a curve with a shorter tail: the corner now
          // takes ~140ms, and the wipe ends when it looks like it ended.
          duration: 520,
          easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    });
    // A second toggle mid-wipe skips the first transition, rejecting `ready`.
    // That is a normal outcome, not an error — the theme has already flipped.
    transition.ready.catch(() => {});
  });
  updateThemeIcon();
};
