import { test, expect, type Page } from 'playwright/test';
import { profile } from '../src/data/profile';

// /lab/motion: scroll-driven CSS only. These tests drive real scroll positions
// and read computed styles, so they prove the timelines are attached and
// ranged correctly, and that the static fallbacks really are static.

const PATH = '/lab/motion/';
const ABOUT = 'Riad ' + profile.about;
const WORD_COUNT = ABOUT.split(' ').length;
const MERGED = profile.openSource.reduce((n, o) => n + o.merged, 0);

// Lenis arrives as an async chunk on fine pointers. Until it exists, a native
// scrollTo is eased by `html { scroll-behavior: smooth }` and lands late.
const open = async (page: Page) => {
  await page.goto(PATH);
  await page.waitForFunction(
    () =>
      !!(window as any).__lenis ||
      matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !matchMedia('(pointer: fine)').matches,
  );
};

const scrollToY = (page: Page, y: number) =>
  page.evaluate((top) => {
    const lenis = (window as any).__lenis;
    if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
    else window.scrollTo({ top, behavior: 'instant' });
  }, y);

// Document-space box of the nth match.
const box = (page: Page, selector: string, index = 0) =>
  page.evaluate(
    ([s, i]) => {
      const r = document.querySelectorAll(s)[i].getBoundingClientRect();
      return { top: r.top + scrollY, height: r.height, width: r.width, bottom: r.bottom + scrollY };
    },
    [selector, index] as const,
  );

const viewport = (page: Page) => page.evaluate(() => ({ w: innerWidth, h: innerHeight }));

const maxScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollHeight - innerHeight);

const opacityOf = (page: Page, selector: string, index = 0) =>
  page.evaluate(([s, i]) => Number(getComputedStyle(document.querySelectorAll(s)[i]).opacity), [
    selector,
    index,
  ] as const);

const styleOf = (page: Page, selector: string, prop: string, pseudo?: string) =>
  page.evaluate(
    ([s, p, ps]) => getComputedStyle(document.querySelector(s)!, ps || null).getPropertyValue(p),
    [selector, prop, pseudo ?? ''] as const,
  );

const viewportTop = (page: Page, selector: string) =>
  page.evaluate(
    (s) => Math.round(document.querySelector(s)!.getBoundingClientRect().top),
    selector,
  );

// Matrix entry of the nth match's transform (m11 = scaleX, m22 = scaleY,
// m41 = translateX). `none` reads as the identity, so 1 / 0 respectively.
const matrixOf = (
  page: Page,
  selector: string,
  entry: 'm11' | 'm22' | 'm41',
  index = 0,
  pseudo = '',
) =>
  page.evaluate(
    ([s, e, i, ps]) => {
      const t = getComputedStyle(document.querySelectorAll(s)[i], ps || null).transform;
      if (t === 'none') return e === 'm41' ? 0 : 1;
      return new DOMMatrix(t)[e];
    },
    [selector, entry, index, pseudo] as const,
  );

const supportsTimelines = (page: Page) =>
  page.evaluate(() => CSS.supports('animation-timeline: view()'));

const noHorizontalOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

const SCENE = (name: string) => `[data-scene="${name}"]`;

