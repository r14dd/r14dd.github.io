// Time-aware accent, keyed to Baku's clock. JS only decides the period and
// stamps data-period on <html>; every color and map filter lives in base.css
// under :root[data-period] / html.light[data-period]. Writing the values here
// as inline styles was a shipped bug: inline custom properties out-specify the
// html.light redirection, so light mode ran on dark-tuned accents and failed
// AA wholesale.
const periods = [
  { key: 'night', from: 0, to: 6 },
  { key: 'morning', from: 6, to: 12 },
  { key: 'afternoon', from: 12, to: 17 },
  { key: 'evening', from: 17, to: 21 },
  { key: 'night', from: 21, to: 24 },
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
  document.documentElement.dataset.period = p.key;
}
