const T="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%",X=(t,e,i=550)=>{const r=e.length,d=Math.round(i/35);let l=0;const n=setInterval(()=>{t.textContent=Array.from(e).map((o,a)=>o===" "?" ":l>=Math.floor(a/r*d)+2?o:T[Math.floor(Math.random()*T.length)]).join(""),++l>d&&(t.textContent=e,clearInterval(n))},35)},I=document.getElementById("i18n-data"),j=I?JSON.parse(I.textContent||"{}"):{},z={en:"English",ru:"Русский",az:"Azərbaycanca",es:"Español"},P=()=>{const t=window.location.hash.replace("#","");if(!t)return;const e=document.getElementById(t);e&&e.scrollIntoView({behavior:"smooth",block:"start"})};window.addEventListener("hashchange",P);window.addEventListener("load",P);const w=Array.from(document.querySelectorAll("section[id]")),N=Array.from(document.querySelectorAll(".side-nav a")),$=document.querySelector(".mobile-current"),M=()=>{const t=window.scrollY+120;let e=w[0];w.forEach(l=>{l.offsetTop<=t&&(e=l)}),window.scrollY+window.innerHeight>=document.body.scrollHeight-4&&(e=w[w.length-1]),N.forEach(l=>l.classList.remove("active"));const i=N.find(l=>l.getAttribute("href")===`#${e.id}`);if(i?.classList.add("active"),$){const l=i?.textContent??e.getAttribute("data-label")??e.id;$.textContent=l,$.classList.add("active")}const r=document.querySelector(".nav-pill"),d=document.querySelector(".side-nav");if(r&&i&&d){const l=d.getBoundingClientRect(),n=i.getBoundingClientRect();r.style.top=n.top-l.top+(n.height-26)/2+"px",r.style.opacity="1"}},Y=()=>{const t=document.getElementById("scroll-progress");if(!t)return;const e=document.body.scrollHeight-window.innerHeight,i=e>0?window.scrollY/e*100:0;t.style.height=`${i}%`},F=()=>{const t=document.querySelector(".side-nav"),e=document.querySelector(".side-links");if(!t&&!e)return;const i=window.scrollY>40;t?.classList.toggle("blurred",i),e?.classList.toggle("blurred",i)};document.querySelectorAll(".side-nav a, .mobile-menu a").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault();const i=t.getAttribute("href")?.replace("#","");if(!i)return;const r=document.getElementById(i);r&&(r.scrollIntoView({behavior:"smooth",block:"start"}),history.pushState(null,"",`#${i}`))})});const A=document.querySelector("main > section:first-of-type"),D=()=>{if(!A)return;const t=window.scrollY,e=A.querySelector("h1"),i=A.querySelectorAll(".hero-tagline");e&&(e.style.transform=`translateY(${t*.12}px)`),i.forEach(r=>{r.style.transform=`translateY(${t*.08}px)`})};window.addEventListener("scroll",()=>{M(),Y(),F(),D()});window.addEventListener("load",()=>{M(),Y(),F(),D()});document.querySelectorAll(".simulate-btn").forEach(t=>{t.addEventListener("click",()=>{t.closest(".project-card")?.querySelector(".sim-visual")?.classList.toggle("active")})});const G=document.querySelector(".hamburger"),k=document.querySelector(".mobile-menu");G?.addEventListener("click",()=>{k?.classList.toggle("open"),k?.setAttribute("aria-hidden",k.classList.contains("open")?"false":"true")});k?.querySelectorAll("a").forEach(t=>{t.addEventListener("click",()=>{k.classList.remove("open"),k.setAttribute("aria-hidden","true")})});const v=document.getElementById("lang-toggle"),f=document.getElementById("lang-menu"),H=document.getElementById("lang-current"),K=t=>`
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
                  ${e.bullets.map(i=>`<li>${i}</li>`).join("")}
                </ul>
              </div>
            `).join("")}
      `,V=t=>t.includes("RAFT")||t.includes("Raft")||t.includes("Hash Table")||t.includes("Distributed")||t.includes("Kademlia")||t.includes("Redis"),W=t=>t.includes("RAFT")||t.includes("Raft"),_=t=>t.includes("Hash Table")||t.includes("Distributed")||t.includes("Kademlia"),J=t=>t.includes("Redis"),U=t=>{const e=[];return t.links?.github&&e.push(`<a class="project-link" href="${t.links.github}" target="_blank" rel="noopener">${q.labels.links.github}</a>`),V(t.name)&&e.push('<button class="simulate-btn" type="button">Simulate</button>'),e.join("")},Q=t=>W(t.name)?`
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
        `:_(t.name)?`
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
        `:J(t.name)?`
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
        `:"";let q=j.en;const Z=t=>(q=t,`
        <h2>${t.labels.headings.projects}</h2>
        ${t.projects.map(e=>`
              <div class="project-card">
                <div class="project-header">
                  <div>
                    <h3>${e.name}</h3>
                    <div class="project-tech">${e.tech.join(" · ")}</div>
                  </div>
                  <div class="project-actions">
                    ${U(e)}
                  </div>
                </div>
                ${e.impact?`<div class="project-impact"><strong>Impact:</strong> ${e.impact.replace(/^(?:Impact:\s*)+/i,"")}</div>`:""}
                <ul class="project-bullets">
                  ${e.bullets.map(i=>`<li>${i}</li>`).join("")}
                </ul>
                ${Q(e)}
              </div>
            `).join("")}
      `),ee=t=>`
        <h2>${t.labels.headings.teaching}</h2>
        ${t.teaching.map(e=>`
              <div style="margin-bottom: 2rem" class="project-card">
                <h3>${e.title}</h3>
                <div class="tech-meta">${e.skills}</div>
                <ul>
                  ${e.bullets.map(i=>`<li>${i}</li>`).join("")}
                </ul>
              </div>
            `).join("")}
      `,te=t=>`
        <h2>${t.labels.headings.education}</h2>
        <div class="meta-card">
          <h3>${t.education.title}</h3>
          <div class="tech-meta">${t.education.meta}</div>
          <ul>
            ${t.education.bullets.map(e=>`<li>${e}</li>`).join("")}
          </ul>
        </div>
      `,se={"Programming Languages":'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3.5L2 8l3 4.5M11 3.5L14 8l-3 4.5M9 2.5l-2 11"/></svg>',"Backend & Frameworks":'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="3.5" width="12" height="3" rx="1"/><rect x="2" y="9.5" width="12" height="3" rx="1"/><circle cx="4.5" cy="5" r="0.6" fill="currentColor" stroke="none"/><circle cx="4.5" cy="11" r="0.6" fill="currentColor" stroke="none"/></svg>',"Architecture & Concepts":'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="2"/><circle cx="2.5" cy="4" r="1.2"/><circle cx="13.5" cy="4" r="1.2"/><circle cx="2.5" cy="12" r="1.2"/><circle cx="13.5" cy="12" r="1.2"/><line x1="6.2" y1="6.8" x2="3.7" y2="5.2"/><line x1="9.8" y1="6.8" x2="12.3" y2="5.2"/><line x1="6.2" y1="9.2" x2="3.7" y2="10.8"/><line x1="9.8" y1="9.2" x2="12.3" y2="10.8"/></svg>',"Messaging & Integration":'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 5.5h9M9 3.5l2 2-2 2"/><path d="M14 10.5H5M7 8.5l-2 2 2 2"/></svg>',"Databases & Persistence":'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><ellipse cx="8" cy="4" rx="5" ry="1.8"/><path d="M3 4v8c0 1 2.24 1.8 5 1.8s5-.8 5-1.8V4"/><path d="M3 8c0 1 2.24 1.8 5 1.8S13 9 13 8"/></svg>',"Cloud & Infrastructure":'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4.5 11a3 3 0 01.4-5.9A3.5 3.5 0 0112.5 6.5a2.5 2.5 0 01-.5 4.5H4.5z"/></svg>',"Testing & Tooling":'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2a3 3 0 00-2.8 4L3 11.5a1.5 1.5 0 002 2L10.5 8A3 3 0 0011 2z"/><circle cx="11" cy="4" r="1" fill="currentColor" stroke="none"/></svg>'},ne=t=>{const e=se[t]||"";return e?`<span class="skill-icon">${e}</span>`:""},ie=t=>`
        <h2>${t.labels.headings.skills}</h2>
        ${t.skills.map(e=>`
          <div class="meta-card">
            <div class="skill-category-header">
              ${ne(e.category)}
              <h3>${e.category}</h3>
            </div>
            <div class="skills-pills">
              ${e.items.map(i=>`<span class="skill-pill">${i}</span>`).join("")}
            </div>
          </div>
        `).join("")}
      `,le=t=>`
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
      `,oe=t=>{const i=(t.labels.connectTemplate||"Reach me at {email}").replace("{email}",'<a href="mailto:riadmukh@gmail.com" target="_blank" rel="noopener">riadmukh@gmail.com</a>');return`
        <h2>${t.labels.headings.connect}</h2>
        <p class="connect-text">${i}</p>
      `},re=t=>{const e=document.querySelector(".intro-name");e&&(e.setAttribute("aria-label",t),e.innerHTML="",Array.from(t).forEach((i,r)=>{const d=document.createElement("span");d.textContent=i===" "?" ":i,d.style.animationDelay=`${(.05+r*.08).toFixed(2)}s`,e.appendChild(d)}))},ae=t=>{const e=j[t]||j.en;q=e,document.documentElement.lang=t,H&&(H.textContent=z[t]||"English");const i=document.querySelector("main section h1"),r=document.querySelector(".hero-links"),d=document.querySelector(".hero-cta .cta-btn"),l=document.querySelectorAll(".hero-tagline");if(i&&X(i,e.hero.name),l.length){const s=e.hero.tagline.split(". "),c=s[0]?.trim()??"",x=s.slice(1).join(". ").trim();l[0].textContent=`${c}${c.endsWith(".")?"":"."}`,l[1]&&(l[1].textContent=x)}if(r){const s=r.querySelectorAll("a");s[0]&&(s[0].textContent=e.labels.links.resume,s[0].setAttribute("href",e.links.resume)),s[1]&&(s[1].textContent=e.labels.links.linkedin,s[1].setAttribute("href",e.links.linkedin)),s[2]&&(s[2].textContent=e.labels.links.github,s[2].setAttribute("href",e.links.github))}d&&(d.setAttribute("href",e.links.resume),d.innerHTML=`<svg class="cta-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v10m0 0l-4-4m4 4l4-4M5 20h14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"></path></svg>${e.labels.links.resume}`);const n=document.querySelector(".intro-phrase");if(n){const s=n.querySelectorAll(".lead"),c=!!e.labels.introLead,x=!!e.labels.introTail;if(s.length===0&&(c||x)){if(c){const g=document.createElement("span");g.className="lead",g.textContent=e.labels.introLead,n.insertBefore(g,n.firstChild)}if(x){const g=document.createElement("span");g.className="lead",g.textContent=e.labels.introTail,n.appendChild(g)}}else if(s.length===1){if(c&&!x)n.insertBefore(s[0],n.querySelector(".intro-name")),s[0].textContent=e.labels.introLead;else if(!c&&x)n.appendChild(s[0]),s[0].textContent=e.labels.introTail;else if(c&&x){s[0].textContent=e.labels.introLead,n.insertBefore(s[0],n.querySelector(".intro-name"));const g=document.createElement("span");g.className="lead",g.textContent=e.labels.introTail,n.appendChild(g)}}else s.length>=2&&(c?(s[0].textContent=e.labels.introLead,s[0].style.display=""):s[0].style.display="none",x?(s[s.length-1].textContent=e.labels.introTail,s[s.length-1].style.display=""):s[s.length-1].style.display="none")}re(e.hero.name);const o=document.querySelector(".side-links");if(o){const s=o.querySelectorAll("a");s[0]&&(s[0].textContent=e.labels.links.resume),s[1]&&(s[1].textContent=e.labels.links.linkedin),s[2]&&(s[2].textContent=e.labels.links.github)}const a=document.querySelectorAll(".side-nav a"),u=document.querySelectorAll(".mobile-menu a"),h=[e.labels.nav.education,e.labels.nav.experience,e.labels.nav.projects,e.labels.nav.teaching,e.labels.nav.skills,e.labels.nav.reading,e.labels.nav.connect];a.forEach((s,c)=>{h[c]&&(s.textContent=h[c])}),u.forEach((s,c)=>{h[c]&&(s.textContent=h[c])});const m=document.getElementById("experience"),y=document.getElementById("projects"),p=document.getElementById("teaching"),b=document.getElementById("education"),L=document.getElementById("skills"),E=document.getElementById("reading"),S=document.getElementById("connect");m&&(m.innerHTML=K(e)),y&&(y.innerHTML=Z(e)),p&&(p.innerHTML=ee(e)),b&&(b.innerHTML=te(e)),L&&(L.innerHTML=ie(e)),E&&(E.innerHTML=le(e)),S&&(S.innerHTML=oe(e)),m?.setAttribute("data-label",e.labels.headings.experience),y?.setAttribute("data-label",e.labels.headings.projects),p?.setAttribute("data-label",e.labels.headings.teaching),b?.setAttribute("data-label",e.labels.headings.education),L?.setAttribute("data-label",e.labels.headings.skills),E?.setAttribute("data-label",e.labels.headings.reading),S?.setAttribute("data-label",e.labels.headings.connect),document.querySelectorAll(".simulate-btn").forEach(s=>{s.addEventListener("click",()=>{s.closest(".project-card")?.querySelector(".sim-visual")?.classList.toggle("active")})}),M()},C=document.querySelector(".lang-switcher");v?.addEventListener("click",()=>{const t=f?.classList.contains("open");f?.classList.toggle("open",!t),C?.classList.toggle("open",!t),v?.setAttribute("aria-expanded",String(!t))});f?.querySelectorAll("button").forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-lang")||"en",i=document.documentElement.lang||"en";if(e===i){f.classList.remove("open"),C?.classList.remove("open"),v?.setAttribute("aria-expanded","false");return}localStorage.setItem("portfolio-lang",e),f.classList.remove("open"),C?.classList.remove("open"),v?.setAttribute("aria-expanded","false"),window.location.reload()})});document.addEventListener("click",t=>{if(!f||!v)return;const e=t.target;e instanceof Node&&(f.contains(e)||v.contains(e))||(f.classList.remove("open"),C?.classList.remove("open"),v.setAttribute("aria-expanded","false"))});const ce=localStorage.getItem("portfolio-lang")||"en";ae(ce);const B=document.getElementById("theme-toggle"),R=B?.querySelector(".theme-icon"),O=()=>{const t=document.documentElement.classList.contains("light");R&&(R.textContent=t?"🌙":"☀️"),B?.setAttribute("aria-label",t?"Switch to dark mode":"Switch to light mode")};B?.addEventListener("click",()=>{document.documentElement.classList.toggle("light");const t=document.documentElement.classList.contains("light");localStorage.setItem("portfolio-theme",t?"light":"dark"),O()});O();const de=window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(!de){const t=new WeakSet,e=()=>{document.querySelectorAll(".project-card, .meta-card").forEach(n=>{t.has(n)||(t.add(n),n.addEventListener("mousemove",o=>{n.style.transition="background 0.3s ease, border-color 0.3s ease";const a=n.getBoundingClientRect(),u=o.clientX-a.left,h=o.clientY-a.top,m=a.width/2,y=a.height/2,p=(h-y)/y*-4,b=(u-m)/m*4;n.style.transform=`perspective(600px) rotateX(${p}deg) rotateY(${b}deg)`,n.style.setProperty("--spot-x",`${u}px`),n.style.setProperty("--spot-y",`${h}px`)}),n.addEventListener("mouseleave",()=>{n.style.transition="transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease, border-color 0.3s ease",n.style.transform="",setTimeout(()=>{n.style.transition=""},650)}))})};e();const i=document.querySelector(".content");i&&new MutationObserver(()=>e()).observe(i,{childList:!0,subtree:!0});const r=new WeakSet,d=n=>{const o=n.textContent;if(!o||!o.trim())return;const a=o.length,u=400/a;let h=0;n.textContent="";const m=()=>{n.textContent=o.slice(0,++h),h<a&&setTimeout(m,u)};m()};document.querySelectorAll("section[id]").forEach(n=>{new MutationObserver((o,a)=>{if(n.classList.contains("section-revealed")){const u=n.querySelector("h2");u&&!r.has(u)&&(r.add(u),d(u)),a.disconnect()}}).observe(n,{attributes:!0,attributeFilter:["class"]})});const l=document.querySelectorAll(".side-nav a, .side-links a, .theme-toggle, .lang-toggle, .cta-btn");document.addEventListener("mousemove",n=>{l.forEach(o=>{const a=o.getBoundingClientRect(),u=a.left+a.width/2,h=a.top+a.height/2,m=n.clientX-u,y=n.clientY-h,p=Math.sqrt(m*m+y*y);if(p<50){const b=(1-p/50)*.5;o.style.transform=`translate(${m*b}px, ${y*b}px)`}else o.style.transform&&(o.style.transform="")})})}