test.describe('/lab/motion, desktop', () => {
  test.beforeEach(({ page }) => open(page));

  test('renders the profile content from the single source of truth', async ({ page }) => {
    expect(await supportsTimelines(page)).toBe(true);
    // Full-text match: fails if Astro eats the spaces between word spans.
    await expect(page.locator('.m-about-text')).toHaveText(ABOUT);
    await expect(page.locator('.m-word')).toHaveCount(WORD_COUNT);
    await expect(page.locator('.m-name')).toHaveText(profile.hero.name);
    await expect(page.locator('.scroll-tl-item')).toHaveCount(profile.experience.length);
    await expect(page.locator(`${SCENE('projects')} .proj-card`)).toHaveCount(
      profile.projects.length,
    );
    await expect(page.locator(`${SCENE('open-source')} .proj-card`)).toHaveCount(
      profile.openSource.length,
    );
    await expect(page.locator(`${SCENE('skills')} .proj-card`)).toHaveCount(profile.skills.length);
    await expect(page.locator(`${SCENE('teaching')} .proj-card`)).toHaveCount(
      profile.teaching.length,
    );
    await expect(page.locator('.testi-card')).toHaveCount(profile.testimonials.length);
    await expect(page.locator('.m-dots span')).toHaveCount(profile.testimonials.length);
    expect(await page.locator(`${SCENE('posts')} .proj-card`).count()).toBeGreaterThan(0);
    await expect(page.locator('.m-num-text')).toHaveText(String(MERGED));
    await expect(page.locator('.m-nosupport')).toBeHidden();
    // The homepage-only chrome stays out of the study.
    const chrome = await page.evaluate(() =>
      [...document.querySelectorAll('.carousel-nav, .proj-stats, .sim-toggle')].every(
        (el) => getComputedStyle(el).display === 'none',
      ),
    );
    expect(chrome).toBe(true);
    expect(await noHorizontalOverflow(page)).toBe(true);
  });

  test('hero: the small type leaves before the name, which scales down', async ({ page }) => {
    expect(await opacityOf(page, '.m-name')).toBe(1);
    expect(await opacityOf(page, '.m-hero .m-eyebrow')).toBe(1);

    const hero = await box(page, '.m-hero');
    await scrollToY(page, hero.top + hero.height * 0.5); // exit 50%
    await expect.poll(() => opacityOf(page, '.m-hero .m-eyebrow')).toBe(0);
    const name = await opacityOf(page, '.m-name');
    expect(name).toBeGreaterThan(0.2);
    expect(name).toBeLessThan(0.9);
    expect(await matrixOf(page, '.m-name', 'm11')).toBeLessThan(1);
  });

  test('about: pins, lights the words in order, underlines the key words', async ({ page }) => {
    const about = await box(page, SCENE('about'));
    const { h } = await viewport(page);
    const pinLength = about.height - h;
    const last = WORD_COUNT - 1;
    expect(pinLength).toBeGreaterThan(h * 0.5);

    const keys = page.locator('.m-word.is-key');
    const keyCount = await keys.count();
    expect(keyCount).toBeGreaterThan(0);
    const lastKey = keyCount - 1;
    const underline = () => matrixOf(page, '.m-word.is-key', 'm11', lastKey, '::after');

    await scrollToY(page, about.top);
    await expect.poll(() => opacityOf(page, '.m-word', 0)).toBeCloseTo(0.18, 2);
    expect(await opacityOf(page, '.m-word', last)).toBeCloseTo(0.18, 2);
    expect(await underline()).toBe(0);

    await scrollToY(page, about.top + pinLength * 0.5);
    await expect.poll(() => opacityOf(page, '.m-word', 0)).toBe(1);
    expect(await opacityOf(page, '.m-word', last)).toBeCloseTo(0.18, 2);
    expect(await viewportTop(page, '.m-about-pin')).toBe(0);

    await scrollToY(page, about.top + pinLength);
    await expect.poll(() => opacityOf(page, '.m-word', last)).toBe(1);
    expect(await underline()).toBe(1);

    // Past the pin the paragraph wipes out.
    await scrollToY(page, about.top + about.height - h * 0.3);
    await expect.poll(() => styleOf(page, '.m-about-text', 'clip-path')).not.toBe('inset(0px)');
  });

  test('experience: the rail draws, the focal item is bright and past items dim', async ({
    page,
  }) => {
    // A deep item with bullets, so it starts fully below the first screen.
    const index = profile.experience.findIndex((e, i) => i >= 2 && e.bullets.length > 0);
    expect(index).toBeGreaterThan(1);
    const { h } = await viewport(page);
    const item = await box(page, '.scroll-tl-item', index);
    const bullet = () =>
      page.evaluate((i) => {
        const li = document
          .querySelectorAll('.scroll-tl-item')
          [i].querySelector('.scroll-tl-bullets li:last-child');
        return li ? Number(getComputedStyle(li).opacity) : 1;
      }, index);

    // Still below the screen.
    await scrollToY(page, item.top - h - 40);
    await expect.poll(() => matrixOf(page, '.scroll-tl-item', 'm22', index, '::after')).toBe(0);
    expect(await opacityOf(page, '.scroll-tl-item', index)).toBeLessThan(0.5);
    expect(await bullet()).toBe(0);

    // Centred: bright, rail drawing, bullets in.
    await scrollToY(page, item.top + item.height / 2 - h / 2);
    await expect.poll(() => opacityOf(page, '.scroll-tl-item', index)).toBe(1);
    expect(await matrixOf(page, '.scroll-tl-item', 'm22', index, '::after')).toBeGreaterThan(0.5);
    expect(await bullet()).toBe(1);

    // Mostly past the top: dimmed, but still legible.
    await scrollToY(page, item.top + item.height * 0.9);
    await expect.poll(() => opacityOf(page, '.scroll-tl-item', index)).toBeLessThan(0.8);
    expect(await opacityOf(page, '.scroll-tl-item', index)).toBeGreaterThan(0.4);
    expect(await matrixOf(page, '.scroll-tl-item', 'm22', index, '::after')).toBe(1);
  });

  test('projects: cards stack, and the covered one scales down', async ({ page }) => {
    const sel = `${SCENE('projects')} .proj-card`;
    const count = profile.projects.length;
    // Measured before any scroll, so no card is stuck yet.
    const tops = [];
    for (let i = 0; i < count; i++) tops.push((await box(page, sel, i)).top);
    expect(await styleOf(page, sel, 'position')).toBe('sticky');
    expect(await matrixOf(page, sel, 'm11', 0)).toBe(1);

    // Card 2 docked at its pin line (5.5rem + two 12px steps).
    const dock = 88 + 2 * 12;
    await scrollToY(page, tops[2] - dock);
    await expect.poll(() => matrixOf(page, sel, 'm11', 1)).toBeCloseTo(0.94, 2);
    expect(await matrixOf(page, sel, 'm11', 0)).toBeCloseTo(0.94, 2);
    expect(await matrixOf(page, sel, 'm11', 2)).toBe(1);
    // The covered card holds its own pin line, one step below the one under it.
    const held = await page.evaluate(
      (s) =>
        [0, 1].map((i) => Math.round(document.querySelectorAll(s)[i].getBoundingClientRect().top)),
      sel,
    );
    expect(Math.abs(held[0] - 88)).toBeLessThanOrEqual(2);
    expect(Math.abs(held[1] - 100)).toBeLessThanOrEqual(2);

    // The last card's links are on top and clickable.
    await scrollToY(page, tops[count - 1] - (88 + (count - 1) * 12));
    await expect.poll(() => matrixOf(page, sel, 'm11', count - 2)).toBeCloseTo(0.94, 2);
    const hit = await page.evaluate((s) => {
      const card = [...document.querySelectorAll(s)].at(-1)!;
      const link = card.querySelector('a.feat-gh');
      if (!link) return true;
      const r = link.getBoundingClientRect();
      const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return el?.closest('a.feat-gh') === link;
    }, sel);
    expect(hit).toBe(true);
  });

  test('open source: the merged-PR total counts up', async ({ page }) => {
    const { h } = await viewport(page);
    const stat = await box(page, '.m-stat');
    const num = () => styleOf(page, '.m-num', '--num', '::after');

    await scrollToY(page, stat.top - h - 40);
    await expect.poll(num).toBe('0');

    await scrollToY(page, stat.top - h * 0.2);
    await expect.poll(num).toBe(String(MERGED));
  });

  test('skills: rows drift in opposite directions and no chip leaves the screen', async ({
    page,
  }) => {
    const sel = `${SCENE('skills')} .proj-card`;
    const { h } = await viewport(page);
    const first = await box(page, sel, 0);
    const last = await box(page, sel, profile.skills.length - 1);

    await scrollToY(page, first.top - h * 0.8);
    await expect.poll(() => matrixOf(page, sel, 'm41', 0)).toBeGreaterThan(5);
    expect(await matrixOf(page, sel, 'm41', 1)).toBeLessThan(-5);

    const bounds = async () =>
      page.evaluate(() =>
        [...document.querySelectorAll('[data-scene="skills"] .feat-pills > *')].every((el) => {
          const r = el.getBoundingClientRect();
          return r.left >= 0 && r.right <= innerWidth;
        }),
      );
    for (const y of [first.top - h, first.top - h * 0.4, last.top - h * 0.2, last.bottom]) {
      await scrollToY(page, y);
      await expect.poll(bounds).toBe(true);
    }
    expect(await noHorizontalOverflow(page)).toBe(true);
  });

  test('teaching: cards unclip top-down', async ({ page }) => {
    const sel = `${SCENE('teaching')} .proj-card`;
    const { h } = await viewport(page);
    const card = await box(page, sel, 0);

    await scrollToY(page, card.top - h - 40);
    await expect.poll(() => styleOf(page, sel, 'clip-path')).not.toBe('none');

    await scrollToY(page, card.top - h * 0.3);
    await expect.poll(() => styleOf(page, sel, 'clip-path')).toBe('none');
  });

  test('education: the card reveals, then the award line underlines', async ({ page }) => {
    const sel = `${SCENE('education')} .proj-card`;
    const line = `${sel} .feat-bullets li`;
    const { h } = await viewport(page);
    const card = await box(page, sel);
    expect(await page.locator(line).count()).toBeGreaterThan(0);

    await scrollToY(page, card.top - h - 40);
    await expect.poll(() => opacityOf(page, sel)).toBe(0);
    expect(await matrixOf(page, line, 'm11', 0, '::after')).toBe(0);

    await scrollToY(page, card.top + card.height / 2 - h / 2);
    await expect.poll(() => opacityOf(page, sel)).toBe(1);
    await expect.poll(() => matrixOf(page, line, 'm11', 0, '::after')).toBe(1);
  });

  test('recommendations: pinned, crossfading in place, dots fill with progress', async ({
    page,
  }) => {
    const n = profile.testimonials.length;
    const { h } = await viewport(page);
    const scene = await box(page, SCENE('recommendations'));
    const pinLength = scene.height - h;
    expect(n).toBeGreaterThan(1);
    expect(pinLength).toBeGreaterThan(0);
    const at = (progress: number) => scrollToY(page, scene.top + pinLength * progress);
    const visibility = (i: number) =>
      page.evaluate(
        (idx) => getComputedStyle(document.querySelectorAll('.testi-card')[idx]).visibility,
        i,
      );

    await at(0);
    await expect.poll(() => opacityOf(page, '.testi-card', 0)).toBe(1);
    expect(await opacityOf(page, '.testi-card', 1)).toBe(0);
    expect(await visibility(1)).toBe('hidden');
    expect(await matrixOf(page, '.m-dots span', 'm11', 0, '::after')).toBe(0);

    await at(1.4 / n);
    await expect.poll(() => opacityOf(page, '.testi-card', 1)).toBe(1);
    expect(await opacityOf(page, '.testi-card', 0)).toBe(0);
    expect(await visibility(0)).toBe('hidden');
    expect(await viewportTop(page, '.m-pin')).toBe(0);
    // Dot 0 is full, the last dot has not started.
    expect(await matrixOf(page, '.m-dots span', 'm11', 0, '::after')).toBe(1);
    expect(await matrixOf(page, '.m-dots span', 'm11', n - 1, '::after')).toBe(0);

    await at(1);
    await expect.poll(() => opacityOf(page, '.testi-card', n - 1)).toBe(1);
    expect(await matrixOf(page, '.m-dots span', 'm11', n - 1, '::after')).toBe(1);
  });

  test('posts: cards arrive staggered', async ({ page }) => {
    const sel = `${SCENE('posts')} .proj-card`;
    const { h } = await viewport(page);
    const card = await box(page, sel, 0);

    await scrollToY(page, card.top - h - 40);
    await expect.poll(() => opacityOf(page, sel, 0)).toBe(0);

    await scrollToY(page, card.top - h * 0.3);
    await expect.poll(() => opacityOf(page, sel, 0)).toBe(1);
  });

  test('connect: a footer curtain, tightening heading, magnetic buttons', async ({ page }) => {
    const { h } = await viewport(page);
    expect(await styleOf(page, '.m-connect', 'position')).toBe('sticky');
    const curtain = await box(page, '.m-curtain');
    const spacing = () =>
      page.evaluate(() =>
        parseFloat(getComputedStyle(document.querySelector('.connect-tagline')!).letterSpacing),
      );

    // The curtain's lower edge meets the screen's: the footer is under it.
    await scrollToY(page, curtain.bottom - h);
    await expect.poll(() => spacing()).toBeGreaterThan(0);
    const covered = await page.evaluate((vh) => {
      const el = document.elementFromPoint(innerWidth / 2, vh - 20);
      return !!el?.closest('.m-curtain') && !el.closest('.m-connect');
    }, h);
    expect(covered).toBe(true);

    await scrollToY(page, await maxScroll(page));
    await expect.poll(() => spacing()).toBeLessThan(0);

    // Magnetic: leans toward the pointer (inline transform), resets on leave.
    const btn = page.locator(`${SCENE('connect')} .cta-btn`).first();
    await btn.scrollIntoViewIfNeeded();
    const r = (await btn.boundingBox())!;
    await page.mouse.move(r.x + r.width - 2, r.y + r.height / 2);
    await expect
      .poll(() => btn.evaluate((el) => (el as HTMLElement).style.transform))
      .toContain('translate');
    const tx = await btn.evaluate((el) =>
      parseFloat((el as HTMLElement).style.transform.replace('translate(', '')),
    );
    expect(tx).toBeGreaterThan(2);
    expect(tx).toBeLessThanOrEqual(8);
    await page.mouse.move(5, 5);
    await expect.poll(() => btn.evaluate((el) => (el as HTMLElement).style.transform)).toBe('');
  });
});

