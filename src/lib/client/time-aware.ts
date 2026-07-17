const periods = [
  {
    key: 'night',
    from: 0,
    to: 6,
    accent: '140, 160, 210',
    accentHex: '#8ca0d2',
    lightAccent: '90, 110, 160',
    lightHex: '#5a6ea0',
    mapFilter: 'grayscale(1) brightness(4) sepia(1) saturate(3) hue-rotate(185deg)',
    mapFilterLight: 'brightness(0.92) contrast(1.1) saturate(0.8) sepia(0.15) hue-rotate(185deg)',
  },
  {
    key: 'morning',
    from: 6,
    to: 12,
    accent: '210, 170, 90',
    accentHex: '#d2aa5a',
    lightAccent: '138, 112, 48',
    lightHex: '#8a7030',
    mapFilter: 'none',
    mapFilterLight: 'none',
  },
  {
    key: 'afternoon',
    from: 12,
    to: 17,
    accent: '201, 165, 90',
    accentHex: '#c9a55a',
    lightAccent: '135, 108, 48',
    lightHex: '#876c30',
    mapFilter: 'none',
    mapFilterLight: 'none',
  },
  {
    key: 'evening',
    from: 17,
    to: 21,
    accent: '210, 140, 80',
    accentHex: '#d28c50',
    lightAccent: '146, 92, 46',
    lightHex: '#925c2e',
    mapFilter: 'hue-rotate(345deg)',
    mapFilterLight: 'brightness(0.95) sepia(0.2) hue-rotate(345deg)',
  },
  {
    key: 'night',
    from: 21,
    to: 24,
    accent: '140, 160, 210',
    accentHex: '#8ca0d2',
    lightAccent: '90, 110, 160',
    lightHex: '#5a6ea0',
    mapFilter: 'grayscale(1) brightness(4) sepia(1) saturate(3) hue-rotate(185deg)',
    mapFilterLight: 'brightness(0.92) contrast(1.1) saturate(0.8) sepia(0.15) hue-rotate(185deg)',
  },
];

export function getPeriod() {
  const h = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Baku' })).getHours();
  return periods.find((p) => h >= p.from && h < p.to) || periods[2];
}

export function apply(data: any) {
  const p = getPeriod();
  const greetings = data?.labels?.timeGreetings;
  const eyebrow = document.getElementById('hero-eyebrow');
  if (eyebrow && greetings?.[p.key]) {
    eyebrow.textContent = greetings[p.key];
  }
  const r = document.documentElement;
  r.style.setProperty('--accent', p.accentHex);
  r.style.setProperty('--accent-rgb', p.accent);
  r.style.setProperty('--accent-light', p.lightHex);
  r.style.setProperty('--accent-light-rgb', p.lightAccent);
  r.style.setProperty('--map-filter', p.mapFilter);
  r.style.setProperty('--map-filter-light', p.mapFilterLight);
}
