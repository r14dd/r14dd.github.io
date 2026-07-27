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

  let collapsed = false;
  let expanded = false;
  let squashing = false;

  redDot.addEventListener('click', (e) => {
    e.stopPropagation();
    if (squashing) return;
    if (collapsed) {
      setTimeout(() => {
        terminal.classList.remove('term-collapsed');
        collapsed = false;
      }, 400);
    } else {
      if (expanded) {
        terminal.classList.remove('term-expanded');
        expanded = false;
      }
      terminal.classList.add('term-collapsed');
      collapsed = true;
    }
  });

  terminal.addEventListener('click', (e) => {
    if (!collapsed) return;
    if (e.target === redDot || e.target === yellowDot || e.target === greenDot) return;
    setTimeout(() => {
      terminal.classList.remove('term-collapsed');
      collapsed = false;
    }, 400);
  });

  yellowDot.addEventListener('click', (e) => {
    e.stopPropagation();
    if (collapsed || squashing) return;
    squashing = true;
    terminal.classList.add('term-squashed');
    terminal.addEventListener(
      'animationend',
      () => {
        terminal.classList.remove('term-squashed');
        squashing = false;
      },
      { once: true },
    );
  });

  greenDot.addEventListener('click', (e) => {
    e.stopPropagation();
    if (collapsed || squashing) return;
    expanded = !expanded;
    terminal.classList.toggle('term-expanded', expanded);
  });
};
