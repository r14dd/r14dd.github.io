// @ts-nocheck
export const initTerminalDots = () => {
  const terminal = document.querySelector('.terminal-window');
  const dotsRow = document.querySelector('.terminal-dots');
  const redDot = document.querySelector('.dot-red');
  const yellowDot = document.querySelector('.dot-yellow');
  const greenDot = document.querySelector('.dot-green');

  if (!terminal || !dotsRow || !redDot || !yellowDot || !greenDot) return;

  [redDot, yellowDot, greenDot].forEach((d) => d.classList.add('dot-interactive'));
  terminal.classList.add('term-toyable');

  const sulk = document.createElement('span');
  sulk.className = 'terminal-sulk';
  sulk.textContent = '• • • fine.';
  dotsRow.appendChild(sulk);

  const SQUASH_MS = 900;

  let collapsed = false;
  let expanded = false;
  let squashing = false;

  const collapse = () => {
    if (expanded) {
      terminal.classList.remove('term-expanded');
      expanded = false;
    }
    terminal.classList.add('term-collapsed');
    collapsed = true;
  };

  // No artificial delay here. The old version waited 400ms before doing
  // anything visible, which just read as an unresponsive click.
  const reopen = () => {
    terminal.classList.remove('term-collapsed');
    collapsed = false;
  };

  redDot.addEventListener('click', (e) => {
    e.stopPropagation();
    if (squashing) return;
    collapsed ? reopen() : collapse();
  });

  terminal.addEventListener('click', (e) => {
    if (!collapsed) return;
    if (e.target === redDot || e.target === yellowDot || e.target === greenDot) return;
    reopen();
  });

  yellowDot.addEventListener('click', (e) => {
    e.stopPropagation();
    if (collapsed || squashing) return;
    squashing = true;
    terminal.classList.add('term-squashed');

    // animationend bubbles, so a descendant finishing its own animation used to
    // clear the squash early — that was the inconsistency. Only the terminal's
    // own animation counts, and a timer backstops a dropped event.
    const done = () => {
      if (!squashing) return;
      terminal.classList.remove('term-squashed');
      squashing = false;
      terminal.removeEventListener('animationend', onEnd);
    };
    const onEnd = (ev) => {
      if (ev.target !== terminal || ev.animationName !== 'squash-bounce') return;
      done();
    };
    terminal.addEventListener('animationend', onEnd);
    setTimeout(done, SQUASH_MS + 120);
  });

  greenDot.addEventListener('click', (e) => {
    e.stopPropagation();
    if (squashing) return;
    if (collapsed) reopen();
    expanded = !expanded;
    terminal.classList.toggle('term-expanded', expanded);
  });
};
