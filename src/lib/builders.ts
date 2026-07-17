// Single source of truth for section markup.
//
// Every content section (experience, projects, skills, teaching, education,
// recommendations, connect) is rendered from these builders in TWO places:
//   1. Build time — src/pages/index.astro frontmatter, via <Fragment set:html={...} />
//      (the static, SEO / no-JS HTML).
//   2. Runtime — the inline <script> in index.astro, on every language switch,
//      via section.innerHTML = build*(data).
//
// Before this module the two render paths were hand-duplicated (~400 lines that
// could silently drift). Keeping them here guarantees they stay identical: add a
// field to profile.ts once and both paths pick it up.
//
// These functions are pure string builders — no DOM, no browser APIs — so they
// run unchanged in Node (build) and the browser (runtime).

import type { I18nProfile } from '../data/profile-i18n';
import type { Project } from '../data/profile';

export const skillLogoMap: Record<string, string> = {
  Rust: '/logos/si-rust.svg',
  Python: '/logos/si-python.svg',
  Go: '/logos/si-go.svg',
  C: '/logos/si-c.svg',
  Axum: '/logos/si-rust.svg',
  'Actix-web': '/logos/si-rust.svg',
  Tokio: '/logos/si-rust.svg',
  FastAPI: '/logos/si-fastapi.svg',
  Flask: '/logos/si-flask.svg',
  LangGraph: '/logos/si-langchain.svg',
  LangChain: '/logos/si-langchain.svg',
  LangSmith: '/logos/si-langchain.svg',
  Ollama: '/logos/si-ollama.svg',
  fastembed: '/logos/si-fastembed.svg',
  FAISS: '/logos/faiss.svg',
  'NVIDIA OpenShell': '/logos/si-nvidia.svg',
  OpenAI: '/logos/openai.svg',
  'RESTful APIs': '/logos/si-swagger.svg',
  'REST APIs': '/logos/si-swagger.svg',
  GraphQL: '/logos/si-graphql.svg',
  WebSockets: '/logos/si-socketdotio.svg',
  WebRTC: '/logos/si-webrtc.svg',
  gRPC: '/logos/grpc.svg',
  'Apache Kafka': '/logos/si-apachekafka.svg',
  RabbitMQ: '/logos/si-rabbitmq.svg',
  PostgreSQL: '/logos/si-postgresql.svg',
  pgvector: '/logos/si-postgresql.svg',
  MySQL: '/logos/si-mysql.svg',
  SQLite: '/logos/si-sqlite.svg',
  MongoDB: '/logos/si-mongodb.svg',
  Redis: '/logos/si-redis.svg',
  Linux: '/logos/si-linux.svg',
  Supabase: '/logos/si-supabase.svg',
  Docker: '/logos/si-docker.svg',
  Kubernetes: '/logos/si-kubernetes.svg',
  'GitHub Actions': '/logos/si-githubactions.svg',
  'GitLab CI/CD': '/logos/si-gitlab.svg',
  AWS: '/logos/aws.svg',
  'AWS EC2': '/logos/aws.svg',
  Pytest: '/logos/si-pytest.svg',
  ratatui: '/logos/si-rust.svg',
  rstest: '/logos/si-rust.svg',
  Selenium: '/logos/si-selenium.svg',
  Postman: '/logos/si-postman.svg',
  Java: '/logos/si-openjdk.svg',
  'Spring Boot': '/logos/si-springboot.svg',
  'Spring Security': '/logos/si-springsecurity.svg',
  JWT: '/logos/si-jsonwebtokens.svg',
  Liquibase: '/logos/si-liquibase.svg',
  TypeScript: '/logos/si-typescript.svg',
  CSS: '/logos/si-css.svg',
  Astro: '/logos/si-astro.svg',
  Protobuf: '/logos/si-google.svg',
  UDP: '/logos/si-wireshark.svg',
  TCP: '/logos/si-wireshark.svg',
  Scala: '/logos/si-scala.svg',
  Git: '/logos/si-git.svg',
  Django: '/logos/si-django.svg',
  Trello: '/logos/si-trello.svg',
};

// All profile data is interpolated into HTML strings — escape it uniformly.
// Safe for both element content and double-quoted attribute values.
export const esc = (s: string): string =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const stripParens = (item: string): string => item.replace(/\s*\([^)]*\)/g, '').trim();

