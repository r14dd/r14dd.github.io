// @ts-nocheck — verbatim move of the (never type-checked) inline script;
// typing it for strict TS would mean touching runtime logic. Separate task.
// The hero terminal: boot-typing animation (initTerminalBoot) and the
// interactive desktop-only shell (initTerminal). Command data comes from
// window._termProfile, kept fresh by the language switcher.
import * as sfx from './sfx';
import { vitals as _vitals } from './vitals';
import { prefersReducedMotion, scrollBehavior } from './motion';

export const initTerminalBoot = () => {
  if (prefersReducedMotion) return;
  const lines = Array.from(document.querySelectorAll('.terminal-body .terminal-line'));
  if (!lines.length) return;

  lines.forEach((l) => l.classList.add('term-hidden'));

  const revealLine = (line) => {
    line.classList.remove('term-hidden');
    line.classList.add('term-visible');
  };

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const typeText = (el, text) =>
    new Promise((resolve) => {
      el.textContent = '';
      let i = 0;
      const step = () => {
        if (i >= text.length) return resolve();
        const chunk = Math.random() < 0.4 ? 2 : 1;
        el.textContent = text.slice(0, Math.min(i + chunk, text.length));
        i = Math.min(i + chunk, text.length);
        if (i < text.length) setTimeout(step, 18 + Math.random() * 25);
        else resolve();
      };
      step();
    });

  const waitForIntro = () =>
    new Promise((resolve) => {
      if (document.body.classList.contains('intro-done')) return resolve(undefined);
      const obs = new MutationObserver(() => {
        if (document.body.classList.contains('intro-done')) {
          obs.disconnect();
          resolve(undefined);
        }
      });
      obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    });

  (async () => {
    await waitForIntro();
    await wait(300);
    for (const line of lines) {
      const cmd = line.querySelector('.terminal-cmd');
      const cursor = line.querySelector('.terminal-cursor');
      const text = line.querySelector('.terminal-text');

      if (cmd) {
        const val = cmd.textContent;
        cmd.textContent = '';
        revealLine(line);
        await typeText(cmd, val);
        await wait(250);
      } else if (text) {
        const val = text.textContent;
        text.textContent = '';
        revealLine(line);
        await typeText(text, val);
        await wait(60);
      } else if (line.classList.contains('terminal-stats')) {
        revealLine(line);
        await wait(120);
      } else if (cursor) {
        revealLine(line);
      } else {
        revealLine(line);
        await wait(60);
      }
    }
    window.dispatchEvent(new Event('term-ready'));
  })();
};

