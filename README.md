<p align="center">
  <img src="https://img.shields.io/badge/Astro-111827?style=for-the-badge&logo=astro&logoColor=white" alt="Astro" />
  <img src="https://img.shields.io/badge/TypeScript-111827?style=for-the-badge&logo=typescript&logoColor=3178C6" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Rust-111827?style=for-the-badge&logo=rust&logoColor=DEA584" alt="Rust" />
  <img src="https://img.shields.io/badge/WebAssembly-111827?style=for-the-badge&logo=webassembly&logoColor=654FF0" alt="WebAssembly" />
  <img src="https://img.shields.io/badge/Cloudflare%20Workers-111827?style=for-the-badge&logo=cloudflare&logoColor=F38020" alt="Cloudflare Workers" />
</p>

# Riad Mukhtarov — Portfolio

Minimalist personal portfolio built to present AI and software engineering work with clarity and focus.

## Live

- **Website:** https://riad.cc

## Highlights

- **Interactive terminal** — composable commands with pipes, tab-completion, history (`ls`, `cat`, `grep`, `head`, `tail`, `wc`, `man riad`, `neofetch`, `philosophy`); fully usable on touch, not desktop-gated
- **Rust → WebAssembly** — `rrf`, `hash`, `xor` commands lazy-load a prebuilt WASM binary for real in-browser compute
- **Web Vitals CLI** — `perf` command shows live LCP/FCP/CLS/INP/TTFB/DCL via PerformanceObserver
- **Edge/geo probing** — `where` command displays timezone, locale, connection info, round-trip latency
- **Offline PWA** — `offline enable/disable` registers a root-scoped service worker (network-first navigations, stale-while-revalidate assets)
- **Raft consensus, live** — a real Raft implementation (leader election, log replication, quorum commitment over a lossy simulated network) runs interactively on `/lab`; CI runs the same engine headless and asserts the paper's safety properties (Election Safety, Log Matching, State Machine Safety)
- Dark + light theme toggle
- Accent colors shift by time of day
- **Three languages, three real pages** — `/`, `/ru/`, `/az/` are each prerendered and indexable with their own `hreflang`, title and description; the in-page switcher swaps without a reload and pushes the matching URL. Both paths render through the same builders, so they cannot drift.
- Command palette (⌘K) with search, section jumps, and actions
- Spotify now-playing widget with vinyl art, progress bar, and history drawer
- UI sound effects with mute toggle
- Baku location map card (dark/light variants)
- Project detail modals with simulation visualizations
- Scroll-velocity responsive typography
- Progressive vertical rhythm
- Skeleton shimmer loading states
- Reduced-motion support throughout

## Tech Stack

- **Framework:** Astro 7 (static output)
- **Language:** TypeScript
- **Styling:** Custom CSS (no framework)
- **Animations:** Hand-written CSS transitions driven by `IntersectionObserver` — no animation library
- **Compute:** Rust → WebAssembly, raw `rustc --target wasm32-unknown-unknown` (843-byte artifact, committed; CI does not compile Rust)
- **Fonts:** Manrope · Cormorant Garamond · JetBrains Mono, self-hosted with unicode-range subsetting
- **Runtime dependencies:** 1 (`lenis`) — re-derived from `package.json` on every build by `scripts/check-claims.mjs`
- **Backend:** 4 Cloudflare Workers (Spotify proxy, analytics proxy, poll, toys); the toy worker holds 2 Durable Objects

## Backend

| Worker             | Job                                                             |
| ------------------ | --------------------------------------------------------------- |
| `spotify-worker`   | Now-playing proxy; keeps the refresh token server-side          |
| `analytics-worker` | Cloudflare Web Analytics GraphQL proxy for `/admin`             |
| `poll-worker`      | Poll backend                                                    |
| `toy-worker`       | Visitor counter + paper-airplane inbox (Durable Object, SQLite) |

Each degrades silently: if a Worker is unreachable its widget disappears rather than erroring. That
is right for a visitor and blind for the owner — nothing on the site would ever say a Worker died.
So every Worker also answers `GET /health`, and each one exercises its real dependency rather than
merely proving the script is deployed: the Spotify token exchange, the Cloudflare Analytics API
token (uncached, unlike `/vitals`), the Durable Object bindings. A 200 from the public endpoint
proves much less than it looks like it does — the Spotify proxy returns cached JSON quite happily
with a dead refresh token.

`npm run check:workers` probes all four. `.github/workflows/health.yml` runs it twice a day, and a
red run is an email.

Deploying a Worker is manual (`npx wrangler deploy --cwd <worker-dir>`) — CI has never run
`wrangler` and still doesn't. The probe reports a Worker whose deployed script predates this repo
as `STALE`, which is the only signal anywhere that an edit here was never shipped.

## Claims are tested

`npm run build` runs `scripts/check-claims.mjs`, which re-derives every number this README and
`/colophon` state — runtime dependency count, page count, font bytes, WASM size, gzipped byte
budgets, the feature-module and Worker counts above — from the actual `dist/` output and the tree,
and fails the build on drift. It also fails if the docs start advertising technologies the site no
longer uses.

## Project Structure

```
src/
  layouts/BaseLayout.astro     # Global layout, CSS, cursor, section reveals
  pages/[...lang]/index.astro  # Main page, prerendered per locale (/, /ru/, /az/)
  lib/client/*.ts              # 30 hand-rolled feature modules, code-split
  data/claims.ts               # Numbers the site states about itself
  pages/lab.astro              # Experimental sandbox page
  pages/404.astro              # Custom 404 page
  data/profile.ts              # Profile content + links
  data/profile-i18n.ts         # Translations (en / ru / az)
  lib/builders.ts              # HTML builder utilities
public/
  sw.js                        # Root service worker for offline mode
  resume.pdf                   # Resume file served directly
  lab/lab.wasm                 # Prebuilt Rust → WASM binary (843 bytes)
  lab/sw.js                    # Lab-scoped service worker
  logos/                       # Tech + company logos
  fonts/                       # Self-hosted web fonts
wasm/
  lab.rs                       # Rust source for WASM commands
```

## Local Development

```bash
npm install
npm run dev
```

## Build & Preview

```bash
npm run build       # Static output to dist/
npm run preview
```

## Content Updates

- **Profile content + links:** `src/data/profile.ts`
- **Translations:** `src/data/profile-i18n.ts`
- **Resume file:** `public/resume.pdf`

## Deployment

GitHub Pages — pushes to `main` deploy via GitHub Actions.

## Credits

Design inspiration: **Emil Kowalski** / **paco.me**

## Author

[Riad Mukhtarov](https://www.linkedin.com/in/riadmukhtarov/)

---

[MIT](https://choosealicense.com/licenses/mit/)
