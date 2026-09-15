import { test, expect, type Page } from 'playwright/test';

// One test per shipped route: confirms the page answers with the right
// status, carries a real title, its main landmark is in the DOM, and loads
// without throwing. Shallow and wide, a companion to smoke.spec.ts's deep
// behavioral coverage of '/'.

const pageErrors: string[] = [];
const consoleErrors: string[] = [];

// Two real, reproducible noise sources that aren't page bugs. Named and
// scoped narrowly (not a blanket "ignore errors" filter):
//
// 1. Cloudflare Web Analytics' beacon (every page except /admin/, which
//    opts out) tries to POST its RUM ping to cloudflareinsights.com a few
//    seconds after load. The token is scoped to riad.cc, so against
//    localhost the CORS preflight always fails. Confirmed by waiting past
//    load on every route: identical pair of messages, everywhere the beacon
//    is present, never on /admin/.
// 2. Navigating straight to a 404 response (the not-found test below) makes
//    the browser log the failed document load itself. Pinned to the
//    document's own URL, so a 404 on any *subresource* (a dropped font, a
//    missing /lab/lab.wasm) still fails the route it happens on.
const isExpectedNoise = (text: string, url: string, docUrl: string) =>
  text.includes('cloudflareinsights.com') ||
  url.includes('cloudflareinsights.com') ||
  (url === docUrl && /status of 404/.test(text));

const track = (page: Page) => {
  pageErrors.length = 0;
  consoleErrors.length = 0;
  page.on('pageerror', (err) => pageErrors.push(String(err)));
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    if (isExpectedNoise(msg.text(), msg.location().url, page.url())) return;
    consoleErrors.push(msg.text());
  });
};

test.beforeEach(({ page }) => track(page));

test.afterEach(() => {
  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

// The homepage's interaction layer loads as a deferred chunk right after
// `load` (see smoke.spec.ts). Wait for it before calling a route clean, or
// errors it might throw never get a chance to happen inside the test.
const ready = (page: Page) =>
  page.waitForFunction(() => document.documentElement.dataset.jsReady === '1');

// General settle window so delayed async work (the CF beacon above, any
// other post-load fetch) has run before the afterEach checks fire.
const settle = (page: Page) => page.waitForTimeout(2000);

type Route = {
  path: string;
  // Selector for the page's main content landmark. Most pages share the
  // `<main id="main-content">` layout, but a few roll their own.
  main: string;
  // Only the homepage variants set data-js-ready.
  homepage?: boolean;
};

const routes: Route[] = [
  { path: '/', main: 'main#main-content', homepage: true },
  { path: '/ru/', main: 'main#main-content', homepage: true },
  { path: '/az/', main: 'main#main-content', homepage: true },
  { path: '/resume/', main: 'main#main-content' },
  { path: '/ru/resume/', main: 'main#main-content' },
  { path: '/az/resume/', main: 'main#main-content' },
  { path: '/colophon/', main: 'main#main-content' },
  { path: '/lab/', main: '.lab-page' }, // no <main> here; real content wrapper
  { path: '/poll/', main: 'main.shell' },
  { path: '/writing/', main: 'main#main-content' },
  { path: '/writing/assume-the-model-cooperates-with-the-attacker/', main: 'main#main-content' },
  { path: '/admin/', main: 'main#dash' }, // present, but hidden until an admin key unlocks it
];

for (const { path, main, homepage } of routes) {
  test(`${path} loads clean`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator(main)).toBeAttached();
    if (homepage) await ready(page);
    await settle(page);
  });
}

// 404.astro has no <main>: it's a standalone page, not the shared layout.
test('/404.html is a real, directly-servable page', async ({ page }) => {
  const response = await page.goto('/404.html');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('404: Page Not Found');
  await expect(page.locator('.code')).toHaveText('404');
  await expect(page.locator('main')).toHaveCount(0);
  await settle(page);
});

test('a path with no matching route serves the 404 page', async ({ page }) => {
  const response = await page.goto('/nope/');
  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle('404: Page Not Found');
  await expect(page.locator('.code')).toHaveText('404');
  await settle(page);
});
