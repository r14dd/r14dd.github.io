import { test, expect, type Page } from 'playwright/test';

// Regression harness for the homepage script: every interactive feature the
// inline script wires up gets exercised. Written against the pre-refactor
// build as the baseline; any behavior drift after the module split fails here.

const pageErrors: string[] = [];

const track = (page: Page) => {
  pageErrors.length = 0;
  page.on('pageerror', (err) => pageErrors.push(String(err)));
};

// The interaction layer (palette, modal, gestures) loads as a deferred chunk
// right after `load`. Tests act immediately after navigation — humans don't —
// so wait for the whole layer before exercising it.
const ready = (page: Page) =>
  page.waitForFunction(() => document.documentElement.dataset.jsReady === '1');

test.describe('reduced-motion path (deterministic)', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test.beforeEach(async ({ page }) => {
    track(page);
    await page.goto('/');
    await page.waitForLoadState('load');
    await ready(page);
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
    await page.locator('#lang-menu [data-lang="ru"]').click();
    await expect(page.locator('#experience h2')).toContainText(/[А-Яа-я]/, { timeout: 10_000 });
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
    // The swap is in-place, but the URL has to agree with what's on screen —
    // a copied link must resolve to the language the copier was reading.
    await expect(page).toHaveURL(/\/ru\/$/);
    await page.locator('#lang-toggle').click();
    await page.locator('#lang-menu [data-lang="en"]').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en', { timeout: 10_000 });
    await expect(page).toHaveURL(/localhost:4321\/$/);
  });

  test('back button returns to the previous locale without a reload', async ({ page }) => {
    await page.locator('#lang-toggle').click();
    await page.locator('#lang-menu [data-lang="az"]').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'az', { timeout: 10_000 });
    await page.goBack();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en', { timeout: 10_000 });
  });

  test('perf degrades to local-only when the field vitals endpoint is down', async ({ page }) => {
    await page.route('**/analytics-api.riad-mrv.workers.dev/**', (r) => r.abort());
    const input = page.locator('.term-input');
    await input.fill('perf');
    await input.press('Enter');
    await expect(page.locator('.terminal-body')).toContainText('LCP');
    await expect(page.locator('.terminal-body')).toContainText('nothing sent anywhere');
  });

  test('perf shows a field p75 column when the endpoint answers', async ({ page }) => {
    await page.route('**/analytics-api.riad-mrv.workers.dev/vitals', (r) =>
      r.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          window: '7d',
          samples: 1204,
          lcpP75: 1240,
          inpP75: 96,
          clsP75: 0.012,
        }),
      }),
    );
    const input = page.locator('.term-input');
    await input.fill('perf');
    await input.press('Enter');
    const body = page.locator('.terminal-body');
    await expect(body).toContainText('field p75');
    await expect(body).toContainText('1.24 s');
    await expect(body).toContainText('1,204 real loads');
  });

  test('a cold load of /ru/ stays Russian and is fully interactive', async ({ page }) => {
    // The saved preference is English — the URL must still win, or a shared
    // /ru/ link silently flips to English for anyone who visited before.
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('portfolio-lang', 'en'));
    await page.goto('/ru/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
    await expect(page.locator('#experience h2')).toContainText(/[А-Яа-я]/);
    const input = page.locator('.term-input');
    await input.fill('whoami');
    await input.press('Enter');
    await expect(page.locator('.terminal-body')).toContainText('@');
    // And switching away from a localized route lands on the right URL.
    await page.locator('#lang-toggle').click();
    await page.locator('#lang-menu [data-lang="en"]').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en', { timeout: 10_000 });
    await expect(page).toHaveURL(/localhost:4321\/$/);
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

// The whole point of prerendering the locales: what a crawler or a
// JS-disabled reader gets on /ru/ and /az/ must already be in the document.
test.describe('prerendered locales (no JavaScript)', () => {
  test.use({ javaScriptEnabled: false });

  test('/ru/ serves Russian in the raw HTML', async ({ page }) => {
    await page.goto('/ru/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
    await expect(page.locator('#hero-name')).toContainText(/[А-Яа-я]/);
    await expect(page.locator('#experience')).toContainText(/[А-Яа-я]/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /[А-Яа-я]/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/ru\/$/);
  });

  test('/az/ serves Azerbaijani, schwa included', async ({ page }) => {
    await page.goto('/az/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'az');
    // U+0259 is the character an incomplete font subset drops first.
    await expect(page.locator('#experience')).toContainText('ə');
  });

  test('every locale declares hreflang alternates', async ({ page }) => {
    for (const path of ['/', '/ru/', '/az/']) {
      await page.goto(path);
      for (const l of ['en', 'ru', 'az', 'x-default']) {
        await expect(page.locator(`link[rel="alternate"][hreflang="${l}"]`)).toHaveCount(1);
      }
    }
  });

  test('the language switcher works without JavaScript', async ({ page }) => {
    await page.goto('/');
    // No JS means no .open class, so the menu is revealed by hover/focus-within
    // on the switcher (html.no-js only). Hover first — the links are genuinely
    // hidden until then, which is also what a sighted no-JS visitor sees.
    await page.locator('.lang-switcher').hover();
    await page.locator('#lang-menu a[data-lang="ru"]').click();
    await expect(page).toHaveURL(/\/ru\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  });

  test('every content section is actually visible without JavaScript', async ({ page }) => {
    // Playwright's toBeVisible() ignores opacity — this shipped as a blank
    // page below the hero while the no-JS tests stayed green. Assert the
    // computed value, never the visibility heuristic.
    await page.goto('/');
    const opacity = (sel: string) =>
      page
        .locator(sel)
        .first()
        .evaluate((el) => getComputedStyle(el).opacity);
    for (const sel of ['#projects', '#experience', '#connect']) {
      expect(await opacity(sel), `${sel} must not need JS to render`).toBe('1');
    }
    expect(await opacity('.scroll-tl-item')).toBe('1');
    expect(await opacity('.scroll-tl-bullets li')).toBe('1');
    expect(await opacity('.hero-links')).toBe('1');
    expect(await opacity('.hero-eyebrow')).toBe('1');
  });
});

// The terminal was desktop-gated for months, so half of all visitors got a
// static box where the centerpiece should be. These lock the touch path open.
test.describe('touch path (phone viewport)', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    contextOptions: { reducedMotion: 'reduce' },
  });

  test.beforeEach(async ({ page }) => {
    track(page);
    await page.goto('/');
    await page.waitForLoadState('load');
    await ready(page);
  });

  test.afterEach(() => {
    expect(pageErrors).toEqual([]);
  });

  test('terminal is interactive and the chip row is gone', async ({ page }) => {
    await expect(page.locator('.term-input')).toBeVisible();
    // The chip row was removed everywhere — the homepage terminal is
    // typing-only on every pointer type.
    await expect(page.locator('#term-chips')).toHaveCount(0);
  });

  test('all four hero link pills share one line', async ({ page }) => {
    const links = page.locator('.hero-links a');
    await expect(links).toHaveCount(4);
    const tops = await links.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
    for (const t of tops) expect(Math.abs(t - tops[0])).toBeLessThan(2);
    // And they fit — no horizontal page scroll.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('typing works on touch, pipes included', async ({ page }) => {
    const input = page.locator('.term-input');
    await input.fill('projects | grep rust');
    await input.press('Enter');
    await expect(page.locator('.terminal-body')).toContainText(/rust/i);
  });

  test('input is not auto-focused on load', async ({ page }) => {
    const focused = await page.evaluate(() =>
      document.activeElement?.classList.contains('term-input'),
    );
    expect(focused).toBe(false);
  });

  test('/lab keeps its own terminal sizing', async ({ page }) => {
    // /lab reuses the .term-input class at a different size. The homepage
    // terminal's coarse-pointer transform must not reach it.
    await page.goto('/lab');
    const m = await page.evaluate(() => {
      const el = document.querySelector('#term-input') as HTMLElement;
      const s = getComputedStyle(el);
      return { transform: s.transform, width: el.getBoundingClientRect().width };
    });
    expect(m.transform).toBe('none');
    expect(m.width).toBeLessThanOrEqual(390);
  });

  test('typed text avoids iOS zoom yet renders at the terminal size', async ({ page }) => {
    const m = await page.evaluate(() => {
      const el = document.querySelector('.term-input') as HTMLElement;
      const term = document.querySelector('.terminal-window') as HTMLElement;
      const t = getComputedStyle(el).transform;
      // matrix(a, b, c, d, tx, ty) — `a` is the horizontal scale.
      const scale = t === 'none' ? 1 : parseFloat(t.slice(7).split(',')[0]);
      return {
        computed: parseFloat(getComputedStyle(el).fontSize),
        scale,
        terminal: parseFloat(getComputedStyle(term).fontSize),
      };
    });
    // iOS zooms the viewport on focus for anything under 16px and never
    // zooms back, so the input must genuinely compute at 16px...
    expect(m.computed).toBeGreaterThanOrEqual(16);
    // ...while what you actually see matches the output around it.
    expect(m.computed * m.scale).toBeCloseTo(m.terminal, 1);
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
    await ready(page);
    const toggle = page.locator('#projects .sim-toggle').first();
    if ((await toggle.count()) === 0) test.skip();
    await toggle.scrollIntoViewIfNeeded();
    await toggle.click();
    await expect(page.locator('.sim-overlay')).toHaveClass(/open/);
  });
});
