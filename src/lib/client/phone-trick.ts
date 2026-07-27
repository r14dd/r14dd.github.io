// @ts-nocheck
import { encodeQR } from '../qr';

const API = import.meta.env.DEV ? 'ws://localhost:8787' : 'wss://toy-api.riad-mrv.workers.dev';

export const initPhoneTrick = () => {
  const connect = document.getElementById('connect');
  if (!connect) return;

  const roomCode = randomCode();
  const url = `${location.origin}/remote#${roomCode}`;

  // An origin long enough to overflow the encoder is not worth a broken pane —
  // skip the toy rather than render an unscannable code.
  let qrSvg: string;
  try {
    qrSvg = renderQR(url);
  } catch {
    return;
  }

  const wrap = document.createElement('div');
  wrap.className = 'phone-qr';
  wrap.setAttribute('aria-hidden', 'true');
  wrap.innerHTML = `
    <div class="phone-qr-code">${qrSvg}</div>
    <div class="phone-qr-label">scan to possess this page</div>
    <div class="phone-qr-status"></div>
  `;

  const links = connect.querySelector('.connect-links');
  if (links) links.after(wrap);
  else connect.appendChild(wrap);

  const status = wrap.querySelector('.phone-qr-status');
  let ws: WebSocket | null = null;
  let orb: HTMLDivElement | null = null;
  let connected = false;
  let idleTimer: ReturnType<typeof setTimeout>;

  const resetIdle = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(disconnect, 5 * 60 * 1000);
  };

  const connectWS = () => {
    ws = new WebSocket(`${API}/room?code=${roomCode}&role=desktop`);

    ws.onopen = () => {
      resetIdle();
    };

    ws.onmessage = (e) => {
      resetIdle();
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'phone-joined') onPhoneJoined();
        else if (msg.type === 'phone-left') onPhoneLeft();
        else if (msg.type === 'gyro') onGyro(msg);
        else if (msg.type === 'flick') onFlick();
        else if (msg.type === 'error') {
          status.textContent = msg.message;
        }
      } catch {}
    };

    ws.onclose = () => {
      if (connected) onPhoneLeft();
    };
  };

  const disconnect = () => {
    if (ws) {
      ws.close();
      ws = null;
    }
    if (orb) {
      orb.remove();
      orb = null;
    }
    connected = false;
    wrap.classList.remove('phone-qr-active');
    status.textContent = '';
  };

  const onPhoneJoined = () => {
    connected = true;
    wrap.classList.add('phone-qr-active');
    status.textContent = 'connected';

    orb = document.createElement('div');
    orb.className = 'phone-orb';
    orb.setAttribute('aria-hidden', 'true');
    document.body.appendChild(orb);
  };

  const onPhoneLeft = () => {
    connected = false;
    wrap.classList.remove('phone-qr-active');
    status.textContent = 'disconnected';
    if (orb) {
      orb.remove();
      orb = null;
    }
    resetHeroLean();
  };

  const onGyro = (msg: { beta: number; gamma: number }) => {
    const { beta, gamma } = msg;
    if (orb) {
      const x = Math.min(Math.max((gamma + 45) / 90, 0), 1) * 100;
      const y = Math.min(Math.max((beta + 45) / 90, 0), 1) * 100;
      orb.style.left = `${x}vw`;
      orb.style.top = `${y}vh`;
    }

    const hero = heroEl();
    if (hero) {
      const leanX = Math.min(Math.max(gamma / 30, -1), 1) * 2;
      const leanY = Math.min(Math.max((beta - 45) / 30, -1), 1) * 1.5;
      hero.style.transform = `perspective(800px) rotateY(${leanX}deg) rotateX(${-leanY}deg)`;
      hero.style.transition = 'transform 0.15s ease-out';
    }
  };

  const resetHeroLean = () => {
    const hero = heroEl();
    if (hero) {
      hero.style.transform = '';
      hero.style.transition = 'transform 0.5s ease-out';
    }
  };

  const onFlick = () => {
    const plane = document.querySelector('.airplane-plane');
    if (plane) {
      plane.classList.add('flying');
      setTimeout(() => plane.classList.remove('flying'), 1500);
      return;
    }
    if (orb) {
      orb.classList.add('phone-orb-flick');
      setTimeout(() => orb.classList.remove('phone-orb-flick'), 600);
    }
  };

  // Proximity fade-in + WS connect
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        wrap.classList.add('phone-qr-visible');
        if (!ws) connectWS();
      }
    },
    { rootMargin: '200px' },
  );
  observer.observe(wrap);
};

// The hero is the first unclassed <section> in main — there is no .hero-section.
function heroEl() {
  return document.querySelector('main.content > section:first-of-type') as HTMLElement | null;
}

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  const arr = crypto.getRandomValues(new Uint8Array(6));
  for (const b of arr) code += chars[b % chars.length];
  return code;
}

function renderQR(text: string) {
  const matrix = encodeQR(text);
  const size = matrix.length;
  const cell = 4;
  const margin = 2;
  const total = (size + margin * 2) * cell;
  let rects = '';
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (matrix[r][c])
        rects += `<rect x="${(c + margin) * cell}" y="${(r + margin) * cell}" width="${cell}" height="${cell}"/>`;
  return `<svg viewBox="0 0 ${total} ${total}" xmlns="http://www.w3.org/2000/svg" class="phone-qr-svg"><rect width="${total}" height="${total}" fill="var(--bg)"/><g fill="var(--accent)">${rects}</g></svg>`;
}
