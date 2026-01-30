const A=document.getElementById("i18n-data"),k=A?JSON.parse(A.textContent||"{}"):{},N={en:"English",ru:"Русский",az:"Azərbaycanca",es:"Español"},C=()=>{const t=window.location.hash.replace("#","");if(!t)return;const e=document.getElementById(t);e&&e.scrollIntoView({behavior:"smooth",block:"start"})};window.addEventListener("hashchange",C);window.addEventListener("load",C);const u=Array.from(document.querySelectorAll("section[id]")),w=Array.from(document.querySelectorAll(".side-nav a")),f=document.querySelector(".mobile-current"),x=()=>{const t=window.scrollY+120;let e=u[0];u.forEach(i=>{i.offsetTop<=t&&(e=i)}),window.scrollY+window.innerHeight>=document.body.scrollHeight-4&&(e=u[u.length-1]),w.forEach(i=>i.classList.remove("active"));const s=w.find(i=>i.getAttribute("href")===`#${e.id}`);if(s?.classList.add("active"),f){const i=s?.textContent??e.getAttribute("data-label")??e.id;f.textContent=i,f.classList.add("active")}},I=()=>{const t=document.getElementById("scroll-progress");if(!t)return;const e=document.body.scrollHeight-window.innerHeight,s=e>0?window.scrollY/e*100:0;t.style.height=`${s}%`},B=()=>{const t=document.querySelector(".side-nav"),e=document.querySelector(".side-links");if(!t&&!e)return;const s=window.scrollY>40;t?.classList.toggle("blurred",s),e?.classList.toggle("blurred",s)};window.addEventListener("scroll",()=>{x(),I(),B()});window.addEventListener("load",()=>{x(),I(),B()});document.querySelectorAll(".simulate-btn").forEach(t=>{t.addEventListener("click",()=>{t.closest(".project-card")?.querySelector(".sim-visual")?.classList.toggle("active")})});const P=document.querySelector(".hamburger"),a=document.querySelector(".mobile-menu");P?.addEventListener("click",()=>{a?.classList.toggle("open"),a?.setAttribute("aria-hidden",a.classList.contains("open")?"false":"true")});a?.querySelectorAll("a").forEach(t=>{t.addEventListener("click",()=>{a.classList.remove("open"),a.setAttribute("aria-hidden","true")})});const o=document.getElementById("lang-toggle"),c=document.getElementById("lang-menu"),q=document.getElementById("lang-current"),R=t=>`
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
      `,Y=t=>{const e=[];return t.links?.github&&e.push(`<a class="project-link" href="${t.links.github}" target="_blank" rel="noopener">${$.labels.links.github}</a>`),(t.name.includes("RAFT")||t.name.includes("Raft")||t.name.includes("Hash Table")||t.name.includes("Distributed"))&&e.push('<button class="simulate-btn" type="button">Simulate</button>'),e.join("")},F=t=>t.name.includes("RAFT")||t.name.includes("Raft")?`
          <div class="sim-visual" data-sim="raft">
            <svg width="260" height="80" viewBox="0 0 260 80">
              <line class="sim-link" x1="30" y1="40" x2="130" y2="15" />
              <line class="sim-link" x1="30" y1="40" x2="130" y2="65" />
              <line class="sim-link" x1="230" y1="40" x2="130" y2="15" />
              <line class="sim-link" x1="230" y1="40" x2="130" y2="65" />
              <circle class="sim-node" cx="30" cy="40" r="10" />
              <circle class="sim-node" cx="130" cy="15" r="10" />
              <circle class="sim-node" cx="130" cy="65" r="10" />
              <circle class="sim-node" cx="230" cy="40" r="10" />
              <circle class="sim-pulse" cx="30" cy="40" r="3">
                <animate attributeName="cx" values="30;130;230;130;30" dur="3s" repeatCount="indefinite" />
                <animate attributeName="cy" values="40;15;40;65;40" dur="3s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
        `:t.name.includes("Hash Table")||t.name.includes("Distributed")?`
          <div class="sim-visual" data-sim="kademlia">
            <svg width="260" height="80" viewBox="0 0 260 80">
              <line class="sim-link" x1="40" y1="20" x2="120" y2="40" />
              <line class="sim-link" x1="120" y1="40" x2="200" y2="20" />
              <line class="sim-link" x1="120" y1="40" x2="200" y2="65" />
              <circle class="sim-node" cx="40" cy="20" r="10" />
              <circle class="sim-node" cx="120" cy="40" r="10" />
              <circle class="sim-node" cx="200" cy="20" r="10" />
              <circle class="sim-node" cx="200" cy="65" r="10" />
              <circle class="sim-pulse" cx="40" cy="20" r="3">
                <animate attributeName="cx" values="40;120;200;120;40" dur="2.6s" repeatCount="indefinite" />
                <animate attributeName="cy" values="20;40;65;40;20" dur="2.6s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
        `:"";let $=k.en;const _=t=>($=t,`
        <h2>${t.labels.headings.projects}</h2>
        ${t.projects.map(e=>`
              <div class="project-card">
                <div class="project-header">
                  <div>
                    <h3>${e.name}</h3>
                    <div class="project-tech">${e.tech.join(" · ")}</div>
                  </div>
                  <div class="project-actions">
                    ${Y(e)}
                  </div>
                </div>
                ${e.impact?`<div class="project-impact"><strong>Impact:</strong> ${e.impact.replace(/^Impact:\\s*/i,"")}</div>`:""}
                <ul class="project-bullets">
                  ${e.bullets.map(s=>`<li>${s}</li>`).join("")}
                </ul>
                ${F(e)}
              </div>
            `).join("")}
      `),z=t=>`
        <h2>${t.labels.headings.teaching}</h2>
        ${t.teaching.map(e=>`
              <div style="margin-bottom: 2rem" class="project-card">
                <h3>${e.title}</h3>
                <div class="tech-meta">${e.skills}</div>
                <ul>
                  ${e.bullets.map(s=>`<li>${s}</li>`).join("")}
                </ul>
              </div>
            `).join("")}
      `,D=t=>`
        <h2>${t.labels.headings.education}</h2>
        <div class="meta-card">
          <h3>${t.education.title}</h3>
          <div class="tech-meta">${t.education.meta}</div>
          <ul>
            ${t.education.bullets.map(e=>`<li>${e}</li>`).join("")}
          </ul>
        </div>
      `,O=t=>`
        <h2>${t.labels.headings.skills}</h2>
        ${t.skills.map(e=>`
              <div class="meta-card">
                <h3>${e.category}</h3>
                <div class="tech-meta skills-line">${e.items.join(" · ")}</div>
              </div>
            `).join("")}
      `,W=t=>`
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
      `,J=t=>{const s=(t.labels.connectTemplate||"Reach me at {email} or {phone}").replace("{email}",'<a href="mailto:riadmukh@gmail.com" target="_blank" rel="noopener">riadmukh@gmail.com</a>').replace("{phone}",'<a href="tel:+994508998676" target="_blank" rel="noopener"> +994 50 899 8676</a>');return`
        <h2>${t.labels.headings.connect}</h2>
        <p class="connect-text">${s}</p>
      `},T=t=>{const e=k[t]||k.en;$=e,document.documentElement.lang=t,q&&(q.textContent=N[t]||"English");const s=document.querySelector("main section h1"),i=document.querySelector(".hero-links"),r=document.querySelectorAll(".hero-tagline");if(s&&(s.textContent=e.hero.name),r.length){const n=e.hero.tagline.split(". "),l=n[0]?.trim()??"",j=n.slice(1).join(". ").trim();r[0].textContent=`${l}${l.endsWith(".")?"":"."}`,r[1]&&(r[1].textContent=j)}if(i){const n=i.querySelectorAll("a");n[0]&&(n[0].textContent=e.labels.links.resume),n[1]&&(n[1].textContent=e.labels.links.linkedin),n[2]&&(n[2].textContent=e.labels.links.github)}const E=document.querySelector(".intro-phrase .lead");E&&(E.textContent=e.labels.introLead);const S=document.querySelector(".side-links");if(S){const n=S.querySelectorAll("a");n[0]&&(n[0].textContent=e.labels.links.resume),n[1]&&(n[1].textContent=e.labels.links.linkedin),n[2]&&(n[2].textContent=e.labels.links.github)}const H=document.querySelectorAll(".side-nav a"),M=document.querySelectorAll(".mobile-menu a"),d=[e.labels.nav.experience,e.labels.nav.projects,e.labels.nav.teaching,e.labels.nav.education,e.labels.nav.skills,e.labels.nav.reading,e.labels.nav.connect];H.forEach((n,l)=>{d[l]&&(n.textContent=d[l])}),M.forEach((n,l)=>{d[l]&&(n.textContent=d[l])});const m=document.getElementById("experience"),g=document.getElementById("projects"),h=document.getElementById("teaching"),b=document.getElementById("education"),p=document.getElementById("skills"),v=document.getElementById("reading"),y=document.getElementById("connect");m&&(m.innerHTML=R(e)),g&&(g.innerHTML=_(e)),h&&(h.innerHTML=z(e)),b&&(b.innerHTML=D(e)),p&&(p.innerHTML=O(e)),v&&(v.innerHTML=W(e)),y&&(y.innerHTML=J(e)),m?.setAttribute("data-label",e.labels.headings.experience),g?.setAttribute("data-label",e.labels.headings.projects),h?.setAttribute("data-label",e.labels.headings.teaching),b?.setAttribute("data-label",e.labels.headings.education),p?.setAttribute("data-label",e.labels.headings.skills),v?.setAttribute("data-label",e.labels.headings.reading),y?.setAttribute("data-label",e.labels.headings.connect),document.querySelectorAll(".simulate-btn").forEach(n=>{n.addEventListener("click",()=>{n.closest(".project-card")?.querySelector(".sim-visual")?.classList.toggle("active")})}),x()},L=document.querySelector(".lang-switcher");o?.addEventListener("click",()=>{const t=c?.classList.contains("open");c?.classList.toggle("open",!t),L?.classList.toggle("open",!t),o?.setAttribute("aria-expanded",String(!t))});c?.querySelectorAll("button").forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-lang")||"en";localStorage.setItem("portfolio-lang",e),T(e),c.classList.remove("open"),L?.classList.remove("open"),o?.setAttribute("aria-expanded","false")})});document.addEventListener("click",t=>{!c||!o||c.contains(t.target)||o.contains(t.target)||(c.classList.remove("open"),L?.classList.remove("open"),o.setAttribute("aria-expanded","false"))});const V=localStorage.getItem("portfolio-lang")||"en";T(V);
