// @ts-nocheck — verbatim move of the (never type-checked) inline script.
// Section-heading typewriter effect, shared by the language switcher and the
// section-reveal observers (the `typed` set stops double-typing an h2).
import { prefersReducedMotion } from './motion';

export const typed = new WeakSet();

export const typeH2 = (h2) => {
  if (prefersReducedMotion) return;
  const textNode = Array.from(h2.childNodes).find((n) => n.nodeType === 3 && n.textContent.trim());
  if (!textNode) return;
  const text = textNode.textContent;
  const len = text.length;
  const perChar = 400 / len;
  let i = 0;
  textNode.textContent = '';
  const step = () => {
    textNode.textContent = text.slice(0, ++i);
    if (i < len) setTimeout(step, perChar);
  };
  step();
};
