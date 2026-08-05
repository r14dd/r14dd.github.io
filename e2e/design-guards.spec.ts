/* Guards for promises the site makes about itself that plain smoke tests
 * missed: deep links land, light mode meets AA, nothing overflows a phone,
 * printing works untouched, the browser keeps its own find, and the terminal
 * can summon the live Raft cluster.
 */
import { test, expect, type Page } from 'playwright/test';

const ready = (page: Page) =>
  page.waitForFunction(() => document.documentElement.dataset.jsReady === '1');

// Everything crack-the-glass refuses to treat as a hit. Kept verbatim from the
// egg's own `isInteractive`, so a point that passes here is a point it accepts.
const INERT =
  'a, button, input, textarea, select, label, [contenteditable], [role="button"], [role="menuitemradio"], .terminal-body, .terminal-dots, .cmd-palette, .proj-modal, .kbd-overlay, .lang-menu, .mobile-nav-menu, .sim-visual, .theme-toggle, .lang-toggle, .cmd-trigger, .side-nav, .side-links, .hero-links, .connect-links, .find-nav-bar, .ferris';

// The toys load on requestIdleCallback, so wait for a sibling toy's own DOM to
// appear rather than sleeping a guessed number of milliseconds.
const toysLoaded = (page: Page) =>
  page.locator('.ferris').waitFor({ state: 'attached', timeout: 15_000 });

// Read the class the instant the burst ends. A retrying matcher is useless
// here: the repair crew clears `glass-shattered` a few seconds later, so
// `expect(body).not.toHaveClass(...)` passes even when the glass DID break.
const shatteredNow = (page: Page) =>
  page.evaluate(() => document.body.classList.contains('glass-shattered'));

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

// The egg ignores anything interactive. Find points that genuinely aren't,
// instead of hardcoding coordinates that drift with every layout change.
const deadSpots = (page: Page) =>
  page.evaluate((sel) => {
    const out: { x: number; y: number }[] = [];
    for (let y = 120; y < innerHeight - 40; y += 20) {
      for (let x = 200; x < innerWidth - 200; x += 40) {
        const el = document.elementFromPoint(x, y);
        if (el && !el.closest(sel)) out.push({ x, y });
      }
    }
    return out;
  }, INERT);

const deadSpot = async (page: Page) => (await deadSpots(page))[0] ?? null;

test.describe('crack the glass needs five hits, fast', () => {
  const burst = async (page: Page, n: number, gapMs: number) => {
    const spot = await deadSpot(page);
    expect(spot, 'no inert point on the page to click').not.toBeNull();
    for (let i = 0; i < n; i++) {
      // Nudge x each time so the burst is not collapsed into a dblclick.
      await page.mouse.click(spot!.x + i, spot!.y);
      if (gapMs) await page.waitForTimeout(gapMs);
    }
  };

  test('four fast clicks leave the glass intact', async ({ page }) => {
    await page.goto('/');
    await ready(page);
    await toysLoaded(page);
    await burst(page, 4, 60);
    expect(await shatteredNow(page)).toBe(false);
    // `.ferris` proves the toy batch ran, not that crack-glass's own dynamic
    // import resolved — without this the assertion above passes just as well
    // when no listener is attached at all. One more click, still inside the
    // window, so a dead listener fails the test instead of greening it.
    await burst(page, 1, 0);
    expect(await shatteredNow(page)).toBe(true);
  });

  test('the fifth fast click cracks it', async ({ page }) => {
    await page.goto('/');
    await ready(page);
    await toysLoaded(page);
    await burst(page, 5, 60);
    expect(await shatteredNow(page)).toBe(true);
    await expect(page.locator('.glass-pane.cracked')).toBeVisible();
  });

  test('five clicks slower than the window do not count', async ({ page }) => {
    await page.goto('/');
    await ready(page);
    await toysLoaded(page);
    // 4 gaps x 400ms = 1.6s, past CLICK_WINDOW — deliberate clicking, not rage.
    await burst(page, 5, 400);
    expect(await shatteredNow(page)).toBe(false);
  });
});

test.describe('the repair crew is one crew, and it visits every break', () => {
  test('a hit landing mid-walk joins the job instead of dispatching a second crew', async ({
    page,
  }) => {
    await page.goto('/');
    await ready(page);
    await toysLoaded(page);

    const spots = await deadSpots(page);
    expect(spots.length, 'no inert points on the page to click').toBeGreaterThan(20);
    const at = (f: number) => spots[Math.floor((spots.length - 1) * f)];

    // Watch the pane from before the first hit: how many crews ever exist at
    // once, and whether every fracture is healed rather than silently wiped.
    await page.evaluate(() => {
      const p = { maxCrews: 0, crewsMade: 0, cracks: 0, healed: new Set<Element>() };
      (window as unknown as { __crew: typeof p }).__crew = p;
      new MutationObserver((muts) => {
        p.maxCrews = Math.max(p.maxCrews, document.querySelectorAll('.repair-crew').length);
        for (const m of muts) {
          for (const n of m.addedNodes) {
            if (!(n instanceof Element)) continue;
            if (n.classList.contains('repair-crew')) p.crewsMade++;
            // Each impact appends exactly one <g>; its lines are built while
            // it's still detached, so they never reach this observer.
            if (n.tagName === 'g') p.cracks++;
          }
          if (
            m.type === 'attributes' &&
            m.target instanceof Element &&
            m.target.classList.contains('crack-healed')
          )
            p.healed.add(m.target);
        }
      }).observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['class'],
      });
    });

    // Break it, then spread the damage so the crew has a walk long enough to
    // interrupt. Every click here lands on a genuinely inert point.
    const a = at(0.05);
    for (let i = 0; i < 5; i++) await page.mouse.click(a.x + i, a.y);
    expect(await shatteredNow(page)).toBe(true);
    const b = at(0.45);
    const c = at(0.95);
    for (const s of [b, c, { x: b.x, y: c.y }, { x: c.x, y: b.y }])
      await page.mouse.click(s.x, s.y);

    // Wait for the crew to actually be walking, then hit the glass again.
    await page.locator('.repair-crew').first().waitFor({ state: 'attached', timeout: 10_000 });
    await page.waitForTimeout(400);
    await page.mouse.click(at(0.25).x, at(0.65).y);

    // The job finishes: no crew left, no cracks left, glass whole again.
    await expect
      .poll(
        () =>
          page.evaluate(() => ({
            crews: document.querySelectorAll('.repair-crew').length,
            shattered: document.body.classList.contains('glass-shattered'),
          })),
        { timeout: 25_000 },
      )
      .toEqual({ crews: 0, shattered: false });

    const seen = await page.evaluate(() => {
      const p = (
        window as unknown as {
          __crew: { maxCrews: number; crewsMade: number; cracks: number; healed: Set<Element> };
        }
      ).__crew;
      return {
        maxCrews: p.maxCrews,
        crewsMade: p.crewsMade,
        cracks: p.cracks,
        healed: p.healed.size,
      };
    });

    // Two crews on screen means one wiped the glass out from under the other.
    expect(seen.maxCrews, 'more than one repair crew existed at once').toBe(1);
    expect(seen.crewsMade, 'a second crew was dispatched').toBe(1);
    // The whole conceit is that a crack clears only once someone walks to it.
    // The hit made mid-walk counts too — it must not vanish unvisited.
    // 6 impacts: the break itself (the first four clicks only count, they don't
    // crack), the four spread hits, and the one landing mid-walk.
    expect(seen.cracks).toBe(6);
    expect(seen.healed, 'a fracture disappeared without being repaired').toBe(seen.cracks);
  });
});
