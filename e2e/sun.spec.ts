/* The accent follows the sun over Baku. Reference times are civil dawn,
 * solar noon and civil dusk for 40.41N 49.87E from api.sunrise-sunset.org;
 * the period must flip within two minutes either side of each.
 */
import { test, expect } from 'playwright/test';
import { bakuPeriod } from '../src/lib/sun';

const REFERENCE = [
  ['2026-03-20T02:16:47Z', '2026-03-20T08:48:00Z', '2026-03-20T15:19:14Z'],
  ['2026-06-21T00:37:20Z', '2026-06-21T08:42:19Z', '2026-06-21T16:47:17Z'],
  ['2026-09-22T02:00:51Z', '2026-09-22T08:33:16Z', '2026-09-22T15:05:42Z'],
  ['2026-12-21T03:29:12Z', '2026-12-21T08:38:31Z', '2026-12-21T13:47:49Z'],
];

const at = (iso: string, minutes: number) => bakuPeriod(new Date(Date.parse(iso) + minutes * 6e4));

test('periods flip at civil dawn, solar noon and civil dusk', () => {
  for (const [dawn, noon, dusk] of REFERENCE) {
    expect([at(dawn, -2), at(dawn, 2)]).toEqual(['night', 'morning']);
    expect([at(noon, -2), at(noon, 2)]).toEqual(['morning', 'afternoon']);
    expect([at(dusk, -2), at(dusk, 2)]).toEqual(['evening', 'night']);
  }
});

test('the same clock time is afternoon in June and evening in December', async ({ page }) => {
  for (const [day, period] of [
    ['2026-06-21', 'afternoon'],
    ['2026-12-21', 'evening'],
  ]) {
    await page.clock.setFixedTime(new Date(`${day}T16:45:00+04:00`));
    await page.goto('/colophon/');
    await expect(page.locator('html')).toHaveAttribute('data-period', period);
  }
});
