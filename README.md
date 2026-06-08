<p align="center">
  <img src="https://img.shields.io/badge/Astro-111827?style=for-the-badge&logo=astro&logoColor=white" alt="Astro" />
  <img src="https://img.shields.io/badge/TypeScript-111827?style=for-the-badge&logo=typescript&logoColor=3178C6" alt="TypeScript" />
  <img src="https://img.shields.io/badge/CSS-111827?style=for-the-badge&logo=css3&logoColor=1572B6" alt="CSS" />
  <img src="https://img.shields.io/badge/HTML-111827?style=for-the-badge&logo=html5&logoColor=E34F26" alt="HTML5" />
</p>

# Riad Mukhtarov — Portfolio

Minimalist personal portfolio built to present backend engineering work with clarity and focus.

## Live

- **Website:** https://r14dd.github.io

## Why this site exists

Clear sections, sharp typography, and small interactions that make the site feel good to use. The design keeps attention on the work itself.

## Highlights

- Dark + light theme toggle
- Accent colors shift by time of day (morning, afternoon, evening, night)
- Hero greeting changes based on local time
- Three languages: English, Russian, Azerbaijani
- Command palette (⌘K) with search, section jumps, and actions
- Keyboard shortcuts overlay
- In-page find (⌘F) with match highlighting
- Spotify now-playing widget with vinyl art, progress bar, and history drawer
- UI sound effects with mute toggle
- Baku location map card (dark/light variants)
- Project detail modals (swipe-to-dismiss on mobile, pinch-to-zoom on visuals)
- Animated badge counters
- Intro animation and staged section reveals
- Desktop sidebar + mobile bottom pill navigation
- Resume preview on hover (desktop)
- Custom 404 page
- Reduced-motion support

## Tech Stack

- **Framework:** Astro
- **Language:** TypeScript
- **Styling:** Custom CSS (no framework)
- **Fonts:** Inter + mono accents
- **Spotify API:** Cloudflare Worker proxy

## Project Structure

```
src/
  layouts/BaseLayout.astro     # Global layout + CSS variables
  pages/index.astro            # Single-page app: markup, styles, interactions
  pages/404.astro              # Custom 404 page
  data/profile.ts              # Profile content + links
  data/profile-i18n.ts         # Translations (en / ru / az)
  lib/builders.ts              # HTML builder utilities
public/
  resume.pdf                   # Resume file served directly
  logos/                       # Tech + company logos
  fonts/                       # Self‑hosted web fonts
  map-baku-dark.png            # Location map (dark)
  map-baku-light.png           # Location map (light)
  og-preview.png               # Open Graph preview image
```

## Local Development

```bash
npm install
npm run dev
```

## Build & Preview

```bash
npm run build
npm run preview
```

## Content Updates

- **Profile content + links:** `src/data/profile.ts`
- **Translations:** `src/data/profile-i18n.ts`
- **Resume file:** `public/resume.pdf`

## Deployment

GitHub Pages — push to `gh-pages` branch.

```bash
npm run build
```

## Credits

Design inspiration: **Emil Kowalski** / **paco.me**

## Authors

- [Riad Mukhtarov](https://www.linkedin.com/in/riadmukhtarov/)

---

## License

[MIT](https://choosealicense.com/licenses/mit/)
