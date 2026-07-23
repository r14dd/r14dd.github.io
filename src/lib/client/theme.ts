// Night accent tint + the theme toggle with its view-transition wipe.
import * as sfx from './sfx';

export const initTheme = () => {
  {
    const h = new Date().getHours();
    if (h >= 0 && h < 5) {
      document.documentElement.style.setProperty('--accent', '#a78bfa');
      document.documentElement.style.setProperty('--accent-rgb', '167,139,250');
    }
  }

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
    };
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (
      !document.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      isMobile
    ) {
      doToggle();
      if (themeColorMeta) themeColorMeta.setAttribute('content', newBg);
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
          duration: 900,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    });
  });
  updateThemeIcon();
};