export const getLogoUrl = (skill: string): string | null =>
  skillLogoMap[stripParens(skill)] || null;

export const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('');

export const hasSim = (name: string): boolean =>
  name.includes('RAFT') ||
  name.includes('Raft') ||
  name.includes('Hash Table') ||
  name.includes('Distributed') ||
  name.includes('Kademlia') ||
  name.includes('Redis');

export const isRaft = (name: string): boolean => name.includes('RAFT') || name.includes('Raft');

export const isKademlia = (name: string): boolean =>
  name.includes('Hash Table') || name.includes('Distributed') || name.includes('Kademlia');

export const isRedis = (name: string): boolean => name.includes('Redis');

const isCurrent = (period: string): boolean => /Present|Настоящее время|indiyə kimi/.test(period);

const stripImpactPrefix = (s: string): string => s.replace(/^(?:Impact:\s*)+/i, '');

const pill = (item: string): string => {
  const name = esc(stripParens(item));
  const logo = getLogoUrl(item);
  return logo
    ? `<span class="skill-badge-local"><img src="${logo}" alt="" aria-hidden="true" loading="lazy" />${name}</span>`
    : `<span class="feat-pill">${name}</span>`;
};

type SimLegends = { raft: string; kademlia: string; redis: string };

const DEFAULT_SIM_LEGENDS: SimLegends = {
  raft: 'Leader replicates log entries via AppendEntries RPC',
  kademlia: 'Iterative FIND_NODE lookup converges via XOR distance',
  redis: 'Two-layer TTL-aware cache with garbage collection',
};

