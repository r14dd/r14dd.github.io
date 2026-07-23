import { test, expect, type Page } from 'playwright/test';

// Regression harness for the homepage script: every interactive feature the
// inline script wires up gets exercised. Written against the pre-refactor
// build as the baseline; any behavior drift after the module split fails here.

const pageErrors: string[] = [];

const track = (page: Page) => {
  pageErrors.length = 0;
  page.on('pageerror', (err) => pageErrors.push(String(err)));
};

test.describe('reduced-motion path (deterministic)', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test.beforeEach(async ({ page }) => {
    track(page);
    await page.goto('/');
    await page.waitForLoadState('load');
  });

  test.afterEach(() => {
    expect(pageErrors).toEqual([]);
  });

  test('hero renders and terminal activates immediately', async ({ page }) => {
    await expect(page.locator('#hero-name')).toContainText('Riad');
    const input = page.locator('.term-input');
    await expect(input).toBeVisible();
    await input.fill('whoami');
    await input.press('Enter');
    await expect(page.locator('.terminal-body')).toContainText('@');
  });

  test('terminal pipes and history', async ({ page }) => {
    const input = page.locator('.term-input');
    await input.fill('projects | wc');
    await input.press('Enter');
    const out = page.locator('.terminal-body .terminal-line:not(#term-input-line)').last();
    await expect(out).toContainText(/^\d+$/);
    await input.fill('help');
    await input.press('Enter');
    await expect(page.locator('.terminal-body')).toContainText('man riad');
  });

  test('command palette: open, fuzzy filter, navigate, close', async ({ page }) => {
    await page.keyboard.press('ControlOrMeta+k');
    await expect(page.locator('#cmd-palette')).toHaveClass(/open/);
    await page.locator('#cmd-input').fill('skil');
    await expect(page.locator('.cmd-item').first()).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.locator('#cmd-palette')).not.toHaveClass(/open/);
    await expect
      .poll(async () => page.evaluate(() => window.scrollY), { timeout: 5000 })
      .toBeGreaterThan(0);
  });

  test('palette find commits to find-nav bar', async ({ page }) => {
    await page.keyboard.press('ControlOrMeta+k');
    await page.locator('#cmd-input').fill('Rust');
    await expect(page.locator('.cmd-item', { hasText: /match(es)? on page/ })).toBeVisible();
    await page.locator('.cmd-item', { hasText: /match(es)? on page/ }).click();
    await expect(page.locator('#find-nav-bar')).toHaveClass(/open/);
    await expect(page.locator('#find-nav-count')).toContainText('/');
    await page.locator('#find-nav-next').click();
    await page.keyboard.press('Escape');
    await expect(page.locator('#find-nav-bar')).not.toHaveClass(/open/);
  });

  test('project modal opens from card and closes on Escape', async ({ page }) => {
    const card = page.locator('#projects .proj-card').first();
    await card.scrollIntoViewIfNeeded();
    await card.click();
    await expect(page.locator('#proj-modal')).toHaveClass(/open/);
    await expect(page.locator('#proj-modal-card h3')).not.toBeEmpty();
    await page.keyboard.press('Escape');
    await expect(page.locator('#proj-modal')).not.toHaveClass(/open/);
  });

  test('keyboard shortcuts: g-nav, ?, backslash theme', async ({ page }) => {
    await page.keyboard.press('g');
    await page.keyboard.press('p');
    await expect(page).toHaveURL(/#projects/);
    await page.keyboard.press('?');
    await expect(page.locator('#kbd-overlay')).toHaveClass(/open/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#kbd-overlay')).not.toHaveClass(/open/);
    const wasLight = await page.evaluate(() =>
      document.documentElement.classList.contains('light'),
    );
    await page.keyboard.press('\\');
    await expect
      .poll(() => page.evaluate(() => document.documentElement.classList.contains('light')))
      .toBe(!wasLight);
  });

  test('language switch re-renders sections in Russian and back', async ({ page }) => {
    await page.locator('#lang-toggle').click();
    await page.locator('#lang-menu button[data-lang="ru"]').click();
    await expect(page.locator('#experience h2')).toContainText(/[А-Яа-я]/, { timeout: 10_000 });
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
    await page.locator('#lang-toggle').click();
    await page.locator('#lang-menu button[data-lang="en"]').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en', { timeout: 10_000 });
  });

  test('side-nav link scrolls and marks active', async ({ page }) => {
    const link = page.locator('.side-nav a[href="#skills"]');
    await link.click();
    await expect(page).toHaveURL(/#skills/);
    await expect
      .poll(async () => page.evaluate(() => window.scrollY), { timeout: 5000 })
      .toBeGreaterThan(0);
  });
});

test.describe('animated path', () => {
  test.beforeEach(async ({ page }) => {
    track(page);
  });

  test.afterEach(() => {
    expect(pageErrors).toEqual([]);
  });

  test('terminal boot animation completes and input activates', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('.term-input');
    await expect(input).toBeVisible({ timeout: 45_000 });
    await input.fill('stats');
    await input.press('Enter');
    await expect(page.locator('.terminal-body .term-stat').first()).toBeVisible();
  });

  test('sim overlay opens from a card sim toggle', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('#projects .sim-toggle').first();
    if ((await toggle.count()) === 0) test.skip();
    await toggle.scrollIntoViewIfNeeded();
    await toggle.click();
    await expect(page.locator('.sim-overlay')).toHaveClass(/open/);
  });
});
