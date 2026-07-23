import { defineConfig } from 'playwright/test';

// Behavioral smoke suite for the homepage script. Runs against the built site
// (astro preview) in the locally installed Chrome — no browser downloads.
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 1,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4321',
    channel: 'chrome',
    headless: true,
    viewport: { width: 1280, height: 900 },
  },
  webServer: {
    command: 'npm run preview',
    port: 4321,
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