export const buildProjectSim = (p: Project, legends: SimLegends = DEFAULT_SIM_LEGENDS): string => {
  if (isRaft(p.name)) {
    return `
          <div class="sim-visual" data-sim="raft">
            <svg width="320" height="130" viewBox="0 0 320 130">
              <defs>
                <filter id="raft-glow-js" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <line class="sim-heartbeat" x1="78" y1="65" x2="182" y2="28"/>
              <line class="sim-heartbeat" x1="78" y1="65" x2="182" y2="65"/>
              <line class="sim-heartbeat" x1="78" y1="65" x2="182" y2="102"/>
              <circle class="sim-leader-node" cx="55" cy="65" r="22" filter="url(#raft-glow-js)"/>
              <text class="sim-label mono" x="55" y="69">L</text>
              <text class="sim-desc mono" x="55" y="98">leader</text>
              <circle class="sim-node" cx="198" cy="28" r="14"/>
              <text class="sim-label mono" x="198" y="32">F</text>
              <circle class="sim-node" cx="198" cy="65" r="14"/>
              <text class="sim-label mono" x="198" y="69">F</text>
              <circle class="sim-node" cx="198" cy="102" r="14"/>
              <text class="sim-label mono" x="198" y="106">F</text>
              <rect class="sim-log" x="228" y="19" width="24" height="7" rx="1.5"/>
              <rect class="sim-log" x="228" y="29" width="24" height="7" rx="1.5"/>
              <rect class="sim-log-new" x="228" y="39" width="16" height="7" rx="1.5">
                <animate attributeName="opacity" values="0;0.9;0.9;0" dur="2.4s" repeatCount="indefinite"/>
              </rect>
              <rect class="sim-log" x="228" y="56" width="24" height="7" rx="1.5"/>
              <rect class="sim-log" x="228" y="66" width="24" height="7" rx="1.5"/>
              <rect class="sim-log-new" x="228" y="76" width="16" height="7" rx="1.5">
                <animate attributeName="opacity" values="0;0.9;0.9;0" dur="2.4s" begin="0.3s" repeatCount="indefinite"/>
              </rect>
              <rect class="sim-log" x="228" y="93" width="24" height="7" rx="1.5"/>
              <rect class="sim-log" x="228" y="103" width="24" height="7" rx="1.5"/>
              <rect class="sim-log-new" x="228" y="113" width="16" height="7" rx="1.5">
                <animate attributeName="opacity" values="0;0.9;0.9;0" dur="2.4s" begin="0.6s" repeatCount="indefinite"/>
              </rect>
              <circle class="sim-pulse" r="3.5">
                <animate attributeName="cx" values="78;198" dur="1.6s" repeatCount="indefinite"/>
                <animate attributeName="cy" values="65;28" dur="1.6s" repeatCount="indefinite"/>
              </circle>
              <circle class="sim-pulse" r="3.5">
                <animate attributeName="cx" values="78;198" dur="1.6s" begin="0.2s" repeatCount="indefinite"/>
                <animate attributeName="cy" values="65;65" dur="1.6s" begin="0.2s" repeatCount="indefinite"/>
              </circle>
              <circle class="sim-pulse" r="3.5">
                <animate attributeName="cx" values="78;198" dur="1.6s" begin="0.4s" repeatCount="indefinite"/>
                <animate attributeName="cy" values="65;102" dur="1.6s" begin="0.4s" repeatCount="indefinite"/>
              </circle>
              <text class="sim-desc mono" x="290" y="68">term 3</text>
            </svg>
            <div class="sim-legend">${esc(legends.raft)}</div>
          </div>
        `;
  }
  if (isKademlia(p.name)) {
    return `
          <div class="sim-visual" data-sim="kademlia">
            <svg width="320" height="130" viewBox="0 0 320 130">
              <defs>
                <filter id="kad-glow-js" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <line class="sim-link sim-ghost" x1="42" y1="60" x2="72" y2="98"/>
              <line class="sim-link sim-ghost" x1="122" y1="46" x2="148" y2="98"/>
              <line class="sim-link sim-ghost" x1="206" y1="56" x2="228" y2="98"/>
              <circle class="sim-node sim-ghost" cx="78" cy="104" r="8"/>
              <circle class="sim-node sim-ghost" cx="155" cy="104" r="8"/>
              <circle class="sim-node sim-ghost" cx="235" cy="104" r="8"/>
              <line class="sim-heartbeat" x1="48" y1="50" x2="108" y2="36"/>
              <line class="sim-heartbeat" x1="132" y1="36" x2="192" y2="50"/>
              <line class="sim-heartbeat" x1="218" y1="50" x2="272" y2="36"/>
              <circle class="sim-node" cx="35" cy="50" r="14"/>
              <text class="sim-label mono" x="35" y="54">S</text>
              <text class="sim-desc mono" x="35" y="74">source</text>
              <circle class="sim-node" cx="120" cy="36" r="14"/>
              <text class="sim-label mono" x="120" y="40">N</text>
              <text class="sim-desc mono" x="120" y="60">d = 8</text>
              <circle class="sim-node" cx="205" cy="50" r="14"/>
              <text class="sim-label mono" x="205" y="54">N</text>
              <text class="sim-desc mono" x="205" y="74">d = 3</text>
              <circle class="sim-target-node" cx="285" cy="36" r="16" filter="url(#kad-glow-js)"/>
              <text class="sim-label mono" x="285" y="40">T</text>
              <text class="sim-desc mono" x="285" y="60">d = 0</text>
              <circle class="sim-pulse" r="4">
                <animate attributeName="cx" values="48;120;205;285" dur="3s" keyTimes="0;0.3;0.6;1" repeatCount="indefinite"/>
                <animate attributeName="cy" values="50;36;50;36" dur="3s" keyTimes="0;0.3;0.6;1" repeatCount="indefinite"/>
              </circle>
            </svg>
            <div class="sim-legend">${esc(legends.kademlia)}</div>
          </div>
        `;
  }
  if (isRedis(p.name)) {
    return `
          <div class="sim-visual" data-sim="redis">
            <svg width="320" height="140" viewBox="0 0 320 140">
              <rect class="sim-layer-bg" x="8" y="10" width="135" height="120" rx="8"/>
              <text class="sim-layer-title mono" x="75" y="26">KEY → ID</text>
              <rect class="sim-entry" x="20" y="36" width="110" height="18" rx="3"/>
              <text class="sim-entry-text mono" x="75" y="47">user:1 → id:7</text>
              <rect class="sim-entry" x="20" y="60" width="110" height="18" rx="3"/>
              <text class="sim-entry-text mono" x="75" y="71">sess:3 → id:12</text>
              <rect class="sim-entry" x="20" y="84" width="110" height="18" rx="3" style="opacity:0.4"/>
              <text class="sim-entry-text mono" x="75" y="95" style="opacity:0.4">tok:5 → id:9</text>
              <rect class="sim-ttl-track" x="20" y="106" width="110" height="3" rx="1.5"/>
              <rect class="sim-ttl-fill" x="20" y="106" width="110" height="3" rx="1.5">
                <animate attributeName="width" values="110;0" dur="3.5s" repeatCount="indefinite"/>
              </rect>
              <text class="sim-desc mono" x="75" y="120">ttl</text>
              <line class="sim-link" x1="148" y1="60" x2="172" y2="60" style="stroke-width:1.5"/>
              <polygon class="sim-arrow" points="172,55 182,60 172,65"/>
              <rect class="sim-layer-bg" x="178" y="10" width="135" height="120" rx="8"/>
              <text class="sim-layer-title mono" x="245" y="26">ID → VALUE</text>
              <rect class="sim-entry" x="190" y="36" width="110" height="18" rx="3"/>
              <text class="sim-entry-text mono" x="245" y="47">id:7 → val</text>
              <rect class="sim-entry" x="190" y="60" width="110" height="18" rx="3"/>
              <text class="sim-entry-text mono" x="245" y="71">id:12 → val</text>
              <rect class="sim-entry" x="190" y="84" width="110" height="18" rx="3" style="opacity:0.4"/>
              <text class="sim-entry-text mono" x="245" y="95" style="opacity:0.4">id:9 → expired</text>
              <line class="sim-link" x1="190" y1="100" x2="300" y2="100" style="stroke-dasharray:3 3;stroke-width:1">
                <animate attributeName="y1" values="94;104;94" dur="2.5s" repeatCount="indefinite"/>
                <animate attributeName="y2" values="94;104;94" dur="2.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0;0.6;0" dur="2.5s" repeatCount="indefinite"/>
              </line>
              <text class="sim-desc mono" x="245" y="120">gc sweep</text>
            </svg>
            <div class="sim-legend">${esc(legends.redis)}</div>
          </div>
        `;
  }
  return '';
};

