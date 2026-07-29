// The homepage's non-critical interaction layer, split out of the eager
// orchestrator so the first paint parses only what the first viewport needs
// (hero, terminal, nav, i18n, theme). Everything here loads right after the
// load event — or immediately on the first interaction, whichever comes first.
//
// Init order matters and mirrors the original orchestrator exactly: palette →
// shortcuts register on document keydown in that order, and gestures attaches
// its document-level touch handlers last.
import { initSimOverlay } from './sim-overlay';
import { initCmdPalette } from './cmd-palette';
import { initShortcuts } from './shortcuts';
import { initProjectModal } from './project-modal';
import { initGestures } from './gestures';
import { initAmbient } from './ambient';

let done = false;

export const initDeferred = () => {
  if (done) return;
  done = true;
  initSimOverlay();
  initCmdPalette();
  initShortcuts();
  initProjectModal();
  initGestures();
  initAmbient();
  document.documentElement.dataset.jsReady = '1';
};
