# Next

State carried over from the old Mac on 2026-11-12.

## In flight

- `/lab/motion/` (scroll-driven CSS animation experiment) is committed (e7d5e82) and deployed: `src/pages/lab/motion.astro`, `src/styles/motion.css`, `e2e/motion.spec.ts`, a toc chip in `src/pages/lab.astro`, `claims.pages` 18, a row in `e2e/routes.spec.ts`.
- No record that the owner has judged it visually. The homepage stays untouched until it is judged (the `/lab` rule).
- Scenes: hero exit scrub, about pinned word scrub, experience rail draw, projects pinned gallery (pins at >=768px wide and >=600px tall, else a scroll-snap row), static connect.

## Next steps

1. Run `npm ci`, `npm run build`, `npm run lint`, `npx prettier --check .`, `npm run test:e2e`. Done when all pass. Retry the three `design-guards` flakes; on macOS the `smoke.spec.ts` "language switcher works without JavaScript" test is known to fail locally and pass in CI.
2. Preview with `npm run preview -- --ignore-lock` and view `/lab/motion/` at desktop size and 390x844 in Chrome and Safari. Done when the owner has chosen: keep in `/lab`, promote, or drop.
3. Fix stale `CLAUDE.md` lines: the Workers paragraph (Deploy Workers has been green since September, so the missing-token note is out of date) and the `/genx` bullet (no `/genx` route or `design-system/` exists). Done when `CLAUDE.md` matches `gh run list --workflow "Deploy Workers"` and `ls src/pages`.

## Gotchas

- Restraint is the design north star: scroll-jacking and parallax heroes on the homepage count as regressions, so promote scenes one at a time and only on the owner's say.
- The motion plan lived in gitignored `.claude/plans/lab-motion.md` and did not travel; the committed code is the source of truth.
- `animation` shorthand resets `animation-timeline` and `animation-range`; declare both after it.
- A sticky pin breaks under ancestor `overflow` except `clip`; the pin uses `overflow-x: clip` and `100svh`.
- The gallery view uses `data-lenis-prevent-horizontal`; plain `data-lenis-prevent` kills smooth wheel over the pin.
- e2e scrolling: wait for `__lenis` (or reduced motion, or a non-fine pointer), then `__lenis.scrollTo(y, {immediate: true, force: true})`, else `scrollTo({top, behavior: 'instant'})`.
- `inlineStylesheets: 'always'`: import motion CSS in the page, never in BaseLayout.
- `check-claims.mjs` fails on the words GSAP, ScrollTrigger, WebGL, Three.js and wasm-bindgen in `lab.astro`; em dashes fail lint.
- The 2026-11-11 scheduled deploy failed at the Playwright browser-install step; the next push deployed green.
