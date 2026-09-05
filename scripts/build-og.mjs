#!/usr/bin/env node
// Renders public/og-<lang>.jpg from the same profile data the site is built
// from, one 1200x630 share-preview card per locale. Runs before `astro
// build` (npm `prebuild`), same as build-resume.mjs, so the cards are never
// stale relative to the words on the page.
//
// Fonts are inlined as base64 data URLs (not file:// src) because Chromium
// treats a page rendered via page.setContent() as an opaque origin and
// blocks file:// font fetches from it.

import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerHooks } from 'node:module';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('..', import.meta.url));

// Same resolve hook as build-resume.mjs: the data modules import each other
// without extensions (Vite resolves that; Node does not).
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.') && !/\.[cm]?[jt]s$/.test(specifier)) specifier += '.ts';
    return next(specifier, context);
  },
});
const { profiles } = await import('../src/data/profile-i18n.ts');

const fontsDir = join(root, 'public/fonts');
const dataUrl = (file) => {
  const buf = readFileSync(join(fontsDir, file));
  return `data:font/woff2;base64,${buf.toString('base64')}`;
};

// Verbatim from src/styles/base.css: family, weight, and unicode-range must
// match so the browser picks the right subset for each script.
const FONT_FACES = `
@font-face {
  font-family: 'Cormorant Garamond';
  font-style: normal;
  font-weight: 600;
  font-display: block;
  src: url(${dataUrl('font-3.woff2')}) format('woff2');
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
@font-face {
  font-family: 'Cormorant Garamond';
  font-style: normal;
  font-weight: 600;
  font-display: block;
  src: url(${dataUrl('font-4.woff2')}) format('woff2');
  unicode-range:
    U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329,
    U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F,
    U+A720-A7FF;
}
@font-face {
  font-family: 'Cormorant Garamond';
  font-style: normal;
  font-weight: 600;
  font-display: block;
  src: url(${dataUrl('font-5.woff2')}) format('woff2');
  unicode-range:
    U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329,
    U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: 'Manrope';
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url(${dataUrl('manrope-cyrillic.woff2')}) format('woff2');
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
@font-face {
  font-family: 'Manrope';
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url(${dataUrl('manrope-latin-ext.woff2')}) format('woff2');
  unicode-range:
    U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329,
    U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F,
    U+A720-A7FF;
}
@font-face {
  font-family: 'Manrope';
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url(${dataUrl('manrope-latin.woff2')}) format('woff2');
  unicode-range:
    U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329,
    U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url(${dataUrl('font-9.woff2')}) format('woff2');
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url(${dataUrl('font-10.woff2')}) format('woff2');
  unicode-range:
    U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329,
    U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F,
    U+A720-A7FF;
}
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url(${dataUrl('font-11.woff2')}) format('woff2');
  unicode-range:
    U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329,
    U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
`;

const esc = (s) =>
  String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

const html = (name, tagline, lang) => `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<style>
${FONT_FACES}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body {
  width: 1200px;
  height: 630px;
  background: #050505;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  overflow: hidden;
}
.card {
  position: relative;
  width: 1200px;
  height: 630px;
  padding: 80px 96px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.name {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 600;
  font-variant-caps: small-caps;
  font-size: 96px;
  line-height: 1.1;
  color: #b8963e;
}
.tagline {
  margin-top: 28px;
  max-width: 920px;
  font-family: 'Manrope', sans-serif;
  font-weight: 400;
  font-size: 34px;
  line-height: 1.35;
  color: #d6d6d6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.corner {
  position: absolute;
  font-family: 'JetBrains Mono', monospace;
  font-size: 22px;
  color: #7a7a7a;
}
.corner.site { left: 96px; bottom: 64px; }
.corner.lang { right: 96px; bottom: 64px; }
</style>
</head>
<body>
<div class="card">
  <div class="name">${esc(name)}</div>
  <div class="tagline">${esc(tagline)}</div>
  <div class="corner site">riad.cc</div>
  <div class="corner lang">${esc(lang)}</div>
</div>
</body>
</html>`;

let browser;
try {
  browser = await chromium.launch();
} catch {
  console.error(
    'build-og: no Playwright chromium browser found — run `npx playwright install chromium`.',
  );
  process.exit(1);
}

try {
  mkdirSync(join(root, 'public'), { recursive: true });
  for (const lang of Object.keys(profiles)) {
    const p = profiles[lang];
    const name = p.hero.name;
    const tagline = p.labels.heroEyebrow;

    const page = await browser.newPage({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 1,
    });
    await page.setContent(html(name, tagline, lang), { waitUntil: 'load' });
    // unicode-range faces only start loading once a glyph in their range is
    // laid out; force it for the exact strings on the card before waiting.
    await page.evaluate(
      ([n, t]) =>
        Promise.all([
          document.fonts.load('600 96px "Cormorant Garamond"', n),
          document.fonts.load('400 34px "Manrope"', t),
          document.fonts.load('400 22px "JetBrains Mono"', 'riad.cc'),
        ]).then(() => document.fonts.ready),
      [name, tagline],
    );
    const out = join(root, `public/og-${lang}.jpg`);
    await page.screenshot({ path: out, type: 'jpeg', quality: 90 });
    await page.close();
    console.log(`build-og: wrote public/og-${lang}.jpg`);
  }
} finally {
  await browser.close();
}
