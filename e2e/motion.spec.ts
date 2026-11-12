import { test, expect, type Page } from 'playwright/test';
import { profile } from '../src/data/profile';

// /lab/motion: scroll-driven CSS only. These tests drive real scroll positions
// and read computed styles, so they prove the timelines are attached and
// ranged correctly, and that the static fallbacks really are static.

const PATH = '/lab/motion/';
const ABOUT = 'Riad ' + profile.about;
const WORD_COUNT = ABOUT.split(' ').length;

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

// Document-space box of the first match.
const box = (page: Page, selector: string) =>
  page.evaluate((s) => {
    const r = document.querySelector(s)!.getBoundingClientRect();
    return { top: r.top + scrollY, height: r.height, width: r.width };
  }, selector);

const viewport = (page: Page) => page.evaluate(() => ({ w: innerWidth, h: innerHeight }));

const opacityOf = (page: Page, selector: string, index = 0) =>
  page.evaluate(([s, i]) => Number(getComputedStyle(document.querySelectorAll(s)[i]).opacity), [
    selector,
    index,
  ] as const);

const styleOf = (page: Page, selector: string, prop: string) =>
  page.evaluate(([s, p]) => getComputedStyle(document.querySelector(s)!).getPropertyValue(p), [
    selector,
    prop,
  ] as const);

const viewportTop = (page: Page, selector: string) =>
  page.evaluate(
    (s) => Math.round(document.querySelector(s)!.getBoundingClientRect().top),
    selector,
  );

const translateX = (page: Page, selector: string) =>
  page.evaluate((s) => {
    const t = getComputedStyle(document.querySelector(s)!).transform;
    return t === 'none' ? 0 : new DOMMatrix(t).m41;
  }, selector);

// scaleY of the nth rail item's ::before segment; 1 when no transform applies.
const segmentScale = (page: Page, index: number) =>
  page.evaluate((i) => {
    const li = document.querySelectorAll('.m-rail-item')[i];
    const t = getComputedStyle(li, '::before').transform;
    return t === 'none' ? 1 : new DOMMatrix(t).m22;
  }, index);

const supportsTimelines = (page: Page) =>
  page.evaluate(() => CSS.supports('animation-timeline: view()'));

const noHorizontalOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test.describe('/lab/motion, desktop', () => {
  test.beforeEach(({ page }) => open(page));

  test('renders the profile content from the single source of truth', async ({ page }) => {
    expect(await supportsTimelines(page)).toBe(true);
    // Full-text match: fails if Astro eats the spaces between word spans.
    await expect(page.locator('.m-about-text')).toHaveText(ABOUT);
    await expect(page.locator('.m-word')).toHaveCount(WORD_COUNT);
    await expect(page.locator('.m-name')).toHaveText(profile.hero.name);
    await expect(page.locator('.m-rail-item')).toHaveCount(profile.experience.length);
    await expect(page.locator('.m-card')).toHaveCount(profile.projects.length);
    // The moving track holds nothing a keyboard could land on mid-flight.
    await expect(page.locator('.m-gal-track :is(a, button, [tabindex])')).toHaveCount(0);
    await expect(page.locator('.m-nosupport')).toBeHidden();
    expect(await noHorizontalOverflow(page)).toBe(true);
  });

  test('hero: the small type leaves before the name', async ({ page }) => {
    expect(await opacityOf(page, '.m-name')).toBe(1);
    expect(await opacityOf(page, '.m-hero .m-eyebrow')).toBe(1);

    const hero = await box(page, '.m-hero');
    await scrollToY(page, hero.top + hero.height * 0.5); // exit 50%
    await expect.poll(() => opacityOf(page, '.m-hero .m-eyebrow')).toBe(0);
    const name = await opacityOf(page, '.m-name');
    expect(name).toBeGreaterThan(0.2);
    expect(name).toBeLessThan(0.9);
  });

  test('about: pins, and scroll lights the words in order', async ({ page }) => {
    const about = await box(page, '.m-about');
    const { h } = await viewport(page);
    const pinLength = about.height - h;
    const last = WORD_COUNT - 1;
    expect(pinLength).toBeGreaterThan(h);

    await scrollToY(page, about.top);
    await expect.poll(() => opacityOf(page, '.m-word', 0)).toBeCloseTo(0.18, 2);
    expect(await opacityOf(page, '.m-word', last)).toBeCloseTo(0.18, 2);

    await scrollToY(page, about.top + pinLength * 0.5);
    await expect.poll(() => opacityOf(page, '.m-word', 0)).toBe(1);
    expect(await opacityOf(page, '.m-word', last)).toBeCloseTo(0.18, 2);
    expect(await viewportTop(page, '.m-about-pin')).toBe(0);

    await scrollToY(page, about.top + pinLength);
    await expect.poll(() => opacityOf(page, '.m-word', last)).toBe(1);
  });

  test('experience: an item draws its rail segment as it crosses the line', async ({ page }) => {
    const index = 2;
    const { h } = await viewport(page);
    const line = h * 0.65;
    const item = await page.evaluate((i) => {
      const r = document.querySelectorAll('.m-rail-item')[i].getBoundingClientRect();
      return { top: r.top + scrollY, height: r.height };
    }, index);

    await scrollToY(page, item.top - line - 40); // top still 40px below the line
    await expect.poll(() => segmentScale(page, index)).toBe(0);
    expect(await opacityOf(page, '.m-rail-body', index)).toBeCloseTo(0.25, 2);

    await scrollToY(page, item.top + item.height - line + 40); // bottom 40px past it
    await expect.poll(() => segmentScale(page, index)).toBe(1);
    expect(await opacityOf(page, '.m-rail-body', index)).toBe(1);
  });

  test('gallery: pins and travels exactly its own overflow', async ({ page }) => {
    const gal = await box(page, '.m-gal');
    const track = await box(page, '.m-gal-track');
    const { w, h } = await viewport(page);
    const travel = track.width - w;
    expect(travel).toBeGreaterThan(0);
    // One pixel across per pixel down: the pin lasts exactly the travel.
    expect(Math.abs(gal.height - h - travel)).toBeLessThanOrEqual(1);
    expect(await styleOf(page, '.m-gal-view', 'overflow-x')).toBe('visible');

    await scrollToY(page, gal.top);
    await expect.poll(async () => Math.abs(await translateX(page, '.m-gal-track'))).toBeLessThan(2);

    await scrollToY(page, gal.top + travel / 2);
    await expect
      .poll(async () => Math.abs((await translateX(page, '.m-gal-track')) + travel / 2))
      .toBeLessThan(2);
    expect(await viewportTop(page, '.m-gal-pin')).toBe(0);

    await scrollToY(page, gal.top + travel);
    await expect
      .poll(async () => Math.abs((await translateX(page, '.m-gal-track')) + travel))
      .toBeLessThan(2);
    const lastRight = await page.evaluate(
      () => document.querySelector('.m-card:last-child')!.getBoundingClientRect().right,
    );
    expect(lastRight).toBeLessThanOrEqual(w);
    expect(await noHorizontalOverflow(page)).toBe(true);
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

    expect(await styleOf(page, '.m-about-pin', 'position')).toBe('static');
    const dimmest = await page.evaluate(() =>
      Math.min(
        ...[...document.querySelectorAll('.m-word')].map((el) =>
          Number(getComputedStyle(el).opacity),
        ),
      ),
    );
    expect(dimmest).toBe(1);

    const count = await page.locator('.m-rail-item').count();
    for (let i = 0; i < count; i++) {
      expect(await segmentScale(page, i)).toBe(1);
      expect(await opacityOf(page, '.m-rail-body', i)).toBe(1);
    }

    expect(await styleOf(page, '.m-gal-pin', 'position')).toBe('static');
    expect(await styleOf(page, '.m-gal-track', 'transform')).toBe('none');
    expect(await styleOf(page, '.m-gal-view', 'overflow-x')).toBe('auto');
    const scrollable = await page.evaluate(() => {
      const v = document.querySelector('.m-gal-view')!;
      return v.scrollWidth > v.clientWidth;
    });
    expect(scrollable).toBe(true);

    const hero = await box(page, '.m-hero');
    await scrollToY(page, hero.top + hero.height * 0.5);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
    expect(await opacityOf(page, '.m-name')).toBe(1);
    expect(await opacityOf(page, '.m-hero .m-eyebrow')).toBe(1);
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

  test('gallery falls back to a native snap row', async ({ page }) => {
    expect(await styleOf(page, '.m-gal-pin', 'position')).toBe('static');
    expect(await styleOf(page, '.m-gal-track', 'transform')).toBe('none');
    expect(await styleOf(page, '.m-gal-view', 'overflow-x')).toBe('auto');
    const scrollable = await page.evaluate(() => {
      const v = document.querySelector('.m-gal-view')!;
      return v.scrollWidth > v.clientWidth;
    });
    expect(scrollable).toBe(true);
    expect(await noHorizontalOverflow(page)).toBe(true);
  });
});

test('/lab links to the motion study', async ({ page }) => {
  await page.goto('/lab/');
  await expect(page.locator('.lab-toc a[href="/lab/motion/"]')).toContainText('Scroll motion');
});
