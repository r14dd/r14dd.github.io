const SEL = 'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

let container: HTMLElement | null = null;
let opener: Element | null = null;
let handler: ((e: KeyboardEvent) => void) | null = null;

const visible = (el: HTMLElement) =>
  el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;

export function activate(el: HTMLElement) {
  deactivate();
  container = el;
  opener = document.activeElement;
  handler = (e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !container) return;
    const f = Array.from(container.querySelectorAll<HTMLElement>(SEL)).filter(visible);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  container.addEventListener('keydown', handler);
}

export function deactivate() {
  if (container && handler) container.removeEventListener('keydown', handler);
  const back = opener;
  container = null; opener = null; handler = null;
  if (back && back instanceof HTMLElement && document.contains(back)) {
    try { back.focus({ preventScroll: true }); } catch {}
  }
}