// Interactive terminal — desktop only, after animation
export const initTerminal = () => {
  const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!isDesktop) return;

  const esc = (s) =>
    typeof s === 'string'
      ? s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      : '';
  const FORTUNES = [
    'There are only two hard things in CS: cache invalidation and naming things.',
    'It works on my machine. Ship the machine.',
    '// TODO: fix this later (written 3 years ago)',
    'A good programmer looks both ways before crossing a one-way street.',
    'Rust: where the compiler is your therapist.',
    'First, solve the problem. Then, write the code.',
    'Deleted code is debugged code.',
    'The best code is no code at all.',
  ];

  const termBody = document.querySelector('.terminal-body');
  const inputLine = document.getElementById('term-input-line');
  if (!termBody || !inputLine) return;

  let hist = [];
  try {
    hist = JSON.parse(localStorage.getItem('term-history') || '[]');
    if (!Array.isArray(hist)) hist = [];
  } catch {
    hist = [];
  }
  let histIdx = hist.length;
  const bootT = performance.now();

  // Rust → WebAssembly (public/lab/lab.wasm) — lazy-loaded on first rrf/hash/xor.
  let wasmExports = null,
    wasmLoading = null;
  const loadWasm = () => {
    if (wasmExports) return Promise.resolve(wasmExports);
    if (wasmLoading) return wasmLoading;
    wasmLoading = (async () => {
      const url = '/lab/lab.wasm';
      let instance;
      try {
        instance = (await WebAssembly.instantiateStreaming(fetch(url), {})).instance;
      } catch {
        instance = (await WebAssembly.instantiate(await (await fetch(url)).arrayBuffer(), {}))
          .instance;
      }
      wasmExports = instance.exports;
      return wasmExports;
    })();
    return wasmLoading;
  };
  const hex8 = (n) => '0x' + (n >>> 0).toString(16).padStart(8, '0');
  const parseIntSmart = (s) => {
    s = String(s).trim();
    return /^0x[0-9a-f]+$/i.test(s) ? parseInt(s, 16) : parseInt(s, 10);
  };
  const wasmRRF = async (ranks, k = 60) => {
    const w = await loadWasm();
    let sum = 0;
    for (const r of ranks) sum += w.rrf_term(k | 0, r | 0);
    return sum;
  };
  const wasmXor = async (a, b) => {
    const w = await loadWasm();
    return {
      dist: w.xor_distance(a >>> 0, b >>> 0) >>> 0,
      bucket: w.bucket_index(a >>> 0, b >>> 0) >>> 0,
    };
  };
  const wasmHash = async (text) => {
    const w = await loadWasm();
    const bytes = new TextEncoder().encode(text);
    const n = Math.min(bytes.length, w.input_cap());
    const ptr = w.input_ptr();
    new Uint8Array(w.memory.buffer, ptr, n).set(bytes.subarray(0, n));
    return w.fnv1a32(n) >>> 0;
  };

  const fmtMs = (v) =>
    v == null ? '—' : v < 1000 ? Math.round(v) + ' ms' : (v / 1000).toFixed(2) + ' s';
  const fmtKb = (b) => (b ? (b / 1024).toFixed(1) + ' KB' : '—');
  const readVitals = () => {
    const nav = performance.getEntriesByType('navigation')[0] || {};
    const res = performance.getEntriesByType('resource');
    let bytes = nav.transferSize || 0,
      jsBytes = 0;
    for (const r of res) {
      bytes += r.transferSize || 0;
      if (r.initiatorType === 'script' || /\.js(\?|$)/.test(r.name)) jsBytes += r.transferSize || 0;
    }
    return {
      fcp: _vitals.fcp,
      lcp: _vitals.lcp,
      cls: _vitals.cls,
      inp: _vitals.inp,
      ttfb: nav.responseStart || null,
      dcl: nav.domContentLoadedEventEnd || null,
      bytes,
      jsBytes,
      reqs: res.length + 1,
    };
  };
  const probePing = async (url) => {
    const t = performance.now();
    try {
      await fetch(url, { mode: 'no-cors', cache: 'no-store' });
    } catch {
      return null;
    }
    return performance.now() - t;
  };
  const collectWhere = async () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown';
    const rows = [['timezone', tz]];
    rows.push([
      'locale',
      navigator.language +
        (navigator.languages?.length
          ? ' (' + navigator.languages.slice(0, 3).join(', ') + ')'
          : ''),
    ]);
    rows.push([
      'approx region',
      tz.includes('/') ? tz.split('/').slice(-1)[0].replace(/_/g, ' ') : tz,
    ]);
    const c = navigator.connection;
    if (c)
      rows.push([
        'connection',
        (c.effectiveType || '?') +
          (c.rtt != null ? ' · ~' + c.rtt + 'ms rtt' : '') +
          (c.downlink != null ? ' · ' + c.downlink + ' Mbps' : ''),
      ]);
    rows.push(['online', navigator.onLine ? 'yes' : 'no']);
    const probes = [
      ['this origin', location.origin + '/favicon.ico'],
      ['cloudflare', 'https://cloudflare.com/favicon.ico'],
      ['google', 'https://www.google.com/favicon.ico'],
    ];
    for (const [name, url] of probes) {
      const ms = await probePing(url);
      rows.push([name + ' rtt', ms == null ? 'blocked' : Math.round(ms) + ' ms']);
    }
    rows.push(['server involved', 'none — measured in your browser']);
    return rows;
  };

  const getCommands = () => {
    const p = window._termProfile || {};
    const email = p.email || 'riad@riad.cc';
    const github = p.links?.github || 'https://github.com/r14dd';
    const resume = p.links?.resume || '/resume.pdf';
    const t = p.labels?.terminal || {};
    const projects = p.projects || [];
    const skills = p.skills || [];
    const experience = p.experience || [];
    const tx = (s) => '<span class="terminal-text">' + esc(s) + '</span>';
    const cmt = (s) => '<span class="terminal-comment">' + esc(s) + '</span>';
    const skillItems = (s) => (s.groups ? s.groups.flatMap((g) => g.items || []) : s.items || []);
    const philo = () => ({
      lines: [
        'The through-line:',
        '',
        '  patent      never asserts absence — it reports only what it',
        '              actually checked, in the sources it reached.',
        '  QuorumRAG   surfaces evidence only after independent retrievers',
        '              reach consensus. No quorum, no claim.',
        '',
        '  Same idea, twice: earn confidence before you assert it.',
      ],
    });
    const REMARKS = [
      '"I am young, I am twenty years old; yet I know nothing of life but despair, death, fear." — All Quiet on the Western Front',
      '"But perhaps that is what makes life so precious — that it can be lost." — Three Comrades',
      '"The world has enough people who know how to die. What it needs is people who know how to live." — Three Comrades',
      '"I did not want to think so much. I wanted peace and calm." — All Quiet on the Western Front',
      '"We are forlorn like children, and experienced like old men." — All Quiet on the Western Front',
    ];
    const COLE_LINES = [
      '"No such thing as a life that\'s better than yours." — Love Yourz',
      '"Fool me one time, shame on you. Fool me twice, can\'t put the blame on you." — No Role Modelz',
      "\"If they don't know your dreams, they can't shoot 'em down.\" — Apparently",
      '"Always gon\' be a bigger house somewhere, but n***a feel me, long as the people in that motherf***er love you dearly." — Love Yourz',
      '"I\'m on my way, I know I\'m gonna get there some day." — The Climb Back',
    ];
    let quoteIdx = 0;

    return {
      help: () => ({
        rich: [
          tx('ls · cat · grep') + cmt('explore — try: projects | grep rust'),
          tx('whoami · stats') + cmt('roles & quick numbers'),
          tx('projects · skills') + cmt('what I build'),
          tx('rrf · hash · xor') + cmt('real Rust, run live in WebAssembly'),
          tx('perf · where') + cmt('your Web Vitals & connection info'),
          tx('patent') + cmt('a real project run, replayed'),
          tx('offline') + cmt('enable/disable offline mode'),
          tx('man riad') + cmt('the manual'),
          tx('philosophy') + cmt('the through-line'),
          tx('reading · quote') + cmt('Remarque & Cole'),
          tx('deps') + cmt('what this runs on'),
          tx('contact · resume · github') + cmt('reach me'),
          tx('fortune · neofetch') + cmt('for fun'),
          tx('clear') + cmt('clear the screen'),
        ],
      }),
      whoami: () => ({
        lines: [t.role1 || 'AI Engineer @ ABB', t.role2 || 'Head of IT @ EYP AZ'],
      }),
      stats: () => {
        const wrapNum = (s) =>
          esc(s).replace(/^([\d.,+Kk]+)/, '<span class="term-stat-num">$1</span>');
        return {
          html:
            '<span class="terminal-stats" style="display:flex;flex-wrap:wrap;align-items:baseline;gap:0.25rem 0.45rem"><span class="term-stat">' +
            wrapNum(t.stat1 || '2K+ students taught') +
            '</span><span class="term-stat-sep">·</span><span class="term-stat">' +
            wrapNum(t.stat2 || '5+ teams led') +
            '</span><span class="term-stat-sep">·</span><span class="term-stat">' +
            wrapNum(t.stat3 || '4+ yrs shipping') +
            '</span></span>',
        };
      },
      ls: (args) => {
        const w = (args[0] || '').replace(/^\//, '').toLowerCase();
        if (!w) return { lines: ['projects/   skills/   experience/   about'] };
        if (w.startsWith('project')) return { lines: projects.map((x) => x.name) };
        if (w.startsWith('skill')) return { lines: skills.map((s) => s.category) };
        if (w.startsWith('exp')) return { lines: experience.map((e) => e.role + ' — ' + e.org) };
        if (w.startsWith('about')) return { lines: [('Riad ' + (p.about || '')).trim()] };
        return { lines: ['ls: no such directory: ' + w], cls: 'err' };
      },
      cat: (args) => {
        const q = args.join(' ').toLowerCase().trim();
        if (!q) return { lines: ['usage: cat <project|about>'], cls: 'muted' };
        if (q === 'about') return { lines: [('Riad ' + (p.about || '')).trim()] };
        const x = projects.find(
          (pr) =>
            pr.name.toLowerCase().includes(q) ||
            q.includes(pr.name.toLowerCase().split(/[ .—-]/)[0]),
        );
        if (!x) return { lines: ['cat: ' + q + ': not found. try: ls projects'], cls: 'err' };
        const out = [x.name];
        if (x.impact) out.push(x.impact);
        if (x.tech && x.tech.length) out.push('tech: ' + x.tech.join(', '));
        (x.bullets || []).forEach((b) => out.push('  • ' + b));
        return { lines: out };
      },
      projects: (args, raw, stdin, solo) => {
        if (solo)
          setTimeout(
            () =>
              document
                .getElementById('projects')
                ?.scrollIntoView({ behavior: scrollBehavior, block: 'start' }),
            600,
          );
        return {
          lines: projects.length
            ? projects.map(
                (x) => x.name + (x.tech && x.tech.length ? ' — ' + x.tech.join(', ') : ''),
              )
            : ['No projects loaded.'],
        };
      },
      skills: () => ({
        lines: skills.length
          ? skills.map((s) => s.category + ': ' + skillItems(s).join(', '))
          : ['Rust · Python · Go · Tokio · FastAPI', 'Kafka · PostgreSQL · Docker · AWS'],
      }),
      grep: (args, raw, stdin) => {
        const pat = raw.trim();
        if (!pat) return { lines: ['grep: missing pattern'], cls: 'err' };
        if (!stdin)
          return { lines: ['grep: reads a pipe — try: projects | grep rust'], cls: 'err' };
        let re;
        try {
          re = new RegExp(pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        } catch {
          re = null;
        }
        const hits = re ? stdin.filter((l) => re.test(l)) : [];
        return {
          lines: hits.length ? hits : ['grep: no match for "' + pat + '"'],
          cls: hits.length ? '' : 'muted',
        };
      },
      head: (args, raw, stdin) => {
        if (!stdin) return { lines: ['head: reads a pipe'], cls: 'err' };
        let n = 5;
        const m = raw.match(/(\d+)/);
        if (m) n = parseInt(m[1], 10);
        return { lines: stdin.slice(0, n) };
      },
      tail: (args, raw, stdin) => {
        if (!stdin) return { lines: ['tail: reads a pipe'], cls: 'err' };
        let n = 5;
        const m = raw.match(/(\d+)/);
        if (m) n = parseInt(m[1], 10);
        return { lines: stdin.slice(-n) };
      },
      wc: (args, raw, stdin) => {
        if (!stdin) return { lines: ['wc: reads a pipe'], cls: 'err' };
        return { lines: [String(stdin.length)] };
      },
      man: (args) => {
        const who = (args[0] || 'riad').toLowerCase();
        if (who !== 'riad')
          return { lines: ['No manual entry for ' + who + '. Try: man riad'], cls: 'muted' };
        return {
          lines: [
            'RIAD(1)            Personal Manual            RIAD(1)',
            '',
            'NAME',
            '     riad — software & AI engineer; Rust and Python',
            '',
            'SYNOPSIS',
            '     riad [--rust] [--python] [--distributed] <problem>',
            '',
            'DESCRIPTION',
            '     Builds software and AI systems with a focus on',
            '     distributed systems and complex infrastructure.',
            '     Previously taught ~1000 CS students at SUNY Buffalo.',
            '',
            'ROLES',
            '     ' + (t.role1 || 'AI Engineer @ ABB'),
            '     ' + (t.role2 || 'Head of IT @ EYP AZ'),
            '',
            'SEE ALSO',
            '     ls(1), cat(1), grep(1), philosophy(1), perf(1), patent(1)',
          ],
        };
      },
      philosophy: philo,
      why: philo,
      rrf: async (args) => {
        const ks = args.filter((a) => /^k=/.test(a)).map((a) => parseInt(a.slice(2), 10));
        const k = ks.length ? ks[0] : 60;
        const ranks = args
          .filter((a) => !/^k=/.test(a))
          .map((a) => parseInt(a, 10))
          .filter((x) => !isNaN(x));
        if (!ranks.length)
          return {
            lines: ['usage: rrf <rank1> <rank2> …   (k=60 default; 0 = absent)'],
            cls: 'muted',
          };
        const score = await wasmRRF(ranks, k);
        const parts = ranks.map((r) => (r <= 0 ? '0' : '1/(' + k + '+' + r + ')')).join(' + ');
        return {
          lines: [
            'rrf(k=' + k + ') = ' + parts,
            '           = ' + score.toFixed(6),
            '(computed in WebAssembly · lab.wasm)',
          ],
        };
      },
      hash: async (args, raw) => {
        const text = raw.trim();
        if (!text) return { lines: ['usage: hash <text>'], cls: 'muted' };
        const h = await wasmHash(text);
        return {
          lines: [
            'fnv1a32("' + text + '") = ' + hex8(h) + '  (' + (h >>> 0) + ')',
            '(computed in WebAssembly · lab.wasm)',
          ],
        };
      },
      xor: async (args) => {
        if (args.length < 2) return { lines: ['usage: xor <a> <b>   (dec or 0x…)'], cls: 'muted' };
        const a = parseIntSmart(args[0]),
          b = parseIntSmart(args[1]);
        if (isNaN(a) || isNaN(b)) return { lines: ['xor: could not parse operands'], cls: 'err' };
        const r = await wasmXor(a, b);
        return {
          lines: [
            hex8(a) + ' ⊕ ' + hex8(b) + ' = ' + hex8(r.dist) + '  (' + r.dist + ')',
            'k-bucket index (shared prefix): ' + r.bucket,
            '(computed in WebAssembly · lab.wasm)',
          ],
        };
      },
      neofetch: () => {
        const langGroup = skills.find((s) => /Programming|Language/i.test(s.category));
        const langs = langGroup ? skillItems(langGroup).slice(0, 4) : ['Rust', 'Python', 'Go', 'C'];
        return {
          lines: [
            '  riad@portfolio',
            '  ──────────────',
            '  roles  ' + (t.role1 || 'AI Engineer @ ABB'),
            '  langs  ' + langs.join(' · '),
            '  stack  Tokio · FastAPI · Kafka · Postgres · Docker',
            '  shell  hero-term — type help',
          ],
        };
      },
      history: () => ({
        lines: hist.length
          ? hist.map((h, i) => String(i + 1).padStart(3) + '  ' + h)
          : ['(no history yet)'],
      }),
      uptime: () => {
        const h = new Date().getHours();
        const mood =
          h >= 0 && h < 6 ? 'nocturnal' : h < 12 ? 'building' : h < 18 ? 'shipping' : 'reflecting';
        return {
          lines: [
            'up ' +
              ((performance.now() - bootT) / 1000).toFixed(1) +
              's · 1 user · load average: calm, calm, calm',
            'mood: ' + mood,
          ],
        };
      },
      deps: () => ({
        lines: [
          'Dependencies:',
          '  patience, discipline      — Remarque',
          '  hunger, focus             — Cole',
          '  (no node_modules found. this is intentional.)',
        ],
      }),
      reading: () => {
        const all = [...REMARKS, ...COLE_LINES];
        const q = all[quoteIdx % all.length];
        quoteIdx++;
        return { lines: [q] };
      },
      quote: () => {
        const all = [...REMARKS, ...COLE_LINES];
        const q = all[quoteIdx % all.length];
        quoteIdx++;
        return { lines: [q] };
      },
      date: () => ({ lines: [new Date().toString()] }),
      echo: (args, raw) => ({ lines: [raw] }),
      sudo: () => ({
        lines: ['riad is not in the sudoers file. This incident will be reported. 🙂'],
        cls: 'err',
      }),
      vim: () => ({ lines: ["Entering vim… kidding. (:q!) You're free."], cls: 'muted' }),
      contact: () => ({ html: tx(email) }),
      resume: () => {
        window.open(resume, '_blank');
        return { html: tx('Opening resume...') };
      },
      github: () => {
        window.open(github, '_blank');
        return { html: tx('Opening github.com/r14dd...') };
      },
      perf: () => {
        const v = readVitals();
        return {
          lines: [
            'FCP   ' + fmtMs(v.fcp) + '      LCP   ' + fmtMs(v.lcp),
            'TTFB  ' + fmtMs(v.ttfb) + '      CLS   ' + v.cls.toFixed(3),
            'DCL   ' + fmtMs(v.dcl) + '      INP   ' + (v.inp != null ? fmtMs(v.inp) : '—'),
            'transferred  ' +
              fmtKb(v.bytes) +
              '   ·   JS  ' +
              fmtKb(v.jsBytes) +
              '   ·   ' +
              v.reqs +
              ' requests',
            '(measured in your browser — nothing sent anywhere)',
          ],
        };
      },
      where: async () => {
        const w = await collectWhere();
        return { lines: w.map((r) => (r[0] + ':').padEnd(16) + ' ' + r[1]) };
      },
      patent: () => {
        const ok = (s) => '<span class="terminal-text" style="color:#4ade80">' + esc(s) + '</span>';
        const dim = (s) => '<span class="terminal-text is-muted">' + esc(s) + '</span>';
        const acc = (s) =>
          '<span class="terminal-text" style="color:var(--accent)">' + esc(s) + '</span>';
        return {
          rich: [
            dim('$ patent "a rust crate that ranks dependency alternatives"'),
            '',
            dim('⠋ fanning out across registries…'),
            ok('  ✓ crates.io        4 candidates'),
            ok('  ✓ npm              2 candidates'),
            ok('  ✓ PyPI             1 candidate'),
            ok('  ✓ GitHub           7 candidates'),
            ok('  ✓ Go · Maven · NuGet · RubyGems · Docker Hub …'),
            '',
            dim('▍ ranking 16 matches with local embeddings (fastembed)…'),
            dim('▍ scoring with reciprocal rank fusion (k=60)…'),
            '',
            acc('verdict: 2 strong overlaps found in the sources checked.'),
            '<span class="terminal-text term-pre">' +
              esc('  • cargo-deny      partial — license/advisory focus, not ranking') +
              '</span>',
            '<span class="terminal-text term-pre">' +
              esc('  • similar (×1)    closest match; see report') +
              '</span>',
            '',
            dim('note: integrity-scoped — reports only what was found where it looked.'),
            dim('      never asserts absence.'),
            '',
            ok('✓ done in 1.84s · JSON written to ./patent.json'),
          ],
        };
      },
      offline: async (args) => {
        if (!('serviceWorker' in navigator))
          return { lines: ['service workers not supported in this browser'], cls: 'err' };
        const sub = (args[0] || '').toLowerCase();
        if (sub === 'enable') {
          try {
            await navigator.serviceWorker.register('/sw.js', { scope: '/' });
            await navigator.serviceWorker.ready;
            return {
              lines: [
                '● service worker registered — offline-ready',
                'kill your network and reload to test',
              ],
            };
          } catch (e) {
            return { lines: ['failed: ' + e.message], cls: 'err' };
          }
        }
        if (sub === 'disable') {
          const reg = await navigator.serviceWorker.getRegistration('/');
          if (reg) {
            reg.active?.postMessage({ type: 'purge' });
            await reg.unregister();
          }
          return { lines: ['○ service worker unregistered & cache cleared'] };
        }
        const reg = await navigator.serviceWorker.getRegistration('/');
        const active = reg && reg.active;
        return {
          lines: [
            active ? '● offline-ready (service worker active)' : '○ not enabled',
            '',
            'usage:',
            '  offline enable    register service worker for offline access',
            '  offline disable   unregister & clear cache',
          ],
        };
      },
      fortune: () => ({ html: tx(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]) }),
      clear: () => ({ action: 'clear' }),
    };
  };

  const activate = () => {
    const cursorEl = inputLine.querySelector('.terminal-cursor');
    if (cursorEl) cursorEl.remove();

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'term-input';
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('placeholder', 'type help');
    input.setAttribute('aria-label', 'Terminal command input');
    inputLine.appendChild(input);

    const addRow = (html, cls?) => {
      const row = document.createElement('div');
      row.className = 'terminal-line term-visible' + (cls ? ' ' + cls : '');
      row.innerHTML = html;
      termBody.insertBefore(row, inputLine);
    };
    const render = (res) => {
      if (!res) return;
      if (res.rich) {
        res.rich.forEach((h) => addRow(h));
        return;
      }
      if (res.html) {
        addRow(res.html);
        return;
      }
      if (res.lines) {
        const c = res.cls === 'err' ? ' is-err' : res.cls === 'muted' ? ' is-muted' : '';
        res.lines.forEach((l) =>
          addRow('<span class="terminal-text term-pre' + c + '">' + esc(l) + '</span>'),
        );
      }
    };
    const clearScreen = () =>
      Array.from(termBody.children).forEach((el) => {
        if (el !== inputLine) el.remove();
      });
    const tokenize = (stage) => {
      const s = stage.trim();
      const sp = s.indexOf(' ');
      const cmd = (sp === -1 ? s : s.slice(0, sp)).toLowerCase();
      const raw = sp === -1 ? '' : s.slice(sp + 1);
      const args = raw.length ? raw.split(/\s+/) : [];
      return { cmd, args, raw };
    };

    const exec = async (rawInput) => {
      let line = rawInput.trim();
      if (!line) return;
      if (line === '!!') line = hist[hist.length - 1] || '';
      else if (/^!\d+$/.test(line)) line = hist[parseInt(line.slice(1), 10) - 1] || '';

      const echoLine = document.createElement('div');
      echoLine.className = 'terminal-line term-visible';
      echoLine.innerHTML =
        '<span class="terminal-prompt">→</span> <span class="terminal-cmd">' +
        esc(line || rawInput.trim()) +
        '</span>';
      termBody.insertBefore(echoLine, inputLine);

      if (!line) {
        render({ lines: ['no such history entry'], cls: 'muted' });
        termBody.scrollTop = termBody.scrollHeight;
        return;
      }

      if (hist[hist.length - 1] !== line) {
        hist.push(line);
        try {
          localStorage.setItem('term-history', JSON.stringify(hist.slice(-100)));
        } catch {}
      }
      histIdx = hist.length;

      const stages = line
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean);
      const commands = getCommands();
      let stdin = null,
        last = null;
      for (const stage of stages) {
        const { cmd, args, raw } = tokenize(stage);
        const fn = commands[cmd];
        if (!fn) {
          render({ lines: ['command not found: ' + cmd + ". type 'help'"], cls: 'err' });
          termBody.scrollTop = termBody.scrollHeight;
          return;
        }
        try {
          last = (await fn(args, raw, stdin, stages.length === 1)) || {};
        } catch (err) {
          render({ lines: [cmd + ': ' + err.message], cls: 'err' });
          termBody.scrollTop = termBody.scrollHeight;
          return;
        }
        if (last.action === 'clear') {
          clearScreen();
          return;
        }
        stdin = last.lines ? last.lines.slice() : stdin;
      }
      if (last && !last.silent) render(last);
      termBody.scrollTop = termBody.scrollHeight;
    };

    input.addEventListener('keydown', (e) => {
      sfx.tap();
      if (e.key === 'Enter') {
        exec(input.value);
        input.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (histIdx > 0) {
          histIdx--;
          input.value = hist[histIdx] || '';
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (histIdx < hist.length) {
          histIdx++;
          input.value = histIdx < hist.length ? hist[histIdx] || '' : '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const cur = input.value.trim();
        if (cur && !cur.includes(' ')) {
          const names = Object.keys(getCommands()).filter((c) => c.startsWith(cur.toLowerCase()));
          if (names.length === 1) input.value = names[0] + ' ';
          else if (names.length > 1) render({ lines: [names.join('   ')], cls: 'muted' });
        }
      }
    });

    const termWindow = termBody.closest('.terminal-window');
    termWindow?.addEventListener('click', (e) => {
      if (e.target.tagName !== 'A') input.focus();
    });
  };

  if (prefersReducedMotion) {
    activate();
  } else {
    window.addEventListener('term-ready', activate, { once: true });
  }
};
