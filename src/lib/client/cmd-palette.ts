// @ts-nocheck — verbatim move of the (never type-checked) inline script.
// Command palette (Cmd/Ctrl-K), keyboard-shortcuts overlay, and the unified
// page-find: palette queries mark matches live; committing them opens the
// find-nav bar. Open-state flags live in shared state so the shortcut layer
// and gestures can check them.
import * as sfx from './sfx';
import * as focusTrap from './focus-trap';
import { showToast } from './toast';
import { scrollBehavior } from './motion';
import { state } from './state';

export let openKbd = () => {};
export let closeKbd = () => {};
export let hideFindNav = () => {};

export const initCmdPalette = () => {
  // Command palette
  const cmdBackdrop = document.getElementById('cmd-backdrop');
  const cmdPalette = document.getElementById('cmd-palette');
  const cmdInput = document.getElementById('cmd-input');
  const cmdResultsEl = document.getElementById('cmd-results');
  let cmdHighlightIdx = 0;
  let cmdFiltered = [];

  const CMD_ICONS = {
    nav: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3 8h10M9 5l4 3-4 3"/></svg>',
    link: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-3M10 2h4v4M14 2L8 8"/></svg>',
    action:
      '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="5.5"/><path d="M8 5.5V8l1.5 1.5"/></svg>',
    project:
      '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1"/><rect x="9" y="2.5" width="4.5" height="4.5" rx="1"/><rect x="2.5" y="9" width="4.5" height="4.5" rx="1"/><rect x="9" y="9" width="4.5" height="4.5" rx="1"/></svg>',
    find: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="6.5" cy="6.5" r="3.5"/><path d="M9.5 9.5l3 3"/></svg>',
  };

  const getCommands = () => {
    const nav = state.currentProfile?.labels?.nav || state.I18N.en.labels.nav;
    const projects = (state.currentProfile?.projects || state.I18N.en.projects || []).map((p) => ({
      group: 'Projects',
      label: p.name,
      icon: 'project',
      action: () => flashProject(p.name),
    }));
    return [
      {
        group: 'Navigate',
        label: nav.education,
        icon: 'nav',
        action: () => scrollCmd('education'),
      },
      {
        group: 'Navigate',
        label: nav.experience,
        icon: 'nav',
        action: () => scrollCmd('experience'),
      },
      {
        group: 'Navigate',
        label: nav.projects,
        icon: 'nav',
        action: () => scrollCmd('projects'),
      },
      {
        group: 'Navigate',
        label: nav.teaching,
        icon: 'nav',
        action: () => scrollCmd('teaching'),
      },
      { group: 'Navigate', label: nav.skills, icon: 'nav', action: () => scrollCmd('skills') },
      {
        group: 'Navigate',
        label: nav.recommendations,
        icon: 'nav',
        action: () => scrollCmd('recommendations'),
      },
      { group: 'Navigate', label: nav.connect, icon: 'nav', action: () => scrollCmd('connect') },
      ...projects,
      {
        group: 'Links',
        label: 'LinkedIn',
        icon: 'link',
        action: () => {
          window.open(
            state.currentProfile?.links?.linkedin || state.I18N.en.links.linkedin,
            '_blank',
          );
          closeCmd();
        },
      },
      {
        group: 'Links',
        label: 'GitHub',
        icon: 'link',
        action: () => {
          window.open(state.currentProfile?.links?.github || state.I18N.en.links.github, '_blank');
          closeCmd();
        },
      },
      {
        group: 'Actions',
        label: 'Toggle theme',
        icon: 'action',
        action: () => {
          document.getElementById('theme-toggle')?.click();
          closeCmd();
        },
      },
      {
        group: 'Actions',
        label: 'Toggle sound',
        icon: 'action',
        action: () => {
          sfx.toggleMute();
          closeCmd();
        },
      },
      {
        group: 'Actions',
        label: 'Copy email',
        icon: 'action',
        action: () => {
          navigator.clipboard
            ?.writeText(state.currentProfile?.email || '')
            .then(() => showToast('Email copied'));
          closeCmd();
        },
      },
      {
        group: 'Actions',
        label: 'Keyboard shortcuts',
        icon: 'action',
        action: () => {
          closeCmd();
          openKbd();
        },
      },
    ];
  };

  const scrollCmd = (id) => {
    const sec = document.getElementById(id);
    sec?.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
    closeCmd();
  };

  const flashProject = (name) => {
    closeCmd();
    const projSec = document.getElementById('projects');
    const card = Array.from(document.querySelectorAll('#projects .proj-card')).find(
      (c) => c.querySelector('h3')?.textContent?.trim() === name,
    );
    if (!card) {
      projSec?.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
      return;
    }
    card.scrollIntoView({ behavior: scrollBehavior, block: 'center' });
    card.classList.remove('cmd-flash');
    void card.offsetWidth;
    card.classList.add('cmd-flash');
    setTimeout(() => card.classList.remove('cmd-flash'), 1500);
  };

  const fuzzyScore = (text, q) => {
    text = text.toLowerCase();
    q = q.toLowerCase();
    let ti = 0,
      score = 0,
      streak = 0;
    for (let qi = 0; qi < q.length; qi++) {
      const ch = q[qi];
      let found = -1;
      for (let j = ti; j < text.length; j++) {
        if (text[j] === ch) {
          found = j;
          break;
        }
      }
      if (found === -1) return -1;
      score += found === ti ? 2 + streak : 1;
      if (found === 0 || text[found - 1] === ' ') score += 3;
      streak = found === ti ? streak + 1 : 0;
      ti = found + 1;
    }
    return score - text.length * 0.01;
  };

  const openCmd = () => {
    sfx.whoosh(true);
    state.cmdOpen = true;
    cmdBackdrop?.classList.add('open');
    cmdPalette?.classList.add('open');
    cmdPalette?.setAttribute('aria-hidden', 'false');
    if (cmdInput) cmdInput.setAttribute('aria-expanded', 'true');
    if (cmdPalette) focusTrap.activate(cmdPalette);
    cmdInput?.focus();
    renderCmd('');
  };

  const closeCmd = () => {
    sfx.whoosh(false);
    state.cmdOpen = false;
    cmdBackdrop?.classList.remove('open');
    cmdPalette?.classList.remove('open');
    cmdPalette?.setAttribute('aria-hidden', 'true');
    if (cmdInput) {
      cmdInput.value = '';
      cmdInput.setAttribute('aria-expanded', 'false');
    }
    if (!findCommitting) clearPageMarks();
    findCommitting = false;
    focusTrap.deactivate();
  };

  const setHighlight = (idx) => {
    const items = cmdResultsEl?.querySelectorAll('.cmd-item');
    if (!items) return;
    items.forEach((i) => i.classList.remove('highlighted'));
    const target = items[idx];
    if (target) {
      target.classList.add('highlighted');
      target.scrollIntoView({ block: 'nearest' });
    }
    cmdHighlightIdx = idx;
    if (cmdInput) cmdInput.setAttribute('aria-activedescendant', target ? `cmd-opt-${idx}` : '');
  };

  // The full-page find-and-mark pass (TreeWalker + replaceChild per hit) is
  // too heavy to run per keystroke — debounce it and re-render the palette
  // when the marks land. The command list itself stays synchronous.
  let pageMarkQuery = null;
  let pageMarkCount = 0;
  let pageMarkTimer = null;
  const schedulePageMarks = (q) => {
    if (q === pageMarkQuery) return;
    clearTimeout(pageMarkTimer);
    pageMarkTimer = setTimeout(() => {
      // clearPageMarks (inside highlightPage) resets pageMarkQuery — set it after.
      pageMarkCount = q.length >= 2 ? highlightPage(q) : (clearPageMarks(), 0);
      pageMarkQuery = q;
      if (state.cmdOpen && cmdInput && cmdInput.value.trim() === q) renderCmd(cmdInput.value, true);
    }, 120);
  };

  const renderCmd = (query, fromMarks = false) => {
    if (!cmdResultsEl) return;
    const all = getCommands();
    const q = query.trim();
    let grouped = true;
    if (!fromMarks) schedulePageMarks(q);
    const matchCount = q === pageMarkQuery ? pageMarkCount : 0;
    if (q) {
      grouped = false;
      cmdFiltered = all
        .map((c) => ({
          c,
          s: Math.max(fuzzyScore(c.label, q), fuzzyScore(c.group + ' ' + c.label, q) - 4),
        }))
        .filter((x) => x.s >= 0)
        .sort((a, b) => b.s - a.s)
        .map((x) => x.c);
      if (matchCount > 0) {
        cmdFiltered = [
          {
            label: `${matchCount} match${matchCount === 1 ? '' : 'es'} on page`,
            group: 'Find',
            icon: 'find',
            action: commitFind,
          },
          ...cmdFiltered,
        ];
      }
    } else {
      cmdFiltered = all;
    }
    cmdHighlightIdx = 0;
    if (!cmdFiltered.length) {
      const emptyQuotes = [
        '"Perhaps that is what makes life so precious." — Remarque',
        '"No such thing as a life that\'s better than yours." — J. Cole',
        '"I wanted peace and calm." — Remarque',
        '"I\'m on my way." — J. Cole',
      ];
      const eq = emptyQuotes[Math.floor(Math.random() * emptyQuotes.length)];
      cmdResultsEl.innerHTML =
        '<div style="padding:1.5rem;text-align:center;color:var(--muted);font-size:0.85rem;font-style:italic">' +
        eq +
        '</div>';
      return;
    }
    let html = '';
    let lastGroup = '';
    cmdFiltered.forEach((cmd, idx) => {
      if (grouped && cmd.group !== lastGroup) {
        html += `<div class="cmd-group-label">${cmd.group}</div>`;
        lastGroup = cmd.group;
      }
      const tag = grouped ? '' : `<span class="cmd-item-group">${cmd.group}</span>`;
      html += `<div class="cmd-item${idx === 0 ? ' highlighted' : ''}" id="cmd-opt-${idx}" data-idx="${idx}" role="option"><span class="cmd-item-icon">${CMD_ICONS[cmd.icon]}</span>${cmd.label}${tag}</div>`;
    });
    cmdResultsEl.innerHTML = html;
    cmdResultsEl.querySelectorAll('.cmd-item').forEach((item, idx) => {
      item.addEventListener('click', () => cmdFiltered[idx]?.action());
      item.addEventListener('mouseenter', () => {
        cmdHighlightIdx = idx;
        setHighlight(idx);
      });
    });
  };

  cmdInput?.addEventListener('input', (e) => renderCmd(e.target.value));
  cmdBackdrop?.addEventListener('click', closeCmd);
  document
    .getElementById('cmd-trigger')
    ?.addEventListener('click', () => (state.cmdOpen ? closeCmd() : openCmd()));

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key.toLowerCase() === 'f')) {
      e.preventDefault();
      if (state.projOpen || state.kbdOpen) return;
      state.cmdOpen ? closeCmd() : openCmd();
      return;
    }
    if (!state.cmdOpen) return;
    const items = cmdResultsEl?.querySelectorAll('.cmd-item');
    if (e.key === 'Escape') {
      closeCmd();
      return;
    }
    if (!items?.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((cmdHighlightIdx + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((cmdHighlightIdx - 1 + items.length) % items.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      cmdFiltered[cmdHighlightIdx]?.action();
    }
  });

  const kbdBackdrop = document.getElementById('kbd-backdrop');
  const kbdOverlay = document.getElementById('kbd-overlay');
  openKbd = () => {
    state.kbdOpen = true;
    kbdBackdrop?.classList.add('open');
    kbdOverlay?.classList.add('open');
    kbdOverlay?.setAttribute('aria-hidden', 'false');
    if (kbdOverlay) {
      focusTrap.activate(kbdOverlay);
      kbdOverlay.focus();
    }
  };
  closeKbd = () => {
    state.kbdOpen = false;
    kbdBackdrop?.classList.remove('open');
    kbdOverlay?.classList.remove('open');
    kbdOverlay?.setAttribute('aria-hidden', 'true');
    focusTrap.deactivate();
  };
  kbdBackdrop?.addEventListener('click', closeKbd);

  // Unified find — page marks shared between palette and find-nav
  let pageMarks = [];
  let findIdx = 0;
  let findCommitting = false;

  const clearPageMarks = () => {
    pageMarks.forEach((m) => {
      const p = m.parentNode;
      if (p) {
        p.replaceChild(document.createTextNode(m.textContent), m);
        p.normalize();
      }
    });
    pageMarks = [];
    pageMarkQuery = null;
    pageMarkCount = 0;
  };

  const highlightPage = (q) => {
    clearPageMarks();
    if (!q || q.length < 2) return 0;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escaped, 'gi');
    const walker = document.createTreeWalker(
      document.getElementById('main-content') || document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (n) => {
          const p = n.parentElement;
          if (!p || ['SCRIPT', 'STYLE', 'MARK'].includes(p.tagName))
            return NodeFilter.FILTER_REJECT;
          if (p.closest('.find-nav-bar,.cmd-palette,.kbd-overlay,.proj-modal'))
            return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      },
    );
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach((tn) => {
      const text = tn.textContent;
      if (!re.test(text)) {
        re.lastIndex = 0;
        return;
      }
      re.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let last = 0,
        m;
      while ((m = re.exec(text)) !== null) {
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        const mark = document.createElement('mark');
        mark.className = 'search-highlight';
        mark.textContent = m[0];
        frag.appendChild(mark);
        pageMarks.push(mark);
        last = re.lastIndex;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      tn.parentNode.replaceChild(frag, tn);
    });
    return pageMarks.length;
  };

  const updateFindActive = () => {
    pageMarks.forEach((m, i) => m.classList.toggle('search-highlight-active', i === findIdx));
    const cur = pageMarks[findIdx];
    if (cur) {
      cur.scrollIntoView({ behavior: scrollBehavior, block: 'center' });
    }
    const el = document.getElementById('find-nav-count');
    if (el) el.textContent = pageMarks.length ? `${findIdx + 1} / ${pageMarks.length}` : '';
  };

  const findNavBar = document.getElementById('find-nav-bar');
  const showFindNav = () => {
    state.findNavOpen = true;
    findNavBar?.classList.add('open');
    findNavBar?.setAttribute('aria-hidden', 'false');
  };
  hideFindNav = () => {
    state.findNavOpen = false;
    findNavBar?.classList.remove('open');
    findNavBar?.setAttribute('aria-hidden', 'true');
    clearPageMarks();
    const el = document.getElementById('find-nav-count');
    if (el) el.textContent = '';
  };
  const commitFind = () => {
    findCommitting = true;
    closeCmd();
    if (pageMarks.length) {
      findIdx = 0;
      updateFindActive();
      showFindNav();
    }
  };

  document.getElementById('find-nav-prev')?.addEventListener('click', () => {
    if (pageMarks.length) {
      findIdx = (findIdx - 1 + pageMarks.length) % pageMarks.length;
      updateFindActive();
    }
  });
  document.getElementById('find-nav-next')?.addEventListener('click', () => {
    if (pageMarks.length) {
      findIdx = (findIdx + 1) % pageMarks.length;
      updateFindActive();
    }
  });
  document.getElementById('find-nav-close')?.addEventListener('click', hideFindNav);
};
