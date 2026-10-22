// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://riad.cc',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/poll') &&
        !page.includes('/lab') &&
        !page.includes('/admin') &&
        !page.includes('/food'),
    }),
  ],
  build: {
    inlineStylesheets: 'always',
  },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    },
  },
});
