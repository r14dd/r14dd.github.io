let ctx: AudioContext | null = null;
let muted = localStorage.getItem('portfolio-muted') === '1';

export function init() {
  if (muted) document.body.classList.add('sound-muted');
}

export function toggleMute() {
  muted = !muted;
  localStorage.setItem('portfolio-muted', muted ? '1' : '0');
  document.body.classList.toggle('sound-muted', muted);
  if (!muted) click();
}

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function tap() {
  if (muted) return;
  const c = getCtx();
  const dur = 0.04;
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = 300 + Math.random() * 100;
  f.Q.value = 2.5;
  const g = c.createGain();
  g.gain.setValueAtTime(0.07, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  src.connect(f).connect(g).connect(c.destination);
  src.start(c.currentTime);
  src.stop(c.currentTime + dur);
}

export function click() {
  if (muted) return;
  const c = getCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'triangle';
  o.frequency.setValueAtTime(180, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(60, c.currentTime + 0.06);
  g.gain.setValueAtTime(0.1, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.06);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime);
  o.stop(c.currentTime + 0.06);
}

export function whoosh(rising = true) {
  if (muted) return;
  const c = getCtx();
  const dur = 0.18;
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = 0.8;
  const g = c.createGain();
  if (rising) {
    f.frequency.setValueAtTime(300, c.currentTime);
    f.frequency.exponentialRampToValueAtTime(2000, c.currentTime + dur);
    g.gain.setValueAtTime(0.001, c.currentTime);
    g.gain.linearRampToValueAtTime(0.08, c.currentTime + dur * 0.4);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  } else {
    f.frequency.setValueAtTime(2000, c.currentTime);
    f.frequency.exponentialRampToValueAtTime(300, c.currentTime + dur);
    g.gain.setValueAtTime(0.08, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  }
  src.connect(f).connect(g).connect(c.destination);
  src.start(c.currentTime);
  src.stop(c.currentTime + dur);
}
