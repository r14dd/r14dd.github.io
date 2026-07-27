// @ts-nocheck
const WORKER_URL = 'https://toy-api.riad-mrv.workers.dev';

export const initPaperAirplane = () => {
  const connectLinks = document.querySelector('.connect-links');
  if (!connectLinks) return;

  const trigger = document.createElement('button');
  trigger.className = 'airplane-trigger cta-btn';
  trigger.type = 'button';
  trigger.innerHTML = `<svg class="cta-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4z"/></svg>throw me a note`;
  connectLinks.appendChild(trigger);

  let overlay = null;

  const close = () => {
    if (overlay) {
      overlay.classList.remove('open');
      setTimeout(() => overlay?.remove(), 300);
      overlay = null;
    }
  };

  trigger.addEventListener('click', () => {
    if (overlay) {
      close();
      return;
    }

    overlay = document.createElement('div');
    overlay.className = 'airplane-overlay';
    overlay.innerHTML = `<div class="airplane-compose">
        <textarea class="airplane-text" maxlength="280" placeholder="write something..."></textarea>
        <input class="airplane-contact" type="text" placeholder="reply-to (optional)" maxlength="120"/>
        <input class="airplane-honey" type="text" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;opacity:0"/>
        <div class="airplane-footer">
          <span class="airplane-count">0 / 280</span>
          <button class="airplane-send" type="button">fold &amp; throw</button>
        </div>
      </div>
      <div class="airplane-anim" aria-hidden="true">
        <div class="airplane-plane">&#9992;</div>
      </div>`;

    connectLinks.closest('section').appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('open'));

    const textarea = overlay.querySelector('.airplane-text');
    const counter = overlay.querySelector('.airplane-count');
    const sendBtn = overlay.querySelector('.airplane-send');
    const honey = overlay.querySelector('.airplane-honey');
    const contact = overlay.querySelector('.airplane-contact');
    const planeEl = overlay.querySelector('.airplane-plane');
    const animWrap = overlay.querySelector('.airplane-anim');

    textarea.addEventListener('input', () => {
      counter.textContent = `${textarea.value.length} / 280`;
    });

    textarea.focus();

    sendBtn.addEventListener('click', () => {
      const text = textarea.value.trim();
      if (!text) {
        textarea.classList.add('airplane-shake');
        setTimeout(() => textarea.classList.remove('airplane-shake'), 400);
        return;
      }

      const compose = overlay.querySelector('.airplane-compose');
      compose.classList.add('airplane-folding');

      setTimeout(() => {
        compose.style.display = 'none';
        animWrap.classList.add('active');

        const map = document.querySelector('.mini-map');
        if (map) {
          const mapRect = map.getBoundingClientRect();
          const overlayRect = overlay.getBoundingClientRect();
          const dx = mapRect.left + mapRect.width / 2 - overlayRect.left - overlayRect.width / 2;
          const dy = mapRect.top + mapRect.height / 2 - overlayRect.top;
          planeEl.style.setProperty('--fly-x', `${dx}px`);
          planeEl.style.setProperty('--fly-y', `${dy}px`);
        }

        planeEl.classList.add('flying');

        fetch(`${WORKER_URL}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            contact: contact.value.trim() || null,
            honey: honey.value || undefined,
          }),
        }).catch(() => {});

        setTimeout(() => {
          planeEl.classList.remove('flying');
          planeEl.classList.add('landed');
          planeEl.textContent = '✓';
          setTimeout(close, 800);
        }, 1200);
      }, 600);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
  });
};
