// Every number the colophon says out loud, in one place.
//
// The colophon imports these instead of hard-coding prose numbers, and
// `scripts/check-claims.mjs` re-derives each one from the real build output
// after every `npm run build`. A claim that drifts from reality fails the
// build instead of quietly becoming a lie on a page whose entire job is being
// credible. Written after an audit found the README claiming GSAP and a WebGL
// shader that had both been deleted months earlier.
//
// `exact` values must match reality precisely. `budget` values are ceilings —
// they may come in under, never over.

export const claims = {
  // exact — runtime deps are what actually ships to the browser. astro and
  // @astrojs/sitemap are build-time only and never reach a visitor.
  runtimeDeps: ['lenis'],
  buildOnlyDeps: ['astro', '@astrojs/sitemap'],

  // exact — HTML documents emitted into dist/. More than the nav suggests: the
  // homepage is prerendered once per locale (/, /ru/, /az/), and each piece of
  // writing is its own page. rss.xml is an endpoint, not a document, so it
  // isn't counted here.
  pages: 11,

  // exact — self-hosted woff2 faces and their combined weight
  fontFiles: 12,
  fontBytes: 219_612,

  // exact — the prebuilt Rust artifact, committed rather than compiled in CI
  wasmBytes: 843,

  // budget — gzipped homepage document
  homepageHtmlGzBudget: 40_000,

  // budget — every JS chunk in dist/_astro combined, gzipped. Only a subset
  // loads on any one page; this is the ceiling for the whole site.
  totalJsGzBudget: 60_000,
} as const;

// Presentation helpers so the colophon prose and the checker agree on units.
export const kb = (bytes: number) => `${Math.round(bytes / 1024)}KB`;
