// @ts-nocheck — verbatim move of the (never type-checked) inline script.
// Global keyboard shortcuts: g-then-key section nav, ? for the shortcut
// overlay, backslash for theme, and Escape routing for whichever layer is
// open (modal, overlay, find bar).
import { scrollBehavior } from './motion';
import { state } from './state';
import { closeProject } from './project-modal';
import { openKbd, closeKbd, hideFindNav } from './cmd-palette';

export const initShortcuts = () => {
  const SECTION_KEYS = {
    e: 'experience',
    p: 'projects',
    s: 'skills',
    t: 'teaching',
    d: 'education',
    c: 'connect',
    m: 'recommendations',
  };
  const isTypingTarget = (el) =>
    !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
  let gPending = false;
  let gTimer;

  document.addEventListener('keydown', (e) => {
    if (state.cmdOpen || isTypingTarget(document.activeElement)) return;
    if (state.projOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeProject();
      }
      return;
    }
    if (state.kbdOpen) {
      if (e.key === 'Escape' || e.key === '?') {
        e.preventDefault();
        closeKbd();
      }
      return;
    }
    if (state.findNavOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        hideFindNav();
      }
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '?') {
      e.preventDefault();
      openKbd();
      return;
    }
    if (e.key === '\\') {
      e.preventDefault();
      document.getElementById('theme-toggle')?.click();
      return;
    }
    if (gPending) {
      gPending = false;
      clearTimeout(gTimer);
      const id = SECTION_KEYS[e.key.toLowerCase()];
      if (id) {
        e.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
        history.pushState(null, '', `#${id}`);
      }
      return;
    }
    if (e.key.toLowerCase() === 'g') {
      gPending = true;
      clearTimeout(gTimer);
      gTimer = setTimeout(() => {
        gPending = false;
      }, 1200);
    }
  });
};