export const buildExperience = (data: I18nProfile): string => {
  return `
        <div class="sec-eyebrow">${esc(data.labels.eyebrows.experience)}</div>
        <h2 class="sec-title">${esc(data.labels.headings.experience)}</h2>
        <div class="scroll-tl">
        ${data.experience
          .map(
            (exp) => `
              <div class="scroll-tl-item${isCurrent(exp.period) ? ' now' : ''}">
                <div class="scroll-tl-period">${esc(exp.period)}</div>
                <div class="scroll-tl-role">${esc(exp.role)}</div>
                <div class="scroll-tl-org">${esc(exp.org)}</div>
                <div class="scroll-tl-loc">${esc(exp.location)}</div>
                ${exp.bullets.length ? `<ul class="scroll-tl-bullets">${exp.bullets.map((b, i) => `<li style="transition-delay:${i * 80 + 150}ms">${esc(b)}</li>`).join('')}</ul>` : ''}
              </div>
            `,
          )
          .join('')}
        </div>
      `;
};

export const buildProjects = (data: I18nProfile): string => {
  const buildCard = (p: Project): string => {
    const pills = p.tech.map(pill).join('');
    const impact = p.impact ? `<p class="proj-impact">${esc(stripImpactPrefix(p.impact))}</p>` : '';
    const badges = (p.badges || [])
      .map(
        (b) =>
          `<span class="badge-stat proj-badge-live" data-badge-api="${esc(b.api || '')}"><a class="feat-gh" href="${esc(b.link || '#')}" target="_blank" rel="noopener"><span class="badge-count">—</span> ${esc(b.pillLabel)}</a> ${esc(b.platform)}</span>`,
      )
      .join(' ');
    const badgeBullet = badges ? `<li class="badge-bullet">${badges}</li>` : '';
    const bullets =
      p.bullets.length || badgeBullet
        ? `<ul class="feat-bullets">${badgeBullet}${p.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`
        : '';
    const gh = p.links?.github
      ? `<a class="feat-gh" href="${p.links.github}" target="_blank" rel="noopener"><svg class="gh-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>GitHub</a>`
      : '';
    const crates = p.links?.crates
      ? `<a class="feat-gh" href="${p.links.crates}" target="_blank" rel="noopener"><svg class="gh-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .5 1 4v8l7 3.5L15 12V4L8 .5zm0 1.62 4.9 2.45L8 6.95 3.1 4.57 8 2.12zM2.5 5.6l4.8 2.4v5.9L2.5 11.5V5.6zm6.2 8.3V8l4.8-2.4v5.9l-4.8 2.4z"/></svg>crates.io</a>`
      : '';
    const docs = p.links?.docs
      ? `<a class="feat-gh" href="${p.links.docs}" target="_blank" rel="noopener"><svg class="gh-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M3.5 1A1.5 1.5 0 0 0 2 2.5v11A1.5 1.5 0 0 0 3.5 15H13a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3.5zM3 2.5a.5.5 0 0 1 .5-.5H13v9H3.5a1.5 1.5 0 0 0-.5.085V2.5zM3.5 12H13v2H3.5a.5.5 0 0 1 0-1zM5 4h6v1H5V4zm0 2.5h6v1H5v-1z"/></svg>docs.rs</a>`
      : '';
    const sim = hasSim(p.name);
    const isWide = p.name.startsWith('patent');
    const simLabel = p.name.split('—')[0].trim();
    const simBtn = sim
      ? `<button class="sim-toggle" type="button" aria-label="${esc(data.labels.simulate)} — ${esc(simLabel)}"><svg class="play-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5a.5.5 0 0 1 .77-.42l8 5a.5.5 0 0 1 0 .84l-8 5A.5.5 0 0 1 4 12.5v-10z"/></svg>${esc(data.labels.simulate)}</button>`
      : '';
    const simSvg = sim ? buildProjectSim(p, data.labels.simLegends) : '';
    return `<div class="proj-card${sim ? ' has-sim' : ''}${isWide ? ' proj-card-wide' : ''}" role="button" tabindex="0" data-project="${esc(p.name)}">
          <div class="proj-card-head">
            <h3 class="proj-name">${esc(p.name)}</h3>
            <div class="proj-card-actions">
              ${gh}${crates}${docs}${simBtn}
            </div>
          </div>
          <div class="proj-card-text">
            <div class="feat-pills">${pills}</div>
            ${impact}${bullets}
          </div>
          ${simSvg}
        </div>`;
  };
  return `
        <div class="sec-eyebrow">${esc(data.labels.eyebrows.projects)}</div>
        <h2 class="sec-title">${esc(data.labels.headings.projects)}</h2>
        <div class="proj-grid">
          ${data.projects.map((p) => buildCard(p)).join('')}
        </div>
      `;
};