test.describe('/lab/motion, reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });
  test.beforeEach(({ page }) => open(page));

  test('everything is static and fully visible', async ({ page }) => {
    // Support is present: it is the preference, not the browser, that turns
    // the motion off.
    expect(await supportsTimelines(page)).toBe(true);
    await expect(page.locator('.m-nosupport')).toBeHidden();

    const minOpacity = (selector: string) =>
      page.evaluate(
        (s) =>
          Math.min(
            ...[...document.querySelectorAll(s)].map((el) => Number(getComputedStyle(el).opacity)),
          ),
        selector,
      );

    expect(await styleOf(page, '.m-about-pin', 'position')).toBe('static');
    expect(await minOpacity('.m-word')).toBe(1);
    expect(await styleOf(page, '.m-about-text', 'clip-path')).toBe('none');

    expect(await minOpacity('.scroll-tl-item')).toBe(1);
    expect(await minOpacity('.scroll-tl-bullets li')).toBe(1);
    for (let i = 0; i < profile.experience.length; i++) {
      expect(await matrixOf(page, '.scroll-tl-item', 'm22', i, '::after')).toBe(1);
    }

    expect(await styleOf(page, `${SCENE('projects')} .proj-card`, 'position')).toBe('relative');
    expect(await styleOf(page, `${SCENE('projects')} .proj-card`, 'transform')).toBe('none');

    // The count is plain text, not a counter.
    await expect(page.locator('.m-num-text')).toBeVisible();
    expect(await styleOf(page, '.m-num-text', 'color')).not.toBe('rgba(0, 0, 0, 0)');
    expect(await styleOf(page, '.m-num', 'content', '::after')).toBe('none');

    expect(await styleOf(page, `${SCENE('skills')} .proj-card`, 'transform')).toBe('none');
    expect(await styleOf(page, `${SCENE('teaching')} .proj-card`, 'clip-path')).toBe('none');
    expect(await minOpacity(`${SCENE('posts')} .proj-card`)).toBe(1);
    expect(await minOpacity(`${SCENE('education')} .proj-card`)).toBe(1);

    // Recommendations stay a native scroll row with every card in reach.
    expect(await styleOf(page, '.m-pin', 'position')).toBe('static');
    expect(await styleOf(page, '.testi-scroll', 'overflow-x')).toBe('auto');
    expect(await minOpacity('.testi-card')).toBe(1);
    await expect(page.locator('.m-dots')).toBeHidden();
    const scrollable = await page.evaluate(() => {
      const v = document.querySelector('.testi-scroll')!;
      return v.scrollWidth > v.clientWidth;
    });
    expect(scrollable).toBe(true);

    expect(await styleOf(page, '.m-connect', 'position')).toBe('relative');

    const hero = await box(page, '.m-hero');
    await scrollToY(page, hero.top + hero.height * 0.5);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
    expect(await opacityOf(page, '.m-name')).toBe(1);
    expect(await opacityOf(page, '.m-hero .m-eyebrow')).toBe(1);
    expect(await noHorizontalOverflow(page)).toBe(true);
  });
});

