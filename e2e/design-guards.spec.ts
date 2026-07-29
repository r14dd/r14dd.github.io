/* Guards for promises the site makes about itself that plain smoke tests
 * missed: deep links land, light mode meets AA, nothing overflows a phone,
 * printing works untouched, the browser keeps its own find, and the terminal
 * can summon the live Raft cluster.
 */
import { test, expect, type Page } from 'playwright/test';

const ready = (page: Page) =>
  page.waitForFunction(() => document.documentElement.dataset.jsReady === '1');

test('a shared /#projects link lands on the projects section', async ({ page }) => {
  await page.goto('/#projects');
  // The load-time scroll reset used to stomp this to scrollY = 0.
  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const r = document.getElementById('projects')!.getBoundingClientRect();
          return r.top > -window.innerHeight && r.top < 200;
        }),
      { timeout: 10_000 },
    )
    .toBe(true);
});

test.describe('light theme contrast', () => {
  test.use({ colorScheme: 'light' });

  test('accent-tinted text meets AA on white, and no inline var clobbers it', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('portfolio-theme', 'light'));
    await page.goto('/');
    await page.waitForLoadState('load');

    // The regression that shipped: time-aware wrote --accent inline on <html>,
    // beating the html.light redirection. Inline accent vars are banned.
    const inline = await page.evaluate(
      () =>
        document.documentElement.style.getPropertyValue('--accent') +
        document.documentElement.style.getPropertyValue('--accent-rgb'),
    );
    expect(inline).toBe('');

    const ratioOnWhite = (sel: string) =>
      page
        .locator(sel)
        .first()
        .evaluate((el) => {
          const parse = getComputedStyle(el)
            .color.match(/[\d.]+/g)!
            .map(Number);
          const a = parse[3] ?? 1;
          const rgb = [0, 1, 2].map((i) => parse[i] * a + 255 * (1 - a));
          const f = (v: number) => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
          };
          const lum = 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
          return 1.05 / (lum + 0.05);
        });

    for (const sel of ['.hero-eyebrow', '.sec-eyebrow', '.terminal-prompt', '.scroll-tl-org']) {
      expect(await ratioOnWhite(sel), `${sel} contrast on white`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

test.describe('phone viewport integrity', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the Spotify card never overflows the viewport', async ({ page }) => {
    // Deterministic long-track payload — the shipped bug clipped 52px of the
    // card (fit-content + a 480px cap wider than the screen).
    await page.route('**/spotify-now-playing.riad-mrv.workers.dev/**', (r) =>
      r.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          track: 'Crooked Smile (feat. TLC) — extended mix',
          artist: 'J. Cole, TLC',
          playing: true,
          progress: 61_000,
          duration: 236_000,
          url: 'https://open.spotify.com/track/x',
          cover: '',
        }),
      }),
    );
    await page.goto('/');
    await expect(page.locator('#spotify-line .spotify-inline')).toBeVisible({ timeout: 10_000 });
    const m = await page.evaluate(() => ({
      right: document.getElementById('spotify-line')!.getBoundingClientRect().right,
      viewport: document.documentElement.clientWidth,
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    expect(m.right).toBeLessThanOrEqual(m.viewport);
    expect(m.pageOverflow).toBeLessThanOrEqual(0);
  });
});

test('printing works no matter how far the visitor scrolled', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('load');
  // Deliberately do NOT scroll: print must not depend on reveal state.
  await page.emulateMedia({ media: 'print' });
  const style = (sel: string, prop: string) =>
    page
      .locator(sel)
      .first()
      .evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);
  expect(await style('#projects', 'opacity')).toBe('1');
  expect(await style('#connect', 'opacity')).toBe('1');
  expect(await style('.terminal-window', 'display')).toBe('none');
  expect(await style('.side-links', 'display')).toBe('none');
  // The gradient-clipped hero name prints with a real fill, not transparent.
  const fill = await page
    .locator('.hero-word')
    .first()
    .evaluate((el) => getComputedStyle(el).webkitTextFillColor);
  expect(fill).not.toBe('rgba(0, 0, 0, 0)');
  // Dark-theme surfaces must not print as gray slabs.
  const cardBg = await page
    .locator('.testi-card')
    .first()
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(['rgba(0, 0, 0, 0)', 'rgb(255, 255, 255)']).toContain(cardBg);
});

test('a heading caught mid-type never prints truncated', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('load');
  await page.waitForFunction(() => document.documentElement.dataset.jsReady === '1');
  // Reveal a section so its h2 typewriter starts, then immediately "print".
  await page.locator('#experience').scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    document.getElementById('experience')?.classList.contains('section-revealed'),
  );
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  const heading = await page.locator('#experience h2').textContent();
  const label = await page.locator('#experience').getAttribute('data-label');
  expect(heading?.trim()).toBe(label);
});

