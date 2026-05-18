const G="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%",de=(t,e,s=550)=>{const o=e.length,n=Math.round(s/35);let l=0;const r=setInterval(()=>{t.textContent=Array.from(e).map((a,d)=>a===" "?" ":l>=Math.floor(d/o*n)+2?a:G[Math.floor(Math.random()*G.length)]).join(""),++l>n&&(t.textContent=e,clearInterval(r))},35)};let V=!0;const ue=(t,e)=>{V?(V=!1,t.textContent=e,setTimeout(()=>{t.style.animation="none",t.offsetWidth,t.style.animation="name-shimmer 6s linear forwards, weight-in 800ms cubic-bezier(0.16, 1, 0.3, 1) both"},1050)):de(t,e)},W=document.getElementById("i18n-data"),C=W?JSON.parse(W.textContent||"{}"):{},me={en:"English",ru:"Русский",az:"Azərbaycanca",es:"Español"},Z=()=>{const t=window.location.hash.replace("#","");if(!t)return;const e=document.getElementById(t);e&&e.scrollIntoView({behavior:"smooth",block:"start"})};window.addEventListener("hashchange",Z);window.addEventListener("load",Z);const j=Array.from(document.querySelectorAll("section[id]")),z=Array.from(document.querySelectorAll(".side-nav a")),K=Array.from(document.querySelectorAll(".dock-item")),R=document.querySelector(".dock-track"),D=document.querySelector(".dock-indicator"),he=t=>{const e=K.find(o=>o.getAttribute("href")===`#${t}`);if(K.forEach(o=>o.classList.remove("active")),!e||!R||!D)return;e.classList.add("active"),D.style.width=e.offsetWidth+"px",D.style.left=e.offsetLeft+"px";const s=e.offsetLeft+e.offsetWidth/2;R.scrollTo({left:s-R.offsetWidth/2,behavior:"smooth"})},Y=()=>{const t=window.scrollY+120;let e=j[0];j.forEach(l=>{l.offsetTop<=t&&(e=l)}),window.scrollY+window.innerHeight>=document.body.scrollHeight-4&&(e=j[j.length-1]),z.forEach(l=>l.classList.remove("active"));const s=z.find(l=>l.getAttribute("href")===`#${e.id}`);s?.classList.add("active");const o=document.querySelector(".nav-pill"),n=document.querySelector(".side-nav");if(o&&s&&n){const l=n.getBoundingClientRect(),r=s.getBoundingClientRect();o.style.top=r.top-l.top+(r.height-26)/2+"px",o.style.opacity="1"}he(e.id)},ee=()=>{const t=document.getElementById("scroll-progress");if(!t)return;const e=document.body.scrollHeight-window.innerHeight,s=e>0?window.scrollY/e*100:0;t.style.height=`${s}%`},te=()=>{const t=document.querySelector(".side-nav"),e=document.querySelector(".side-links");if(!t&&!e)return;const s=window.scrollY>40;t?.classList.toggle("blurred",s),e?.classList.toggle("blurred",s)},ge=(t,e=480)=>{const s=window.scrollY,o=t.getBoundingClientRect().top+window.scrollY-24,n=performance.now(),l=a=>1-Math.pow(1-a,4),r=a=>{const d=Math.min((a-n)/e,1);window.scrollTo(0,s+(o-s)*l(d)),d<1&&requestAnimationFrame(r)};requestAnimationFrame(r)};document.querySelectorAll(".side-nav a, .dock-item").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault();const s=t.getAttribute("href")?.replace("#","");if(!s)return;const o=document.getElementById(s);o&&(ge(o),history.pushState(null,"",`#${s}`))})});const P=document.querySelector("main > section:first-of-type"),se=()=>{if(!P)return;const t=window.scrollY,e=P.querySelector("h1"),s=P.querySelectorAll(".hero-tagline");e&&(e.style.transform=`translateY(${t*.12}px)`),s.forEach(o=>{o.style.transform=`translateY(${t*.08}px)`})};window.addEventListener("scroll",()=>{Y(),ee(),te(),se()});window.addEventListener("load",()=>{Y(),ee(),te(),se()});document.querySelectorAll(".simulate-btn").forEach(t=>{t.addEventListener("click",()=>{t.closest(".project-card")?.querySelector(".sim-visual")?.classList.toggle("active")})});const b=document.getElementById("lang-toggle"),v=document.getElementById("lang-menu"),X=document.getElementById("lang-current"),pe=t=>`
        <h2>${t.labels.headings.experience}</h2>
        ${t.experience.map(e=>`
              <div class="project-card">
                <h3 class="job-title">${e.role}</h3>
                <div class="experience-stack">
                  <span class="company-name">${e.org}</span>
                  <small class="exp-meta">${e.period}</small>
                  <small class="exp-meta">${e.location}</small>
                </div>
                <ul>
                  ${e.bullets.map(s=>`<li>${s}</li>`).join("")}
                </ul>
              </div>
            `).join("")}
      `,ye=t=>t.includes("RAFT")||t.includes("Raft")||t.includes("Hash Table")||t.includes("Distributed")||t.includes("Kademlia")||t.includes("Redis"),ve=t=>t.includes("RAFT")||t.includes("Raft"),xe=t=>t.includes("Hash Table")||t.includes("Distributed")||t.includes("Kademlia"),fe=t=>t.includes("Redis"),be=t=>{const e=[];return t.links?.github&&e.push(`<a class="project-link" href="${t.links.github}" target="_blank" rel="noopener">${E.labels.links.github}</a>`),ye(t.name)&&e.push('<button class="simulate-btn" type="button">Simulate</button>'),e.join("")},ke=t=>ve(t.name)?`
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
            <div class="sim-legend">Leader replicates log entries via AppendEntries RPC</div>
          </div>
        `:xe(t.name)?`
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
            <div class="sim-legend">Iterative FIND_NODE lookup converges via XOR distance</div>
          </div>
        `:fe(t.name)?`
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
            <div class="sim-legend">Two-layer TTL-aware cache with garbage collection</div>
          </div>
        `:"";let E=C.en;const we=t=>(E=t,`
        <h2>${t.labels.headings.projects}</h2>
        ${t.projects.map(e=>`
              <div class="project-card">
                <div class="project-header">
                  <div>
                    <h3>${e.name}</h3>
                    <div class="project-tech-pills">${e.tech.map(s=>`<span class="project-tech-pill">${s}</span>`).join("")}</div>
                  </div>
                  <div class="project-actions">
                    ${be(e)}
                  </div>
                </div>
                ${e.impact?`<div class="project-impact"><strong>Impact:</strong> ${e.impact.replace(/^(?:Impact:\s*)+/i,"")}</div>`:""}
                <ul class="project-bullets">
                  ${e.bullets.map(s=>`<li>${s}</li>`).join("")}
                </ul>
                ${ke(e)}
              </div>
            `).join("")}
      `),Le=t=>`
        <h2>${t.labels.headings.teaching}</h2>
        ${t.teaching.map(e=>`
              <div class="project-card">
                <h3>${e.title}</h3>
                <div class="skills-pills" style="margin-top:0.5rem">
                  ${e.skills.split("·").map(s=>`<span class="skill-pill">${s.trim()}</span>`).join("")}
                </div>
              </div>
            `).join("")}
      `,Ce=t=>`
        <h2>${t.labels.headings.education}</h2>
        <div class="meta-card">
          <h3>${t.education.title}</h3>
          <div class="tech-meta">${t.education.meta}</div>
          <ul>
            ${t.education.bullets.map(e=>`<li>${e}</li>`).join("")}
          </ul>
        </div>
      `,Ee={"Programming Languages":'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3.5L2 8l3 4.5M11 3.5L14 8l-3 4.5M9 2.5l-2 11"/></svg>',"Backend & Runtimes":'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="3.5" width="12" height="3" rx="1"/><rect x="2" y="9.5" width="12" height="3" rx="1"/><circle cx="4.5" cy="5" r="0.6" fill="currentColor" stroke="none"/><circle cx="4.5" cy="11" r="0.6" fill="currentColor" stroke="none"/></svg>',"AI, ML & Agentic Systems":'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="2.5"/><path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14"/><path d="M4.1 4.1l1.1 1.1M10.8 10.8l1.1 1.1M4.1 11.9l1.1-1.1M10.8 5.2l1.1-1.1"/></svg>',"Architecture & Concepts":'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="2"/><circle cx="2.5" cy="4" r="1.2"/><circle cx="13.5" cy="4" r="1.2"/><circle cx="2.5" cy="12" r="1.2"/><circle cx="13.5" cy="12" r="1.2"/><line x1="6.2" y1="6.8" x2="3.7" y2="5.2"/><line x1="9.8" y1="6.8" x2="12.3" y2="5.2"/><line x1="6.2" y1="9.2" x2="3.7" y2="10.8"/><line x1="9.8" y1="9.2" x2="12.3" y2="10.8"/></svg>',"Communication Protocols & APIs":'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 5.5h9M9 3.5l2 2-2 2"/><path d="M14 10.5H5M7 8.5l-2 2 2 2"/></svg>',"Messaging & Integration":'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="12" height="8" rx="1.5"/><path d="M2 7l6 4 6-4"/></svg>',"Databases & Persistence":'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><ellipse cx="8" cy="4" rx="5" ry="1.8"/><path d="M3 4v8c0 1 2.24 1.8 5 1.8s5-.8 5-1.8V4"/><path d="M3 8c0 1 2.24 1.8 5 1.8S13 9 13 8"/></svg>',"Cloud, Infrastructure & DevOps":'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4.5 11a3 3 0 01.4-5.9A3.5 3.5 0 0112.5 6.5a2.5 2.5 0 01-.5 4.5H4.5z"/></svg>',"Testing & Quality Assurance":'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="5.5"/><path d="M5.5 8l2 2 3-3"/></svg>',"Developer Tooling & Ecosystem":'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2a3 3 0 00-2.8 4L3 11.5a1.5 1.5 0 002 2L10.5 8A3 3 0 0011 2z"/><circle cx="11" cy="4" r="1" fill="currentColor" stroke="none"/></svg>'},Se=t=>{const e=Ee[t]||"";return e?`<span class="skill-icon">${e}</span>`:""},$e=t=>t.replace(/\s*\([^)]*\)/g,"").trim(),Ae=t=>`
        <h2>${t.labels.headings.skills}</h2>
        ${t.skills.map(e=>`
          <div class="meta-card">
            <div class="skill-category-header">
              ${Se(e.category)}
              <h3>${e.category}</h3>
            </div>
            ${e.groups.map(s=>`
              <div class="skill-group${s.tier?` tier-${s.tier}`:""}${s.label?"":" no-label"}">
                ${s.label?`<div class="skill-tier-label${s.tier?` tier-${s.tier}`:""}">${s.label}</div>`:""}
                <div class="skills-pills">
                  ${s.items.map(o=>`<span class="skill-pill">${$e(o)}</span>`).join("")}
                </div>
              </div>
            `).join("")}
          </div>
        `).join("")}
      `,Me=t=>`
        <h2>${t.labels.headings.reading}</h2>
        <p>${t.reading.description}</p>
        <div class="reading-inline">
          ${t.reading.items.map(e=>`
                <div class="reading-row">
                  <span class="author">${e.author}</span>
                  <span class="reading-quote">"${e.quote}"</span>
                </div>
              `).join("")}
        </div>
      `,Ie=t=>{const s=(t.labels.connectTemplate||"Reach me at {email}").replace("{email}",'<a href="mailto:riadmukh@gmail.com" target="_blank" rel="noopener">riadmukh@gmail.com</a>');return`
        <h2>${t.labels.headings.connect}</h2>
        <p class="connect-text">${s}</p>
        <div class="hero-cta">
          <a class="cta-btn" href="${t.links.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
          <a class="cta-btn" href="${t.links.github}" target="_blank" rel="noopener">GitHub</a>
          <a class="cta-btn" href="${t.links.resume}" target="_blank" rel="noopener" download>${t.labels.links.resume}</a>
        </div>
      `},Be=t=>{const e=document.querySelector(".intro-name");e&&(e.setAttribute("aria-label",t),e.innerHTML="",Array.from(t).forEach((s,o)=>{const n=document.createElement("span");n.textContent=s===" "?" ":s,n.style.animationDelay=`${(.03+o*.04).toFixed(2)}s`,e.appendChild(n)}))},ne=t=>{const e=C[t]||C.en;E=e,document.documentElement.lang=t,X&&(X.textContent=me[t]||"English");const s=document.querySelector("main section h1"),o=document.querySelector(".hero-links"),n=document.querySelector(".hero-cta .cta-btn"),l=document.querySelectorAll(".hero-tagline");if(s&&ue(s,e.hero.name),l.length&&(l[0].textContent=e.hero.tagline),o){const i=o.querySelectorAll("a");i[0]&&(i[0].textContent=e.labels.links.resume,i[0].setAttribute("href",e.links.resume)),i[1]&&(i[1].textContent=e.labels.links.linkedin,i[1].setAttribute("href",e.links.linkedin)),i[2]&&(i[2].textContent=e.labels.links.github,i[2].setAttribute("href",e.links.github))}n&&(n.setAttribute("href",e.links.resume),n.innerHTML=`<svg class="cta-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v10m0 0l-4-4m4 4l4-4M5 20h14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"></path></svg>${e.labels.links.resume}`);const r=document.querySelector(".intro-phrase");if(r){const i=r.querySelectorAll(".lead"),c=!!e.labels.introLead,x=!!e.labels.introTail;if(i.length===0&&(c||x)){if(c){const m=document.createElement("span");m.className="lead",m.textContent=e.labels.introLead,r.insertBefore(m,r.firstChild)}if(x){const m=document.createElement("span");m.className="lead",m.textContent=e.labels.introTail,r.appendChild(m)}}else if(i.length===1){if(c&&!x)r.insertBefore(i[0],r.querySelector(".intro-name")),i[0].textContent=e.labels.introLead;else if(!c&&x)r.appendChild(i[0]),i[0].textContent=e.labels.introTail;else if(c&&x){i[0].textContent=e.labels.introLead,r.insertBefore(i[0],r.querySelector(".intro-name"));const m=document.createElement("span");m.className="lead",m.textContent=e.labels.introTail,r.appendChild(m)}}else i.length>=2&&(c?(i[0].textContent=e.labels.introLead,i[0].style.display=""):i[0].style.display="none",x?(i[i.length-1].textContent=e.labels.introTail,i[i.length-1].style.display=""):i[i.length-1].style.display="none")}Be(e.hero.name);const a=document.querySelector(".side-links");if(a){const i=a.querySelectorAll("a");i[0]&&(i[0].textContent=e.labels.links.resume),i[1]&&(i[1].textContent=e.labels.links.linkedin),i[2]&&(i[2].textContent=e.labels.links.github)}const d=document.querySelectorAll(".side-nav a"),y=document.querySelectorAll(".dock-item"),u=[e.labels.nav.experience,e.labels.nav.projects,e.labels.nav.skills,e.labels.nav.teaching,e.labels.nav.education,e.labels.nav.reading,e.labels.nav.connect];d.forEach((i,c)=>{u[c]&&(i.textContent=u[c])}),y.forEach((i,c)=>{u[c]&&(i.textContent=u[c])});const g=document.getElementById("experience"),p=document.getElementById("projects"),$=document.getElementById("teaching"),A=document.getElementById("education"),M=document.getElementById("skills"),I=document.getElementById("reading"),B=document.getElementById("connect");g&&(g.innerHTML=pe(e)),p&&(p.innerHTML=we(e)),$&&($.innerHTML=Le(e)),A&&(A.innerHTML=Ce(e)),M&&(M.innerHTML=Ae(e)),I&&(I.innerHTML=Me(e)),B&&(B.innerHTML=Ie(e)),[g,p,$,A,M,I,B].forEach(i=>{if(!i?.classList.contains("section-revealed"))return;const c=i.querySelector("h2");c&&ce(c)}),g?.setAttribute("data-label",e.labels.headings.experience),p?.setAttribute("data-label",e.labels.headings.projects),$?.setAttribute("data-label",e.labels.headings.teaching),A?.setAttribute("data-label",e.labels.headings.education),M?.setAttribute("data-label",e.labels.headings.skills),I?.setAttribute("data-label",e.labels.headings.reading),B?.setAttribute("data-label",e.labels.headings.connect),document.querySelectorAll(".simulate-btn").forEach(i=>{i.addEventListener("click",()=>{i.closest(".project-card")?.querySelector(".sim-visual")?.classList.toggle("active")})}),Y()},q=document.querySelector(".lang-switcher");b?.addEventListener("click",()=>{const t=v?.classList.contains("open");v?.classList.toggle("open",!t),q?.classList.toggle("open",!t),b?.setAttribute("aria-expanded",String(!t))});v?.querySelectorAll("button").forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-lang")||"en",s=document.documentElement.lang||"en";if(e===s){v.classList.remove("open"),q?.classList.remove("open"),b?.setAttribute("aria-expanded","false");return}localStorage.setItem("portfolio-lang",e),v.classList.remove("open"),q?.classList.remove("open"),b?.setAttribute("aria-expanded","false"),document.body.classList.add("lang-switching"),setTimeout(()=>{ne(e),document.body.classList.remove("lang-switching")},200)})});document.addEventListener("click",t=>{if(!v||!b)return;const e=t.target;e instanceof Node&&(v.contains(e)||b.contains(e))||(v.classList.remove("open"),q?.classList.remove("open"),b.setAttribute("aria-expanded","false"))});const je=localStorage.getItem("portfolio-lang")||"en";ne(je);const _=document.getElementById("theme-toggle"),Q=_?.querySelector(".theme-icon"),ie=()=>{const t=document.documentElement.classList.contains("light");Q&&(Q.textContent=t?"🌙":"☀️"),_?.setAttribute("aria-label",t?"Switch to dark mode":"Switch to light mode")};_?.addEventListener("click",()=>{document.documentElement.classList.toggle("light");const t=document.documentElement.classList.contains("light");localStorage.setItem("portfolio-theme",t?"light":"dark"),ie()});ie();const le=document.querySelector(".resume-hover"),T=le?.querySelector("iframe");let U=!1;le?.addEventListener("mouseenter",()=>{!U&&T&&T.dataset.src&&(T.src=T.dataset.src,U=!0)});const Te=t=>{const e=document.getElementById("toast");e&&(e.textContent=t,e.classList.add("show"),clearTimeout(e._t),e._t=setTimeout(()=>e.classList.remove("show"),2e3))},O=document.getElementById("cmd-backdrop"),N=document.getElementById("cmd-palette"),H=document.getElementById("cmd-input"),k=document.getElementById("cmd-results");let S=!1,w=0,L=[];const qe={nav:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3 8h10M9 5l4 3-4 3"/></svg>',link:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-3M10 2h4v4M14 2L8 8"/></svg>',action:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="5.5"/><path d="M8 5.5V8l1.5 1.5"/></svg>'},Ne=()=>{const t=E?.labels?.nav||C.en.labels.nav,e=E?.links||C.en.links;return[{group:"Navigate",label:t.education,icon:"nav",action:()=>f("education")},{group:"Navigate",label:t.experience,icon:"nav",action:()=>f("experience")},{group:"Navigate",label:t.projects,icon:"nav",action:()=>f("projects")},{group:"Navigate",label:t.teaching,icon:"nav",action:()=>f("teaching")},{group:"Navigate",label:t.skills,icon:"nav",action:()=>f("skills")},{group:"Navigate",label:t.reading,icon:"nav",action:()=>f("reading")},{group:"Navigate",label:t.connect,icon:"nav",action:()=>f("connect")},{group:"Links",label:"Resume",icon:"link",action:()=>{window.open(e.resume,"_blank"),h()}},{group:"Links",label:"LinkedIn",icon:"link",action:()=>{window.open("https://linkedin.com/in/riadmukhtarov","_blank"),h()}},{group:"Links",label:"GitHub",icon:"link",action:()=>{window.open("https://github.com/r14dd","_blank"),h()}},{group:"Actions",label:"Toggle theme",icon:"action",action:()=>{document.getElementById("theme-toggle")?.click(),h()}},{group:"Actions",label:"Copy email",icon:"action",action:()=>{navigator.clipboard?.writeText("riadmukh@gmail.com").then(()=>Te("Email copied")),h()}}]},f=t=>{document.getElementById(t)?.scrollIntoView({behavior:"smooth",block:"start"}),h()},oe=()=>{S=!0,O?.classList.add("open"),N?.classList.add("open"),N?.setAttribute("aria-hidden","false"),H?.focus(),re("")},h=()=>{S=!1,O?.classList.remove("open"),N?.classList.remove("open"),N?.setAttribute("aria-hidden","true"),H&&(H.value="")},F=t=>{const e=k?.querySelectorAll(".cmd-item");if(!e)return;e.forEach(o=>o.classList.remove("highlighted"));const s=e[t];s&&(s.classList.add("highlighted"),s.scrollIntoView({block:"nearest"})),w=t},re=t=>{if(!k)return;const e=Ne();if(L=t?e.filter(n=>n.label.toLowerCase().includes(t.toLowerCase())||n.group.toLowerCase().includes(t.toLowerCase())):e,w=0,!L.length){k.innerHTML='<div style="padding:1.5rem;text-align:center;color:var(--muted);font-size:0.85rem">No results</div>';return}let s="",o="";L.forEach((n,l)=>{n.group!==o&&(s+=`<div class="cmd-group-label">${n.group}</div>`,o=n.group),s+=`<div class="cmd-item${l===0?" highlighted":""}" data-idx="${l}" role="option"><span class="cmd-item-icon">${qe[n.icon]}</span>${n.label}</div>`}),k.innerHTML=s,k.querySelectorAll(".cmd-item").forEach((n,l)=>{n.addEventListener("click",()=>L[l]?.action()),n.addEventListener("mouseenter",()=>{w=l,F(l)})})};H?.addEventListener("input",t=>re(t.target.value));O?.addEventListener("click",h);document.getElementById("cmd-trigger")?.addEventListener("click",()=>S?h():oe());document.addEventListener("keydown",t=>{if((t.metaKey||t.ctrlKey)&&t.key==="k"){t.preventDefault(),S?h():oe();return}if(!S)return;const e=k?.querySelectorAll(".cmd-item");if(t.key==="Escape"){h();return}e?.length&&(t.key==="ArrowDown"?(t.preventDefault(),F((w+1)%e.length)):t.key==="ArrowUp"?(t.preventDefault(),F((w-1+e.length)%e.length)):t.key==="Enter"&&(t.preventDefault(),L[w]?.action()))});const ae=window.matchMedia("(prefers-reduced-motion: reduce)").matches,J=new WeakSet,ce=t=>{if(ae)return;const e=t.textContent;if(!e||!e.trim())return;const s=e.length,o=400/s;let n=0;t.textContent="";const l=()=>{t.textContent=e.slice(0,++n),n<s&&setTimeout(l,o)};l()};if(!ae){const t=new WeakSet,e=()=>{document.querySelectorAll(".project-card, .meta-card").forEach(n=>{t.has(n)||(t.add(n),n.addEventListener("mousemove",l=>{n.style.transition="background 0.3s ease, border-color 0.3s ease";const r=n.getBoundingClientRect(),a=l.clientX-r.left,d=l.clientY-r.top,y=r.width/2,u=r.height/2,g=(d-u)/u*-4,p=(a-y)/y*4;n.style.transform=`perspective(600px) rotateX(${g}deg) rotateY(${p}deg)`,n.style.setProperty("--spot-x",`${a}px`),n.style.setProperty("--spot-y",`${d}px`)}),n.addEventListener("mouseleave",()=>{n.style.transition="transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease, border-color 0.3s ease",n.style.transform="",setTimeout(()=>{n.style.transition=""},650)}))})};e();const s=document.querySelector(".content");s&&new MutationObserver(()=>e()).observe(s,{childList:!0,subtree:!0}),document.querySelectorAll("section[id]").forEach(n=>{new MutationObserver((l,r)=>{if(n.classList.contains("section-revealed")){const a=n.querySelector("h2");a&&!J.has(a)&&(J.add(a),ce(a)),r.disconnect()}}).observe(n,{attributes:!0,attributeFilter:["class"]})});const o=document.querySelectorAll(".side-nav a, .side-links a, .theme-toggle, .lang-toggle, .cta-btn");document.addEventListener("mousemove",n=>{o.forEach(l=>{const r=l.getBoundingClientRect(),a=r.left+r.width/2,d=r.top+r.height/2,y=n.clientX-a,u=n.clientY-d,g=Math.sqrt(y*y+u*u);if(g<50){const p=(1-g/50)*.5;l.style.transform=`translate(${y*p}px, ${u*p}px)`}else l.style.transform&&(l.style.transform="")})})}
