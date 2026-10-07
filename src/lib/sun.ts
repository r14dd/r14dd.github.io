// The sun over Baku picks the accent period: night once it is 6° below the
// horizon (civil dusk), morning until solar noon, evening once it sinks under
// 10° (golden hour), afternoon in between. Low-precision solar position, good
// to a minute or two. Self-contained on purpose: BaseLayout inlines this
// function's source into the head so every page stamps data-period before
// first paint, and time-aware.ts reads that stamp back.
export function bakuPeriod(now: Date): 'night' | 'morning' | 'afternoon' | 'evening' {
  const rad = Math.PI / 180;
  const lat = 40.41 * rad;
  const d = now.getTime() / 864e5 - 10957.5; // days since J2000
  const g = (357.529 + 0.98560028 * d) * rad;
  const l = (280.459 + 0.98564736 * d + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * rad;
  const e = (23.439 - 3.6e-7 * d) * rad;
  const ra = Math.atan2(Math.cos(e) * Math.sin(l), Math.cos(l)) / rad;
  const dec = Math.asin(Math.sin(e) * Math.sin(l));
  // Hour angle in (-180, 180]: negative before solar noon.
  const ha = ((((280.46061837 + 360.98564736629 * d + 49.87 - ra) % 360) + 540) % 360) - 180;
  const alt =
    Math.asin(Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(ha * rad)) /
    rad;
  if (alt < -6) return 'night';
  if (ha < 0) return 'morning';
  return alt >= 10 ? 'afternoon' : 'evening';
}
