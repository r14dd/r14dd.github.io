// Everything crack-the-glass refuses to treat as a hit. Shared with
// e2e/design-guards.spec.ts so a point that passes there is a point the toy
// accepts.
export const INERT =
  'a, button, input, textarea, select, label, [contenteditable], [role="button"], [role="menuitemradio"], .terminal-body, .terminal-dots, .cmd-palette, .proj-modal, .kbd-overlay, .lang-menu, .mobile-nav-menu, .sim-visual, .theme-toggle, .lang-toggle, .cmd-trigger, .side-nav, .side-links, .hero-links, .connect-links, .find-nav-bar, .ferris';