export const buildTeaching = (data: I18nProfile): string => {
  return `
        <div class="sec-eyebrow">${esc(data.labels.eyebrows.teaching)}</div>
        <h2 class="sec-title">${esc(data.labels.headings.teaching)}</h2>
        <div class="proj-grid">
          ${data.teaching
            .map((t) => {
              const all = t.skills.split('·').map((s) => s.trim());
              const tools = all.filter((s) => getLogoUrl(s));
              const topics = all.filter((s) => !getLogoUrl(s));
              const renderBadge = (skill: string) => {
                const logo = getLogoUrl(skill);
                return `<span class="skill-badge-local"><img src="${logo}" alt="" aria-hidden="true" loading="lazy" />${esc(skill)}</span>`;
              };
              return `
            <div class="proj-card">
              <div class="proj-card-head">
                <h3 class="proj-name">${esc(t.title)}</h3>
              </div>
              <div class="proj-card-text">
                <div class="teaching-skills">
                  ${
                    tools.length > 0
                      ? `
                  <div class="teaching-skill-row">
                    <span class="teaching-skill-label">${esc(data.labels.teachingRows.tools)}</span>
                    <div class="feat-pills">${tools.map(renderBadge).join('')}</div>
                  </div>`
                      : ''
                  }
                  ${
                    topics.length > 0
                      ? `
                  <div class="teaching-skill-row">
                    <span class="teaching-skill-label">${esc(data.labels.teachingRows.topics)}</span>
                    <div class="feat-pills">${topics.map((s) => `<span class="feat-pill">${esc(s)}</span>`).join('')}</div>
                  </div>`
                      : ''
                  }
                </div>
              </div>
            </div>`;
            })
            .join('')}
        </div>
      `;
};

export const buildEducation = (data: I18nProfile): string => {
  return `
        <div class="sec-eyebrow">${esc(data.labels.eyebrows.education)}</div>
        <h2 class="sec-title">${esc(data.labels.headings.education)}</h2>
        <div class="proj-grid">
          <div class="proj-card proj-card-wide">
            <div class="proj-card-head">
              <h3 class="proj-name">${esc(data.education.title)}</h3>
            </div>
            <div class="proj-card-text">
              <div class="tl-period">${esc(data.education.meta)}</div>
              <ul class="feat-bullets">
                ${data.education.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      `;
};

