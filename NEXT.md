# Next

## State (2026-11-16)

- Nothing in flight. `/lab/motion/` (a scroll-driven CSS rebuild of the homepage) was built, reviewed and then dropped on the owner's call (did not like any of it). Do not revive it or promote its scenes to the homepage unless asked.
- Build, lint, prettier and e2e pass (82/83 on 2026-11-15). On macOS the `smoke.spec.ts` "language switcher works without JavaScript" test is known to fail locally and pass in CI; the three `design-guards` tests are flaky.

## Gotchas

- The build needs `tectonic` on PATH (prebuilt binary in `~/.local/bin`). `brew install tectonic` compiles LLVM on this Intel Mac; don't.
- Playwright browsers are per version: after a `playwright` bump, run `npx playwright install chromium` or `build-og` fails.
- Restraint is the design north star: scroll-jacking and parallax heroes on the homepage count as regressions.
- `check-claims.mjs` fails on the words GSAP, ScrollTrigger, WebGL, Three.js and wasm-bindgen in `lab.astro`; em dashes fail lint.
