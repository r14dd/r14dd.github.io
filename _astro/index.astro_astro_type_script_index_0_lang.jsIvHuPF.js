const w=document.getElementById("i18n-data"),L=w?JSON.parse(w.textContent||"{}"):{},N={en:"English",ru:"Русский",az:"Azərbaycanca",es:"Español"},I=()=>{const t=window.location.hash.replace("#","");if(!t)return;const e=document.getElementById(t);e&&e.scrollIntoView({behavior:"smooth",block:"start"})};window.addEventListener("hashchange",I);window.addEventListener("load",I);const m=Array.from(document.querySelectorAll("section[id]")),q=Array.from(document.querySelectorAll(".side-nav a")),x=document.querySelector(".mobile-current"),$=()=>{const t=window.scrollY+120;let e=m[0];m.forEach(i=>{i.offsetTop<=t&&(e=i)}),window.scrollY+window.innerHeight>=document.body.scrollHeight-4&&(e=m[m.length-1]),q.forEach(i=>i.classList.remove("active"));const n=q.find(i=>i.getAttribute("href")===`#${e.id}`);if(n?.classList.add("active"),x){const i=n?.textContent??e.getAttribute("data-label")??e.id;x.textContent=i,x.classList.add("active")}},T=()=>{const t=document.getElementById("scroll-progress");if(!t)return;const e=document.body.scrollHeight-window.innerHeight,n=e>0?window.scrollY/e*100:0;t.style.height=`${n}%`},B=()=>{const t=document.querySelector(".side-nav"),e=document.querySelector(".side-links");if(!t&&!e)return;const n=window.scrollY>40;t?.classList.toggle("blurred",n),e?.classList.toggle("blurred",n)};window.addEventListener("scroll",()=>{$(),T(),B()});window.addEventListener("load",()=>{$(),T(),B()});document.querySelectorAll(".simulate-btn").forEach(t=>{t.addEventListener("click",()=>{t.closest(".project-card")?.querySelector(".sim-visual")?.classList.toggle("active")})});const P=document.querySelector(".hamburger"),r=document.querySelector(".mobile-menu");P?.addEventListener("click",()=>{r?.classList.toggle("open"),r?.setAttribute("aria-hidden",r.classList.contains("open")?"false":"true")});r?.querySelectorAll("a").forEach(t=>{t.addEventListener("click",()=>{r.classList.remove("open"),r.setAttribute("aria-hidden","true")})});const o=document.getElementById("lang-toggle"),a=document.getElementById("lang-menu"),C=document.getElementById("lang-current"),R=t=>`
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
                  ${e.bullets.map(n=>`<li>${n}</li>`).join("")}
                </ul>
              </div>
            `).join("")}
      `,F=t=>{const e=[];return t.links?.github&&e.push(`<a class="project-link" href="${t.links.github}" target="_blank" rel="noopener">${E.labels.links.github}</a>`),(t.name.includes("RAFT")||t.name.includes("Raft")||t.name.includes("Hash Table")||t.name.includes("Distributed")||t.name.includes("Kademlia"))&&e.push('<button class="simulate-btn" type="button">Simulate</button>'),e.join("")},Y=t=>t.name.includes("RAFT")||t.name.includes("Raft")?`
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
        `:"";let E=L.en;const D=t=>(E=t,`
        <h2>${t.labels.headings.projects}</h2>
        ${t.projects.map(e=>`
              <div class="project-card">
                <div class="project-header">
                  <div>
                    <h3>${e.name}</h3>
                    <div class="project-tech">${e.tech.join(" · ")}</div>
                  </div>
                  <div class="project-actions">
                    ${F(e)}
                  </div>
                </div>
                ${e.impact?`<div class="project-impact"><strong>Impact:</strong> ${e.impact.replace(/^Impact:\\s*/i,"")}</div>`:""}
                <ul class="project-bullets">
                  ${e.bullets.map(n=>`<li>${n}</li>`).join("")}
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
                  ${e.bullets.map(n=>`<li>${n}</li>`).join("")}
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
      `,K=t=>`
        <h2>${t.labels.headings.skills}</h2>
        ${t.skills.map(e=>`
              <div class="meta-card">
                <h3>${e.category}</h3>
                <div class="tech-meta skills-line">${e.items.join(" · ")}</div>
              </div>
            `).join("")}
      `,O=t=>`
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
      `,W=t=>{const n=(t.labels.connectTemplate||"Reach me at {email} or {phone}").replace("{email}",'<a href="mailto:riadmukh@gmail.com" target="_blank" rel="noopener">riadmukh@gmail.com</a>').replace("{phone}",'<a href="tel:+994508998676" target="_blank" rel="noopener"> +994 50 899 8676</a>');return`
        <h2>${t.labels.headings.connect}</h2>
        <p class="connect-text">${n}</p>
      `},J=t=>{const e=document.querySelector(".intro-name");e&&(e.setAttribute("aria-label",t),e.innerHTML="",Array.from(t).forEach((n,i)=>{const c=document.createElement("span");c.textContent=n===" "?" ":n,c.style.animationDelay=`${(.05+i*.08).toFixed(2)}s`,e.appendChild(c)}))},V=t=>{const e=L[t]||L.en;E=e,document.documentElement.lang=t,C&&(C.textContent=N[t]||"English");const n=document.querySelector("main section h1"),i=document.querySelector(".hero-links"),c=document.querySelector(".hero-cta .cta-btn"),d=document.querySelectorAll(".hero-tagline");if(n&&(n.textContent=e.hero.name),d.length){const s=e.hero.tagline.split(". "),l=s[0]?.trim()??"",j=s.slice(1).join(". ").trim();d[0].textContent=`${l}${l.endsWith(".")?"":"."}`,d[1]&&(d[1].textContent=j)}if(i){const s=i.querySelectorAll("a");s[0]&&(s[0].textContent=e.labels.links.resume),s[1]&&(s[1].textContent=e.labels.links.linkedin),s[2]&&(s[2].textContent=e.labels.links.github)}c&&(c.setAttribute("href",e.links.resume),c.innerHTML=`<svg class="cta-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v10m0 0l-4-4m4 4l4-4M5 20h14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"></path></svg>${e.labels.links.resume}`);const S=document.querySelector(".intro-phrase .lead");S&&(S.textContent=e.labels.introLead??""),J(e.hero.name);const A=document.querySelector(".side-links");if(A){const s=A.querySelectorAll("a");s[0]&&(s[0].textContent=e.labels.links.resume),s[1]&&(s[1].textContent=e.labels.links.linkedin),s[2]&&(s[2].textContent=e.labels.links.github)}const H=document.querySelectorAll(".side-nav a"),M=document.querySelectorAll(".mobile-menu a"),u=[e.labels.nav.education,e.labels.nav.experience,e.labels.nav.projects,e.labels.nav.teaching,e.labels.nav.skills,e.labels.nav.reading,e.labels.nav.connect];H.forEach((s,l)=>{u[l]&&(s.textContent=u[l])}),M.forEach((s,l)=>{u[l]&&(s.textContent=u[l])});const g=document.getElementById("experience"),b=document.getElementById("projects"),p=document.getElementById("teaching"),v=document.getElementById("education"),y=document.getElementById("skills"),f=document.getElementById("reading"),k=document.getElementById("connect");g&&(g.innerHTML=R(e)),b&&(b.innerHTML=D(e)),p&&(p.innerHTML=_(e)),v&&(v.innerHTML=z(e)),y&&(y.innerHTML=K(e)),f&&(f.innerHTML=O(e)),k&&(k.innerHTML=W(e)),g?.setAttribute("data-label",e.labels.headings.experience),b?.setAttribute("data-label",e.labels.headings.projects),p?.setAttribute("data-label",e.labels.headings.teaching),v?.setAttribute("data-label",e.labels.headings.education),y?.setAttribute("data-label",e.labels.headings.skills),f?.setAttribute("data-label",e.labels.headings.reading),k?.setAttribute("data-label",e.labels.headings.connect),document.querySelectorAll(".simulate-btn").forEach(s=>{s.addEventListener("click",()=>{s.closest(".project-card")?.querySelector(".sim-visual")?.classList.toggle("active")})}),$()},h=document.querySelector(".lang-switcher");o?.addEventListener("click",()=>{const t=a?.classList.contains("open");a?.classList.toggle("open",!t),h?.classList.toggle("open",!t),o?.setAttribute("aria-expanded",String(!t))});a?.querySelectorAll("button").forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-lang")||"en",n=document.documentElement.lang||"en";if(e===n){a.classList.remove("open"),h?.classList.remove("open"),o?.setAttribute("aria-expanded","false");return}localStorage.setItem("portfolio-lang",e),a.classList.remove("open"),h?.classList.remove("open"),o?.setAttribute("aria-expanded","false"),window.location.reload()})});document.addEventListener("click",t=>{if(!a||!o)return;const e=t.target;e instanceof Node&&(a.contains(e)||o.contains(e))||(a.classList.remove("open"),h?.classList.remove("open"),o.setAttribute("aria-expanded","false"))});const G=localStorage.getItem("portfolio-lang")||"en";V(G);