export const buildSkills = (data: I18nProfile): string => {
  return `
        <div class="sec-eyebrow">${esc(data.labels.eyebrows.skills)}</div>
        <h2 class="sec-title">${esc(data.labels.headings.skills)}</h2>
        <div class="proj-grid">
          ${data.skills
            .map(
              (s) => `
            <div class="proj-card skill-card">
              <div class="proj-card-head">
                <h3 class="proj-name">${esc(data.labels.skillCategories[s.category] || s.category)}</h3>
              </div>
              <div class="proj-card-text">
                ${s.groups
                  .map(
                    (g) => `
                  <div class="feat-pills"${s.groups.length > 1 ? ' style="margin-bottom: 0.3rem;"' : ''}>
                    ${g.items.map(pill).join('')}
                  </div>
                `,
                  )
                  .join('')}
              </div>
            </div>
          `,
            )
            .join('')}
        </div>
      `;
};

export const buildRecommendations = (data: I18nProfile): string => {
  return `
        <div class="sec-eyebrow">${esc(data.labels.eyebrows.recommendations)}</div>
        <h2 class="sec-title">${esc(data.labels.headings.recommendations)}</h2>
        <div class="testi-wrap" role="group" aria-roledescription="carousel" aria-label="Student recommendations">
          <div class="testi-scroll" id="testi-scroll" aria-live="off">
            ${data.testimonials
              .map((t, i) => {
                const initials = getInitials(t.name);
                const role = t.headTA
                  ? data.labels.headTARole || 'Head Teaching Assistant'
                  : data.labels.taRole || 'Teaching Assistant';
                return `
                <div class="testi-card" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${data.testimonials.length}">
                  <span class="testi-mark">&ldquo;</span>
                  <p class="testi-quote">${esc(t.quote)}</p>
                  <div class="testi-author">
                    <div class="testi-avatar">${esc(initials)}</div>
                    <div>
                      <div class="testi-name">${esc(t.name)}${t.linkedin ? `<a class="testi-linkedin" href="${esc(t.linkedin)}" target="_blank" rel="noopener" aria-label="${esc(t.name)} on LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>` : ''}</div>
                      <div class="testi-role">${esc(t.title)}</div>
                      <div class="testi-course">${esc(t.course)} &mdash; ${esc(role)}</div>
                    </div>
                  </div>
                </div>`;
              })
              .join('')}
          </div>
          <div class="carousel-nav">
            <button class="car-btn" id="prev-btn" type="button" aria-label="Previous">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 3L6 8l4 5"/></svg>
            </button>
            <div class="car-dots" id="car-dots"></div>
            <button class="car-btn" id="next-btn" type="button" aria-label="Next">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 3l4 5-4 5"/></svg>
            </button>
          </div>
        </div>
      `;
};

export const buildConnect = (data: I18nProfile): string => {
  return `
        <p class="connect-tagline">${esc(data.labels.connectTagline)}</p>
        <div class="connect-links">
          <a class="cta-btn" href="${data.links.linkedin}" target="_blank" rel="noopener"><svg class="cta-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>LinkedIn</a>
          <a class="cta-btn" href="${data.links.github}" target="_blank" rel="noopener"><svg class="cta-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>GitHub</a>
          <a class="cta-btn" href="mailto:${esc(data.email)}"><svg class="cta-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>${esc(data.labels.links.email)}</a>
        </div>
        <div class="mini-map" aria-label="${esc(data.labels.connectLocation)}">
          <div class="mini-map-container">
            <img class="mini-map-img mini-map-dark" src="/map-baku-dark.png" alt="${esc(data.labels.connectLocation)}" width="500" height="220" loading="lazy"/>
            <img class="mini-map-img mini-map-light" src="/map-baku-light.png" alt="${esc(data.labels.connectLocation)}" width="500" height="220" loading="lazy"/>
            <div class="mini-map-dot" aria-hidden="true"></div>
            <div class="mini-map-label">${esc(data.labels.connectLocation)} <span id="local-time"></span></div>
          </div>
        </div>
      `;
};
