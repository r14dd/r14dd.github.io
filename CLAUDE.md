# r14dd.github.io

Personal site of Riad Mukhtarov (r14dd). Astro 7, `output: "static"`, deployed
to GitHub Pages by CI on push to main. This is a personal artifact: no SEO
work (explicitly declined).

## Commands

- `npm run build`: full static build; must be clean before declaring done.
- `npm run lint`: lint; `npx prettier --check .` mirrors the commit gate.
- Tests are Playwright: import from `'playwright/test'` (NOT
  `@playwright/test`), and there is no `--project=chromium` project. Don't
  pass one.

## Invariants

- `.githooks/pre-commit` runs prettier (repo sets `core.hooksPath`);
  unformatted files fail the deploy workflow.
- A new page requires bumping `claims.pages` in `src/data/claims.ts`.
- Content is trilingual (en/ru/az) and DRY: `src/data/profile-i18n.ts` is the
  single source of truth for every word; builders consume it. Never copy
  profile text into markup.
- Zero new runtime dependencies.
- Add, don't subtract: existing visual patterns (eyebrows, cards, gradient
  hero, dots, emoji toggle) stay unless Riad asks.
- `/lab` is an experiments sandbox kept off the main site; its WASM is a
  committed prebuilt artifact. CI does not compile Rust.
- `/genx` is the "Quorum Line" redesign with its own design system
  (`design-system/`) and project agents (principal-design, principal-swe,
  design-critic). Use those agents for /genx work.

## Workers

Four Cloudflare workers (toy APIs), all answering `GET /health`. CI deploys
them, but the `CLOUDFLARE_API_TOKEN` repo secret is not set yet, so the
Deploy Workers run on main is EXPECTED red until Riad adds it (a dashboard
action only he can do; never handle the token value). Wrangler creds exist on
this machine. Run worker deploys locally instead of handing Riad commands.

## Git

- Never add Co-Authored-By or any AI attribution anywhere: commits, PRs,
  comments, docstrings.
- Don't commit or push unless asked. `pull.rebase` is set: stash before
  `git pull --ff-only` if the tree is dirty.