test('⌘F belongs to the browser again', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  await page.keyboard.press('ControlOrMeta+f');
  await expect(page.locator('#cmd-palette')).not.toHaveClass(/open/);
  // ⌘K still opens the palette — including a press racing the deferred chunk.
  await page.keyboard.press('ControlOrMeta+k');
  await expect(page.locator('#cmd-palette')).toHaveClass(/open/);
});

test('a ⌘K pressed before the deferred chunk loads still opens the palette', async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' });
  // Press as early as the input pipeline allows — usually before idle-load.
  await page.locator('#cmd-trigger').waitFor({ state: 'attached' });
  await page.keyboard.press('ControlOrMeta+k');
  await expect(page.locator('#cmd-palette')).toHaveClass(/open/, { timeout: 10_000 });
});

test.describe('raft from the terminal', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('`raft` opens the project modal with the live cluster', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');
    const input = page.locator('.term-input');
    await input.fill('raft');
    await input.press('Enter');
    await expect(page.locator('.terminal-body')).toContainText('starting cluster');
    await expect(page.locator('#proj-modal')).toHaveClass(/open/, { timeout: 10_000 });
    await expect(page.locator('#proj-modal-card .raft-node')).toHaveCount(5, { timeout: 10_000 });
  });
});

/* The deferred chunk owns ⌘K *and* everything initShortcuts registers. A key
 * pressed before it lands used to be swallowed — only ⌘K was buffered, so `?`
 * and g-nav, both advertised in the shortcut overlay, silently did nothing for
 * the first few hundred milliseconds. All of them are buffered and replayed
 * now, and a keystroke pulls the chunk in the way a pointer event always did.
 */
test.describe('shortcuts pressed before the deferred chunk lands', () => {
  const early = async (page: Page, press: () => Promise<void>) => {
    await page.goto('/', { waitUntil: 'commit' });
    await page.locator('#cmd-trigger').waitFor({ state: 'attached' });
    await press();
  };

  test('`?` still opens the shortcut overlay', async ({ page }) => {
    await early(page, () => page.keyboard.press('?'));
    await expect(page.locator('#kbd-overlay')).toHaveClass(/open/, { timeout: 10_000 });
  });

  test('g-then-p still jumps to projects', async ({ page }) => {
    await early(page, async () => {
      await page.keyboard.press('g');
      await page.keyboard.press('p');
    });
    await expect
      .poll(async () => page.evaluate(() => location.hash), { timeout: 10_000 })
      .toBe('#projects');
  });

  test('a stray keystroke pulls the chunk in on its own', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' });
    await page.locator('#cmd-trigger').waitFor({ state: 'attached' });
    await page.keyboard.press('q');
    await expect
      .poll(async () => page.evaluate(() => document.documentElement.dataset.jsReady), {
        timeout: 10_000,
      })
      .toBe('1');
  });
});

/* The terminal dots ship on touch now. They stay 9px for the eye and get an
 * invisible target a thumb can actually land on — without reaching into the
 * first line of terminal output, which would trade one bug for a worse one.
 */
test.describe('terminal dots are thumb-sized on touch', () => {
  test.use({ viewport: { width: 390, height: 780 }, hasTouch: true, isMobile: true });

  test('each dot has a ≥40px tall target that clears the terminal body', async ({ page }) => {
    await page.goto('/');
    await page.locator('.dot-interactive').first().waitFor({ timeout: 10_000 });
    const boxes = await page.evaluate(() => {
      const dots = Array.from(document.querySelectorAll('.terminal-dots .dot-interactive'));
      const firstLine = document.querySelector('.terminal-body')!.getBoundingClientRect();
      return dots.map((d) => {
        const r = d.getBoundingClientRect();
        const before = getComputedStyle(d, '::before');
        const h = r.height + parseFloat(before.top) * -1 + parseFloat(before.bottom) * -1;
        const w = parseFloat(before.width);
        return { w, h, dotBottom: r.bottom, bodyTop: firstLine.top };
      });
    });
    expect(boxes).toHaveLength(3);
    for (const b of boxes) {
      expect(b.h).toBeGreaterThanOrEqual(40);
      expect(b.w).toBeGreaterThanOrEqual(20);
      // The target's lower edge must stop above the terminal body.
      expect(b.dotBottom + 15).toBeLessThanOrEqual(b.bodyTop);
    }
  });

  test('tapping a dot still collapses the terminal', async ({ page }) => {
    await page.goto('/');
    await page.locator('.dot-red.dot-interactive').waitFor({ timeout: 10_000 });
    await page.locator('.dot-red').tap();
    await expect(page.locator('.terminal-window')).toHaveClass(/term-collapsed/);
  });
});
