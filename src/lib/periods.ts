// The five slices of Baku's day that pick the site's accent. Shared by the
// inline head script (so every page stamps data-period before first paint)
// and time-aware.ts (which also swaps the hero greeting).
export const PERIODS = [
  { key: 'night', from: 0, to: 6 },
  { key: 'morning', from: 6, to: 12 },
  { key: 'afternoon', from: 12, to: 17 },
  { key: 'evening', from: 17, to: 21 },
  { key: 'night', from: 21, to: 24 },
];
