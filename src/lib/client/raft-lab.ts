/* Renders a live Raft cluster (raft-core.ts) into any container: /lab §09
 * mounts it into a static panel; the homepage mounts it inside the Raft
 * project modal in place of the canned sim. mountRaft builds its own DOM and
 * returns a destroy function, so a modal can open and close it repeatedly
 * without leaking rAF loops or observers.
 *
 * The engine only ticks while the panel is on screen and the tab is visible.
 * Under prefers-reduced-motion nothing moves until the visitor presses play,
 * and messages appear as state changes instead of traveling dots. */

import { RaftCluster } from './raft-core';

const SVG_NS = 'http://www.w3.org/2000/svg';
const W = 560;
const H = 300;
const CX = W / 2;
const CY = H / 2 + 6;
const RX = 205;
const RY = 108;

// Log-cell colors by term. Cycled on purpose: terms are ordinal, adjacent
// distinct is all that matters here, and the legend is the term number itself.
const TERM_COLORS = ['#3987e5', '#b08a40', '#8b5cf6', '#2fa985', '#d16a6a', '#5aa9d6'];
const termColor = (t: number) => TERM_COLORS[(t - 1 + 600) % TERM_COLORS.length];

// Global tempo: the sim runs at 70% of real time so 1× reads as unhurried and
// 4× stays watchable rather than frantic. Labels describe the relative
// speeds, which is what a visitor actually perceives.
const TEMPO = 0.7;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

