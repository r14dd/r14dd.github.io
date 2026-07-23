// Shared motion flags, evaluated once at import — the whole page treats
// reduced-motion as a load-time decision (matching the original inline
// script, which captured it in one const at startup).
export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// prefers-reduced-motion variant for every scrollIntoView call site.
export const scrollBehavior: ScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';
