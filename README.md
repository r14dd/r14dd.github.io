<p align="center">
  <img src="https://img.shields.io/badge/Astro-111827?style=for-the-badge&logo=astro&logoColor=white" alt="Astro" />
  <img src="https://img.shields.io/badge/TypeScript-111827?style=for-the-badge&logo=typescript&logoColor=3178C6" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Rust-111827?style=for-the-badge&logo=rust&logoColor=DEA584" alt="Rust" />
  <img src="https://img.shields.io/badge/WebGL-111827?style=for-the-badge&logo=webgl&logoColor=990000" alt="WebGL" />
  <img src="https://img.shields.io/badge/WebAssembly-111827?style=for-the-badge&logo=webassembly&logoColor=654FF0" alt="WebAssembly" />
  <img src="https://img.shields.io/badge/GSAP-111827?style=for-the-badge&logo=greensock&logoColor=88CE02" alt="GSAP" />
</p>

# Riad Mukhtarov — Portfolio

Minimalist personal portfolio built to present backend engineering work with clarity and focus.

## Live

- **Website:** https://riad.cc

## Highlights

- **WebGL hero shader** — animated noise field behind the hero section, accent-colored, scroll-fading, theme-reactive
- **GSAP ScrollTrigger** — scroll-driven section reveals, staggered card entrances, parallax depth on project cards
- **Interactive terminal** — composable commands with pipes, tab-completion, history (`ls`, `cat`, `grep`, `head`, `tail`, `wc`, `man riad`, `neofetch`, `philosophy`)
- **Rust → WebAssembly** — `rrf`, `hash`, `xor` commands lazy-load a prebuilt WASM binary for real in-browser compute
- **Web Vitals CLI** — `perf` command shows live LCP/FCP/CLS/INP/TTFB/DCL via PerformanceObserver
- **Edge/geo probing** — `where` command displays timezone, locale, connection info, round-trip latency
- **Offline PWA** — `offline enable/disable` registers a root-scoped service worker (network-first navigations, stale-while-revalidate assets)
- Dark + light theme toggle
- Accent colors shift by time of day
- Three languages: English, Russian, Azerbaijani
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

- **Framework:** Astro 7
- **Language:** TypeScript
- **Styling:** Custom CSS (no framework)
- **Animations:** GSAP + ScrollTrigger
- **Graphics:** Raw WebGL (no Three.js)
- **Compute:** Rust → WebAssembly (wasm-bindgen)
- **Fonts:** Manrope · Cormorant Garamond · JetBrains Mono
- **Spotify API:** Cloudflare Worker proxy

## Project Structure

```
src/
  layouts/BaseLayout.astro     # Global layout, CSS, cursor, section reveals
  pages/index.astro            # Main page: markup, terminal, WebGL, GSAP
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