export function mountRaft(root: HTMLElement): () => void {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // A random seed per mount — determinism matters for tests, not theater.
  const cluster = new RaftCluster({ seed: (Math.random() * 2 ** 31) | 0 });

  const pos = (i: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / cluster.n;
    return { x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a) };
  };

  // ── DOM scaffolding ──
  root.classList.add('raft-panel');
  const stage = el('div', 'raft-stage');
  const controls = el('div', 'raft-controls');
  const btnSubmit = el('button', 'raft-submit', 'submit command');
  const btnPartition = el('button', 'raft-partition', 'partition leader');
  const btnSpeed = el('button', 'raft-speed', '1× speed');
  const btnPlay = el('button', 'raft-play');
  for (const b of [btnSubmit, btnPartition, btnSpeed, btnPlay]) b.type = 'button';
  controls.append(btnSubmit, btnPartition, btnSpeed, btnPlay);
  const eventEl = el('p', 'raft-event', 'starting cluster…');
  eventEl.setAttribute('aria-live', 'polite');
  const logsEl = el('div', 'raft-logs');
  logsEl.setAttribute('aria-label', 'Per-node replicated logs');
  const legend = el(
    'p',
    'raft-legend',
    'each cell is a log entry, colored by term · filled = committed by quorum · click nodes to crash / restart',
  );
  root.append(stage, controls, eventEl, logsEl, legend);

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Live Raft cluster of five nodes');
  const wireLayer = document.createElementNS(SVG_NS, 'g');
  const msgLayer = document.createElementNS(SVG_NS, 'g');
  const nodeLayer = document.createElementNS(SVG_NS, 'g');
  svg.append(wireLayer, msgLayer, nodeLayer);
  stage.appendChild(svg);

  for (let a = 0; a < cluster.n; a++)
    for (let b = a + 1; b < cluster.n; b++) {
      const l = document.createElementNS(SVG_NS, 'line');
      const pa = pos(a);
      const pb = pos(b);
      l.setAttribute('x1', String(pa.x));
      l.setAttribute('y1', String(pa.y));
      l.setAttribute('x2', String(pb.x));
      l.setAttribute('y2', String(pb.y));
      l.setAttribute('class', 'raft-wire');
      wireLayer.appendChild(l);
    }

  interface NodeView {
    g: SVGGElement;
    circle: SVGCircleElement;
    term: SVGTextElement;
  }
  const nodeViews: NodeView[] = [];
  for (let i = 0; i < cluster.n; i++) {
    const p = pos(i);
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'raft-node');
    g.setAttribute('transform', `translate(${p.x} ${p.y})`);
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', `Node ${i} — click to crash or restart`);
    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('r', '25');
    const name = document.createElementNS(SVG_NS, 'text');
    name.setAttribute('class', 'raft-node-name');
    name.setAttribute('text-anchor', 'middle');
    name.setAttribute('dy', '1');
    name.textContent = `n${i}`;
    const term = document.createElementNS(SVG_NS, 'text');
    term.setAttribute('class', 'raft-node-term');
    term.setAttribute('text-anchor', 'middle');
    term.setAttribute('dy', '40');
    g.append(circle, name, term);
    const toggle = () => {
      if (cluster.nodes[i].alive) cluster.crash(i);
      else cluster.restart(i);
      render();
    };
    g.addEventListener('click', toggle);
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
    nodeLayer.appendChild(g);
    nodeViews.push({ g, circle, term });
  }

  // ── log panel: one row per node ──
  const logRows: HTMLElement[] = [];
  for (let i = 0; i < cluster.n; i++) {
    const row = el('div', 'raft-log-row');
    const label = el('span', 'raft-log-label', `n${i}`);
    const cells = el('div', 'raft-log-cells');
    row.append(label, cells);
    logsEl.appendChild(row);
    logRows.push(row);
  }

  // ── controls ──
  let speed = 1;
  let running = !reduceMotion;
  let visible = false;
  let lastEventCount = 0;

  btnSubmit.addEventListener('click', () => {
    if (cluster.clientRequest() === null)
      setEvent({ at: cluster.now, node: -1, text: 'no leader — command rejected, try again' });
    render();
  });
  btnPartition.addEventListener('click', () => {
    if (cluster.partitioned) {
      cluster.partition([]);
    } else {
      const ld = cluster.leader();
      // Isolate the leader plus one follower — a 2/3 minority split, so the
      // old leader visibly keeps trying while the majority elects past it.
      const buddy = cluster.nodes.findIndex((nd) => nd.alive && nd.id !== ld);
      cluster.partition(ld === null ? [0, 1] : [ld, buddy === -1 ? (ld + 1) % cluster.n : buddy]);
    }
    render();
  });
  btnSpeed.addEventListener('click', () => {
    speed = speed === 1 ? 4 : 1;
    btnSpeed.textContent = speed === 1 ? '1× speed' : '4× speed';
  });
  btnPlay.addEventListener('click', () => {
    running = !running;
    btnPlay.textContent = running ? '⏸ pause' : '▶ play';
  });
  btnPlay.textContent = running ? '⏸ pause' : '▶ play';

  function setEvent(ev: { at: number; node: number; text: string }) {
    eventEl.textContent = `[t=${(ev.at / 1000).toFixed(1)}s] ${ev.text}`;
  }

  // ── render ──
  const msgDots = new Map<number, SVGCircleElement>();

  function render() {
    for (let i = 0; i < cluster.n; i++) {
      const nd = cluster.nodes[i];
      const v = nodeViews[i];
      // Dead nodes drop their role class — a crashed ex-leader must not keep
      // rendering as the leader. A live stale leader (minority side of a
      // partition) keeps is-leader on purpose: watching two nodes believe
      // they lead different terms is the demo. data-auth marks the single
      // authoritative (highest-term) leader for tests and tooling.
      v.g.setAttribute('class', nd.alive ? `raft-node is-${nd.role}` : 'raft-node is-dead');
      if (cluster.leader() === i) v.g.setAttribute('data-auth', '1');
      else v.g.removeAttribute('data-auth');
      v.term.textContent = nd.alive ? `t${nd.currentTerm}` : '✕';
    }

    // Traveling messages (skipped under reduced motion — the receive is what
    // matters, and the event line narrates it).
    if (!reduceMotion) {
      const live = new Set<number>();
      for (const env of cluster.inFlight) {
        live.add(env.id);
        let dot = msgDots.get(env.id);
        if (!dot) {
          dot = document.createElementNS(SVG_NS, 'circle');
          dot.setAttribute('r', '3.2');
          dot.setAttribute(
            'class',
            env.msg.kind.startsWith('Append')
              ? 'raft-msg raft-msg-append'
              : 'raft-msg raft-msg-vote',
          );
          msgLayer.appendChild(dot);
          msgDots.set(env.id, dot);
        }
        const t = Math.min(1, (cluster.now - env.sentAt) / (env.deliverAt - env.sentAt));
        const a = pos(env.from);
        const b = pos(env.to);
        dot.setAttribute('cx', String(a.x + (b.x - a.x) * t));
        dot.setAttribute('cy', String(a.y + (b.y - a.y) * t));
      }
      for (const [id, dot] of msgDots)
        if (!live.has(id)) {
          dot.remove();
          msgDots.delete(id);
        }
    }

    // Logs.
    for (let i = 0; i < cluster.n; i++) {
      const nd = cluster.nodes[i];
      const row = logRows[i];
      row.classList.toggle('is-dead', !nd.alive);
      const cells = row.lastElementChild as HTMLElement;
      const want = nd.log.length - 1;
      while (cells.children.length > want) cells.lastElementChild!.remove();
      while (cells.children.length < want) cells.appendChild(el('span', 'raft-cell'));
      for (let idx = 1; idx <= want; idx++) {
        const c = cells.children[idx - 1] as HTMLElement;
        const entry = nd.log[idx];
        const committed = idx <= nd.commitIndex;
        c.style.setProperty('--cell', termColor(entry.term));
        c.className = `raft-cell${committed ? ' is-committed' : ''}`;
        c.title = `#${idx} "${entry.cmd}" (term ${entry.term}${committed ? ', committed' : ''})`;
      }
    }

    if (cluster.events.length !== lastEventCount) {
      lastEventCount = cluster.events.length;
      setEvent(cluster.events[cluster.events.length - 1]);
    }

    btnPartition.textContent = cluster.partitioned ? 'heal partition' : 'partition leader';
  }

  // ── loop ──
  let last = performance.now();
  let rafId = 0;
  function frame(ts: number) {
    rafId = requestAnimationFrame(frame);
    const dt = ts - last;
    last = ts;
    if (!running || !visible || document.hidden) return;
    cluster.tick(dt * speed * TEMPO);
    render();
  }
  rafId = requestAnimationFrame(frame);

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      last = performance.now();
    },
    { threshold: 0.15 },
  );
  io.observe(stage);

  const onVis = () => {
    last = performance.now();
  };
  document.addEventListener('visibilitychange', onVis);

  render();

  const destroy = () => {
    cancelAnimationFrame(rafId);
    io.disconnect();
    document.removeEventListener('visibilitychange', onVis);
    // The modal mounts and destroys this repeatedly; without the removal each
    // open would leave another dead closure hanging off pagehide.
    window.removeEventListener('pagehide', destroy);
    root.replaceChildren();
    root.classList.remove('raft-panel');
  };
  window.addEventListener('pagehide', destroy);
  return destroy;
}

/** /lab entry point: mount into the static panel if the page has one. */
export function initRaftLab() {
  const panel = document.getElementById('raft-panel');
  if (panel) mountRaft(panel);
}
