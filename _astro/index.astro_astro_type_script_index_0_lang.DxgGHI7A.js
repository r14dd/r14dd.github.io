const w=document.getElementById("i18n-data"),L=w?JSON.parse(w.textContent||"{}"):{},M={en:"English",ru:"Русский",az:"Azərbaycanca",es:"Español"},I=()=>{const t=window.location.hash.replace("#","");if(!t)return;const e=document.getElementById(t);e&&e.scrollIntoView({behavior:"smooth",block:"start"})};window.addEventListener("hashchange",I);window.addEventListener("load",I);const m=Array.from(document.querySelectorAll("section[id]")),C=Array.from(document.querySelectorAll(".side-nav a")),k=document.querySelector(".mobile-current"),$=()=>{const t=window.scrollY+120;let e=m[0];m.forEach(i=>{i.offsetTop<=t&&(e=i)}),window.scrollY+window.innerHeight>=document.body.scrollHeight-4&&(e=m[m.length-1]),C.forEach(i=>i.classList.remove("active"));const s=C.find(i=>i.getAttribute("href")===`#${e.id}`);if(s?.classList.add("active"),k){const i=s?.textContent??e.getAttribute("data-label")??e.id;k.textContent=i,k.classList.add("active")}},B=()=>{const t=document.getElementById("scroll-progress");if(!t)return;const e=document.body.scrollHeight-window.innerHeight,s=e>0?window.scrollY/e*100:0;t.style.height=`${s}%`},T=()=>{const t=document.querySelector(".side-nav"),e=document.querySelector(".side-links");if(!t&&!e)return;const s=window.scrollY>40;t?.classList.toggle("blurred",s),e?.classList.toggle("blurred",s)};window.addEventListener("scroll",()=>{$(),B(),T()});window.addEventListener("load",()=>{$(),B(),T()});document.querySelectorAll(".simulate-btn").forEach(t=>{t.addEventListener("click",()=>{t.closest(".project-card")?.querySelector(".sim-visual")?.classList.toggle("active")})});const R=document.querySelector(".hamburger"),r=document.querySelector(".mobile-menu");R?.addEventListener("click",()=>{r?.classList.toggle("open"),r?.setAttribute("aria-hidden",r.classList.contains("open")?"false":"true")});r?.querySelectorAll("a").forEach(t=>{t.addEventListener("click",()=>{r.classList.remove("open"),r.setAttribute("aria-hidden","true")})});const o=document.getElementById("lang-toggle"),c=document.getElementById("lang-menu"),q=document.getElementById("lang-current"),P=t=>`
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
      `,F=t=>t.includes("RAFT")||t.includes("Raft")||t.includes("Hash Table")||t.includes("Distributed")||t.includes("Kademlia")||t.includes("Redis"),Y=t=>t.includes("RAFT")||t.includes("Raft"),D=t=>t.includes("Hash Table")||t.includes("Distributed")||t.includes("Kademlia"),K=t=>t.includes("Redis"),_=t=>{const e=[];return t.links?.github&&e.push(`<a class="project-link" href="${t.links.github}" target="_blank" rel="noopener">${E.labels.links.github}</a>`),F(t.name)&&e.push('<button class="simulate-btn" type="button">Simulate</button>'),e.join("")},z=t=>Y(t.name)?`
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
        `:D(t.name)?`
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
        `:K(t.name)?`
          <div class="sim-visual" data-sim="redis">
            <svg width="260" height="90" viewBox="0 0 260 90">
              <line class="sim-link" x1="35" y1="22" x2="105" y2="22" />
              <line class="sim-link" x1="105" y1="22" x2="160" y2="22" />
              <line class="sim-link" x1="160" y1="22" x2="225" y2="22" />
              <line class="sim-link" x1="160" y1="22" x2="160" y2="64" />
              <line class="sim-link" x1="160" y1="64" x2="225" y2="64" />

              <circle class="sim-node" cx="35" cy="22" r="9" />
              <circle class="sim-node" cx="105" cy="22" r="9" />
              <circle class="sim-node" cx="160" cy="22" r="9" />
              <circle class="sim-node" cx="225" cy="22" r="9" />
              <circle class="sim-node" cx="160" cy="64" r="9" />
              <circle class="sim-node" cx="225" cy="64" r="9" />

              <circle class="sim-pulse" cx="35" cy="22" r="3">
                <animate attributeName="cx" values="35;105;160;225;160;225;160;105;35" dur="3.4s" repeatCount="indefinite" />
                <animate attributeName="cy" values="22;22;22;22;22;64;64;22;22" dur="3.4s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
        `:"";let E=L.en;const O=t=>(E=t,`
        <h2>${t.labels.headings.projects}</h2>
        ${t.projects.map(e=>`
              <div class="project-card">
                <div class="project-header">
                  <div>
                    <h3>${e.name}</h3>
                    <div class="project-tech">${e.tech.join(" · ")}</div>
                  </div>
                  <div class="project-actions">
                    ${_(e)}
                  </div>
                </div>
                ${e.impact?`<div class="project-impact"><strong>Impact:</strong> ${e.impact.replace(/^(?:Impact:\s*)+/i,"")}</div>`:""}
                <ul class="project-bullets">
                  ${e.bullets.map(s=>`<li>${s}</li>`).join("")}
                </ul>
                ${z(e)}
              </div>
            `).join("")}
      `),W=t=>`
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
      `,J=t=>`
        <h2>${t.labels.headings.education}</h2>
        <div class="meta-card">
          <h3>${t.education.title}</h3>
          <div class="tech-meta">${t.education.meta}</div>
          <ul>
            ${t.education.bullets.map(e=>`<li>${e}</li>`).join("")}
          </ul>
        </div>
      `,V=t=>`
        <h2>${t.labels.headings.skills}</h2>
        ${t.skills.map(e=>`
              <div class="meta-card">
                <h3>${e.category}</h3>
                <div class="tech-meta skills-line">${e.items.join(" · ")}</div>
              </div>
            `).join("")}
      `,G=t=>`
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
      `,Q=t=>{const s=(t.labels.connectTemplate||"Reach me at {email} or {phone}").replace("{email}",'<a href="mailto:riadmukh@gmail.com" target="_blank" rel="noopener">riadmukh@gmail.com</a>').replace("{phone}",'<a href="tel:+994508998676" target="_blank" rel="noopener"> +994 50 899 8676</a>');return`
        <h2>${t.labels.headings.connect}</h2>
        <p class="connect-text">${s}</p>
      `},U=t=>{const e=document.querySelector(".intro-name");e&&(e.setAttribute("aria-label",t),e.innerHTML="",Array.from(t).forEach((s,i)=>{const a=document.createElement("span");a.textContent=s===" "?" ":s,a.style.animationDelay=`${(.05+i*.08).toFixed(2)}s`,e.appendChild(a)}))},X=t=>{const e=L[t]||L.en;E=e,document.documentElement.lang=t,q&&(q.textContent=M[t]||"English");const s=document.querySelector("main section h1"),i=document.querySelector(".hero-links"),a=document.querySelector(".hero-cta .cta-btn"),d=document.querySelectorAll(".hero-tagline");if(s&&(s.textContent=e.hero.name),d.length){const n=e.hero.tagline.split(". "),l=n[0]?.trim()??"",j=n.slice(1).join(". ").trim();d[0].textContent=`${l}${l.endsWith(".")?"":"."}`,d[1]&&(d[1].textContent=j)}if(i){const n=i.querySelectorAll("a");n[0]&&(n[0].textContent=e.labels.links.resume,n[0].setAttribute("href",e.links.resume)),n[1]&&(n[1].textContent=e.labels.links.linkedin,n[1].setAttribute("href",e.links.linkedin)),n[2]&&(n[2].textContent=e.labels.links.github,n[2].setAttribute("href",e.links.github))}a&&(a.setAttribute("href",e.links.resume),a.innerHTML=`<svg class="cta-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v10m0 0l-4-4m4 4l4-4M5 20h14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"></path></svg>${e.labels.links.resume}`);const A=document.querySelector(".intro-phrase .lead");A&&(A.textContent=e.labels.introLead??""),U(e.hero.name);const S=document.querySelector(".side-links");if(S){const n=S.querySelectorAll("a");n[0]&&(n[0].textContent=e.labels.links.resume),n[1]&&(n[1].textContent=e.labels.links.linkedin),n[2]&&(n[2].textContent=e.labels.links.github)}const H=document.querySelectorAll(".side-nav a"),N=document.querySelectorAll(".mobile-menu a"),u=[e.labels.nav.education,e.labels.nav.experience,e.labels.nav.projects,e.labels.nav.teaching,e.labels.nav.skills,e.labels.nav.reading,e.labels.nav.connect];H.forEach((n,l)=>{u[l]&&(n.textContent=u[l])}),N.forEach((n,l)=>{u[l]&&(n.textContent=u[l])});const g=document.getElementById("experience"),b=document.getElementById("projects"),p=document.getElementById("teaching"),v=document.getElementById("education"),y=document.getElementById("skills"),f=document.getElementById("reading"),x=document.getElementById("connect");g&&(g.innerHTML=P(e)),b&&(b.innerHTML=O(e)),p&&(p.innerHTML=W(e)),v&&(v.innerHTML=J(e)),y&&(y.innerHTML=V(e)),f&&(f.innerHTML=G(e)),x&&(x.innerHTML=Q(e)),g?.setAttribute("data-label",e.labels.headings.experience),b?.setAttribute("data-label",e.labels.headings.projects),p?.setAttribute("data-label",e.labels.headings.teaching),v?.setAttribute("data-label",e.labels.headings.education),y?.setAttribute("data-label",e.labels.headings.skills),f?.setAttribute("data-label",e.labels.headings.reading),x?.setAttribute("data-label",e.labels.headings.connect),document.querySelectorAll(".simulate-btn").forEach(n=>{n.addEventListener("click",()=>{n.closest(".project-card")?.querySelector(".sim-visual")?.classList.toggle("active")})}),$()},h=document.querySelector(".lang-switcher");o?.addEventListener("click",()=>{const t=c?.classList.contains("open");c?.classList.toggle("open",!t),h?.classList.toggle("open",!t),o?.setAttribute("aria-expanded",String(!t))});c?.querySelectorAll("button").forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-lang")||"en",s=document.documentElement.lang||"en";if(e===s){c.classList.remove("open"),h?.classList.remove("open"),o?.setAttribute("aria-expanded","false");return}localStorage.setItem("portfolio-lang",e),c.classList.remove("open"),h?.classList.remove("open"),o?.setAttribute("aria-expanded","false"),window.location.reload()})});document.addEventListener("click",t=>{if(!c||!o)return;const e=t.target;e instanceof Node&&(c.contains(e)||o.contains(e))||(c.classList.remove("open"),h?.classList.remove("open"),o.setAttribute("aria-expanded","false"))});const Z=localStorage.getItem("portfolio-lang")||"en";X(Z);
