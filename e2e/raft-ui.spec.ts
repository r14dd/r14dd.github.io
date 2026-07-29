/* Browser-level verification of /lab §09: the Raft cluster as a visitor
 * actually drives it — scroll it into view, watch an election, crash the
 * leader, partition it away, heal, and check the logs converge. The engine's
 * correctness is proven headless in raft-safety.spec.ts; this file proves the
 * page wiring: visibility gating, click targets, and the rendered state.
 */
import { test, expect, type Page } from 'playwright/test';

const leaderIndex = async (page: Page): Promise<number> =>
  page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('#raft-panel .raft-stage .raft-node'));
    return nodes.findIndex((n) => n.getAttribute('data-auth') === '1');
  });

async function openRaft(page: Page) {
  await page.goto('/lab');
  await page.locator('#raft-panel .raft-stage').scrollIntoViewIfNeeded();
  // 4× makes elections land in ~0.5s real time instead of ~2.5s.
  await page.locator('#raft-panel .raft-speed').click();
  await expect(page.locator('#raft-panel .raft-speed')).toHaveText('4× speed');
}

test.describe('raft on /lab', () => {
  test('engine only runs once the section is visible', async ({ page }) => {
    await page.goto('/lab');
    // Section is far below the fold; before scrolling, no election can have
    // happened no matter how long we wait.
    await page.waitForTimeout(1500);
    expect(await leaderIndex(page)).toBe(-1);
    await expect(page.locator('#raft-panel .raft-event')).toHaveText('starting cluster…');

    await page.locator('#raft-panel .raft-stage').scrollIntoViewIfNeeded();
    await expect(page.locator('#raft-panel .raft-stage .raft-node[data-auth="1"]')).toHaveCount(1, {
      timeout: 15000,
    });
  });

  test('a command submitted to the leader commits on every node', async ({ page }) => {
    await openRaft(page);
    await expect(page.locator('#raft-panel .raft-stage .raft-node[data-auth="1"]')).toHaveCount(1, {
      timeout: 15000,
    });
    await page.locator('#raft-panel .raft-submit').click();
    await page.locator('#raft-panel .raft-submit').click();
    // Every one of the five log rows ends up with ≥2 committed (filled) cells.
    for (let row = 0; row < 5; row++)
      await expect(
        page.locator(`.raft-log-row`).nth(row).locator('.raft-cell.is-committed'),
      ).toHaveCount(2, { timeout: 15000 });
  });

  test('crashing the leader forces a new election', async ({ page }) => {
    await openRaft(page);
    await expect(page.locator('#raft-panel .raft-stage .raft-node[data-auth="1"]')).toHaveCount(1, {
      timeout: 15000,
    });
    const old = await leaderIndex(page);
    await page.locator('#raft-panel .raft-stage .raft-node').nth(old).click();
    await expect(page.locator('#raft-panel .raft-stage .raft-node').nth(old)).toHaveClass(
      /is-dead/,
    );
    // A different node wins the next term.
    await expect.poll(async () => leaderIndex(page), { timeout: 20000 }).toBeGreaterThanOrEqual(0);
    expect(await leaderIndex(page)).not.toBe(old);
    // Clicking the corpse revives it.
    await page.locator('#raft-panel .raft-stage .raft-node').nth(old).click();
    await expect(page.locator('#raft-panel .raft-stage .raft-node').nth(old)).not.toHaveClass(
      /is-dead/,
    );
  });

  test('partitioning the leader elects past it; healing converges the logs', async ({ page }) => {
    await openRaft(page);
    await expect(page.locator('#raft-panel .raft-stage .raft-node[data-auth="1"]')).toHaveCount(1, {
      timeout: 15000,
    });
    const old = await leaderIndex(page);
    await page.locator('#raft-panel .raft-partition').click();
    await expect(page.locator('#raft-panel .raft-partition')).toHaveText('heal partition');
    // The majority side elects a new leader while the old one is cut off.
    await expect
      .poll(
        async () => {
          const ld = await leaderIndex(page);
          return ld !== -1 && ld !== old;
        },
        { timeout: 25000 },
      )
      .toBe(true);

    await page.locator('#raft-panel .raft-partition').click();
    await expect(page.locator('#raft-panel .raft-partition')).toHaveText('partition leader');
    await page.locator('#raft-panel .raft-submit').click();
    // After healing, exactly one leader remains and every node's log has the
    // same committed length — the stale minority got repaired.
    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const leaders = document.querySelectorAll(
              '#raft-panel .raft-stage .raft-node[data-auth="1"]',
            ).length;
            const counts = Array.from(document.querySelectorAll('.raft-log-cells')).map(
              (c) => c.querySelectorAll('.raft-cell.is-committed').length,
            );
            return (
              leaders === 1 && counts.length === 5 && counts.every((n) => n === counts[0] && n >= 1)
            );
          }),
        { timeout: 25000 },
      )
      .toBe(true);
  });

  test('homepage Raft project modal hosts the live cluster', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => document.documentElement.dataset.jsReady === '1');
    const card = page.locator('.proj-card', { hasText: 'Raft' }).first();
    await card.scrollIntoViewIfNeeded();
    await card.click();
    // The canned SVG sim is gone; the real engine mounted in its place and
    // elects a leader while the modal is open.
    await expect(page.locator('#proj-modal-card .sim-visual[data-sim="raft"]')).toHaveCount(0);
    await expect(page.locator('#proj-modal-card .raft-node')).toHaveCount(5);
    await expect(page.locator('#proj-modal-card .raft-node[data-auth="1"]')).toHaveCount(1, {
      timeout: 20000,
    });
    // Close and reopen — teardown must not leave a dead panel or a second loop.
    await page.locator('#proj-close').click();
    await expect(page.locator('#proj-modal')).not.toHaveClass(/open/);
    await card.click();
    await expect(page.locator('#proj-modal-card .raft-node[data-auth="1"]')).toHaveCount(1, {
      timeout: 20000,
    });
  });
});

/* Documented reduced-motion behaviour: the cluster mounts paused, nothing
 * moves until the visitor presses play, and no message dots ever travel.
 */
test.describe('raft under reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('mounts paused, runs only when asked, and never flies message dots', async ({ page }) => {
    await page.goto('/lab');
    await page.locator('#raft-panel .raft-stage').scrollIntoViewIfNeeded();
    const play = page.locator('#raft-panel .raft-play');
    await expect(play).toHaveText('▶ play');
    // Paused means paused: no election can resolve while it sits there.
    await page.waitForTimeout(2000);
    expect(await leaderIndex(page)).toBe(-1);

    await play.click();
    await expect(play).toHaveText('⏸ pause');
    await expect.poll(async () => leaderIndex(page), { timeout: 20000 }).toBeGreaterThanOrEqual(0);
    // Elections happened, but the traveling-dot layer stayed empty throughout.
    expect(await page.locator('#raft-panel .raft-msg').count()).toBe(0);
  });
});