test.describe('/lab/motion, phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test.beforeEach(({ page }) => open(page));

  test('about still pins and the paragraph fits the pinned viewport', async ({ page }) => {
    expect(await styleOf(page, '.m-about-pin', 'position')).toBe('sticky');
    const text = await box(page, '.m-about-text');
    const { h } = await viewport(page);
    expect(text.height).toBeLessThanOrEqual(h);
  });

  test('projects stack, every card fits under its pin line, nothing overflows', async ({
    page,
  }) => {
    const sel = `${SCENE('projects')} .proj-card`;
    const { h } = await viewport(page);
    expect(await styleOf(page, sel, 'position')).toBe('sticky');
    const heights = await page.evaluate(
      (s) => [...document.querySelectorAll(s)].map((el) => el.getBoundingClientRect().height),
      sel,
    );
    for (const height of heights) expect(height).toBeLessThanOrEqual(h - 88 - 12 * heights.length);
    expect(await noHorizontalOverflow(page)).toBe(true);
  });

  test('recommendations pin holds the card, dots and heading', async ({ page }) => {
    expect(await styleOf(page, '.m-pin', 'position')).toBe('sticky');
    const fits = await page.evaluate(() => {
      const pin = document.querySelector('.m-pin')!;
      return pin.scrollHeight <= pin.clientHeight + 1;
    });
    expect(fits).toBe(true);
  });

  test('the whole page stays inside the viewport width at the bottom', async ({ page }) => {
    expect(await noHorizontalOverflow(page)).toBe(true);
    await scrollToY(page, await maxScroll(page));
    expect(await noHorizontalOverflow(page)).toBe(true);
    await expect(page.locator(`${SCENE('connect')} .cta-btn`).first()).toBeInViewport();
  });
});

test('/lab links to the motion study', async ({ page }) => {
  await page.goto('/lab/');
  await expect(page.locator('.lab-toc a[href="/lab/motion/"]')).toContainText('Scroll motion');
});
