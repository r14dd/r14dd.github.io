import { defineConfig } from 'playwright/test';

// Behavioral smoke suite for the homepage script. Runs against the built site
// (astro preview). Locally that's the already-installed Chrome — no browser
// downloads. In CI it's a pinned Playwright chromium (`playwright install`),
// so the suite doesn't drift with whatever Chrome the runner image ships.
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4321',
    channel: process.env.CI ? undefined : 'chrome',
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
