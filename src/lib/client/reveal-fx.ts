// @ts-nocheck — verbatim move of the (never type-checked) inline script.
// Section-heading typewriter effect, shared by the language switcher and the
// section-reveal observers (the `typed` set stops double-typing an h2).
import { prefersReducedMotion } from './motion';

export const typed = new WeakSet();

// In-flight typers, so printing can complete them instantly — a heading caught
// mid-type would otherwise print truncated ("Ex" for "Experience").
const active = new Set();

let printing = false;

export const typeH2 = (h2) => {
  // While the print dialog is open the page keeps running — a section revealed
  // by the print relayout must keep its full heading, not start typing.
  if (prefersReducedMotion || printing) return;
  const textNode = Array.from(h2.childNodes).find((n) => n.nodeType === 3 && n.textContent.trim());
  if (!textNode) return;
  const text = textNode.textContent;
  const len = text.length;
  const perChar = 400 / len;
  let i = 0;
  let timer;
  textNode.textContent = '';
  const finish = () => {
    clearTimeout(timer);
    textNode.textContent = text;
    active.delete(finish);
  };
  active.add(finish);
  const step = () => {
    textNode.textContent = text.slice(0, ++i);
    if (i < len) timer = setTimeout(step, perChar);
    else active.delete(finish);
  };
  step();
};

export const finishTyping = () => {
  for (const f of [...active]) f();
};

window.addEventListener('beforeprint', () => {
  printing = true;
  finishTyping();
});
window.addEventListener('afterprint', () => {
  printing = false;
});
