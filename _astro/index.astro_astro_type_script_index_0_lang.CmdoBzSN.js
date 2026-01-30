const A=document.getElementById("i18n-data"),x=A?JSON.parse(A.textContent||"{}"):{},N={en:"English",ru:"Русский",az:"Azərbaycanca",es:"Español"},C=()=>{const t=window.location.hash.replace("#","");if(!t)return;const e=document.getElementById(t);e&&e.scrollIntoView({behavior:"smooth",block:"start"})};window.addEventListener("hashchange",C);window.addEventListener("load",C);const u=Array.from(document.querySelectorAll("section[id]")),w=Array.from(document.querySelectorAll(".side-nav a")),k=document.querySelector(".mobile-current"),L=()=>{const t=window.scrollY+120;let e=u[0];u.forEach(i=>{i.offsetTop<=t&&(e=i)}),window.scrollY+window.innerHeight>=document.body.scrollHeight-4&&(e=u[u.length-1]),w.forEach(i=>i.classList.remove("active"));const s=w.find(i=>i.getAttribute("href")===`#${e.id}`);if(s?.classList.add("active"),k){const i=s?.textContent??e.getAttribute("data-label")??e.id;k.textContent=i,k.classList.add("active")}},I=()=>{const t=document.getElementById("scroll-progress");if(!t)return;const e=document.body.scrollHeight-window.innerHeight,s=e>0?window.scrollY/e*100:0;t.style.height=`${s}%`},B=()=>{const t=document.querySelector(".side-nav"),e=document.querySelector(".side-links");if(!t&&!e)return;const s=window.scrollY>40;t?.classList.toggle("blurred",s),e?.classList.toggle("blurred",s)};window.addEventListener("scroll",()=>{L(),I(),B()});window.addEventListener("load",()=>{L(),I(),B()});document.querySelectorAll(".simulate-btn").forEach(t=>{t.addEventListener("click",()=>{t.closest(".project-card")?.querySelector(".sim-visual")?.classList.toggle("active")})});const M=document.querySelector(".hamburger"),o=document.querySelector(".mobile-menu");M?.addEventListener("click",()=>{o?.classList.toggle("open"),o?.setAttribute("aria-hidden",o.classList.contains("open")?"false":"true")});o?.querySelectorAll("a").forEach(t=>{t.addEventListener("click",()=>{o.classList.remove("open"),o.setAttribute("aria-hidden","true")})});const c=document.getElementById("lang-toggle"),a=document.getElementById("lang-menu"),q=document.getElementById("lang-current"),P=t=>`
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
      `,R=t=>{const e=[];return t.links?.github&&e.push(`<a class="project-link" href="${t.links.github}" target="_blank" rel="noopener">${$.labels.links.github}</a>`),(t.name.includes("RAFT")||t.name.includes("Raft")||t.name.includes("Hash Table")||t.name.includes("Distributed")||t.name.includes("Kademlia"))&&e.push('<button class="simulate-btn" type="button">Simulate</button>'),e.join("")},Y=t=>t.name.includes("RAFT")||t.name.includes("Raft")?`
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
        `:t.name.includes("Hash Table")||t.name.includes("Distributed")||t.name.includes("Kademlia")?`
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
        `:"";let $=x.en;const F=t=>($=t,`
        <h2>${t.labels.headings.projects}</h2>
        ${t.projects.map(e=>`
              <div class="project-card">
                <div class="project-header">
                  <div>
                    <h3>${e.name}</h3>
                    <div class="project-tech">${e.tech.join(" · ")}</div>
                  </div>
                  <div class="project-actions">
                    ${R(e)}
                  </div>
                </div>
                ${e.impact?`<div class="project-impact"><strong>Impact:</strong> ${e.impact.replace(/^Impact:\\s*/i,"")}</div>`:""}
                <ul class="project-bullets">
                  ${e.bullets.map(s=>`<li>${s}</li>`).join("")}
                </ul>
                ${Y(e)}
              </div>
            `).join("")}
      `),_=t=>`
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
      `,z=t=>`
        <h2>${t.labels.headings.education}</h2>
        <div class="meta-card">
          <h3>${t.education.title}</h3>
          <div class="tech-meta">${t.education.meta}</div>
          <ul>
            ${t.education.bullets.map(e=>`<li>${e}</li>`).join("")}
          </ul>
        </div>
      `,D=t=>`
        <h2>${t.labels.headings.skills}</h2>
        ${t.skills.map(e=>`
              <div class="meta-card">
                <h3>${e.category}</h3>
                <div class="tech-meta skills-line">${e.items.join(" · ")}</div>
              </div>
            `).join("")}
      `,K=t=>`
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
      `,O=t=>{const s=(t.labels.connectTemplate||"Reach me at {email} or {phone}").replace("{email}",'<a href="mailto:riadmukh@gmail.com" target="_blank" rel="noopener">riadmukh@gmail.com</a>').replace("{phone}",'<a href="tel:+994508998676" target="_blank" rel="noopener"> +994 50 899 8676</a>');return`
        <h2>${t.labels.headings.connect}</h2>
        <p class="connect-text">${s}</p>
      `},W=t=>{const e=x[t]||x.en;$=e,document.documentElement.lang=t,q&&(q.textContent=N[t]||"English");const s=document.querySelector("main section h1"),i=document.querySelector(".hero-links"),r=document.querySelectorAll(".hero-tagline");if(s&&(s.textContent=e.hero.name),r.length){const n=e.hero.tagline.split(". "),l=n[0]?.trim()??"",j=n.slice(1).join(". ").trim();r[0].textContent=`${l}${l.endsWith(".")?"":"."}`,r[1]&&(r[1].textContent=j)}if(i){const n=i.querySelectorAll("a");n[0]&&(n[0].textContent=e.labels.links.resume),n[1]&&(n[1].textContent=e.labels.links.linkedin),n[2]&&(n[2].textContent=e.labels.links.github)}const E=document.querySelector(".intro-phrase .lead");E&&(E.textContent=e.labels.introLead??"");const S=document.querySelector(".side-links");if(S){const n=S.querySelectorAll("a");n[0]&&(n[0].textContent=e.labels.links.resume),n[1]&&(n[1].textContent=e.labels.links.linkedin),n[2]&&(n[2].textContent=e.labels.links.github)}const T=document.querySelectorAll(".side-nav a"),H=document.querySelectorAll(".mobile-menu a"),d=[e.labels.nav.education,e.labels.nav.experience,e.labels.nav.projects,e.labels.nav.teaching,e.labels.nav.skills,e.labels.nav.reading,e.labels.nav.connect];T.forEach((n,l)=>{d[l]&&(n.textContent=d[l])}),H.forEach((n,l)=>{d[l]&&(n.textContent=d[l])});const g=document.getElementById("experience"),h=document.getElementById("projects"),b=document.getElementById("teaching"),v=document.getElementById("education"),p=document.getElementById("skills"),y=document.getElementById("reading"),f=document.getElementById("connect");g&&(g.innerHTML=P(e)),h&&(h.innerHTML=F(e)),b&&(b.innerHTML=_(e)),v&&(v.innerHTML=z(e)),p&&(p.innerHTML=D(e)),y&&(y.innerHTML=K(e)),f&&(f.innerHTML=O(e)),g?.setAttribute("data-label",e.labels.headings.experience),h?.setAttribute("data-label",e.labels.headings.projects),b?.setAttribute("data-label",e.labels.headings.teaching),v?.setAttribute("data-label",e.labels.headings.education),p?.setAttribute("data-label",e.labels.headings.skills),y?.setAttribute("data-label",e.labels.headings.reading),f?.setAttribute("data-label",e.labels.headings.connect),document.querySelectorAll(".simulate-btn").forEach(n=>{n.addEventListener("click",()=>{n.closest(".project-card")?.querySelector(".sim-visual")?.classList.toggle("active")})}),L()},m=document.querySelector(".lang-switcher");c?.addEventListener("click",()=>{const t=a?.classList.contains("open");a?.classList.toggle("open",!t),m?.classList.toggle("open",!t),c?.setAttribute("aria-expanded",String(!t))});a?.querySelectorAll("button").forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-lang")||"en",s=document.documentElement.lang||"en";if(e===s){a.classList.remove("open"),m?.classList.remove("open"),c?.setAttribute("aria-expanded","false");return}localStorage.setItem("portfolio-lang",e),a.classList.remove("open"),m?.classList.remove("open"),c?.setAttribute("aria-expanded","false"),window.location.reload()})});document.addEventListener("click",t=>{if(!a||!c)return;const e=t.target;e instanceof Node&&(a.contains(e)||c.contains(e))||(a.classList.remove("open"),m?.classList.remove("open"),c.setAttribute("aria-expanded","false"))});const J=localStorage.getItem("portfolio-lang")||"en";W(J);
