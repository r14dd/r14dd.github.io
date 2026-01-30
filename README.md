# Riad Mukhtarov — Portfolio

Minimalist, high‑end personal portfolio built to present backend engineering work with clarity, focus, and production‑grade polish.

## Live

- **Website:** htps://r14dd.github.io

## Why this site exists

This portfolio is meant to read like a calm, confident system: clear sections, sharp typography, and purposeful interactions.  
The design keeps attention on the work itself—experience, projects, and results—while still feeling premium.

## Highlights

- **Minimalist dark UI** with strong hierarchy and readable spacing
- **Desktop + mobile navigation** (sidebar + bottom pill)
- **Intro animation** and staged section reveals
- **Project cards** with impact lines and GitHub links
- **Resume preview** on hover (desktop)
- **Responsive layout** across modern devices
- **Reduced‑motion friendly** for accessibility

## Tech Stack

- **Framework:** Astro
- **Language:** TypeScript
- **Styling:** Custom CSS (no framework)
- **Fonts:** Inter + mono accents

## Project Structure

```
src/
  layouts/BaseLayout.astro   # Global layout + CSS
  pages/index.astro          # Page markup + interactions
  data/profile.ts            # Profile content + links
public/
  resume.pdf                 # Resume file served directly
  assets/                    # Images / media
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

Update the content in one place:

- **Profile content + links:** `src/data/profile.ts`
- **Resume file:** `public/resume.pdf`

## Deployment

Use any static host (GitHub Pages / Vercel / Netlify).

Example build:
```bash
npm run build
```

## Credits

Design inspiration: **paco.me**

## ➤ Authors

- [Riad Mukhtarov](https://www.linkedin.com/in/riadmukhtarov/)

---
## ➤ License

[MIT](https://choosealicense.com/licenses/mit/)