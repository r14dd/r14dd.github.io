const N=document.getElementById("i18n-data"),A=N?JSON.parse(N.textContent||"{}"):{},F={en:"English",ru:"Русский",az:"Azərbaycanca",es:"Español"},H=()=>{const t=window.location.hash.replace("#","");if(!t)return;const e=document.getElementById(t);e&&e.scrollIntoView({behavior:"smooth",block:"start"})};window.addEventListener("hashchange",H);window.addEventListener("load",H);const k=Array.from(document.querySelectorAll("section[id]")),I=Array.from(document.querySelectorAll(".side-nav a")),$=document.querySelector(".mobile-current"),j=()=>{const t=window.scrollY+120;let e=k[0];k.forEach(l=>{l.offsetTop<=t&&(e=l)}),window.scrollY+window.innerHeight>=document.body.scrollHeight-4&&(e=k[k.length-1]),I.forEach(l=>l.classList.remove("active"));const n=I.find(l=>l.getAttribute("href")===`#${e.id}`);if(n?.classList.add("active"),$){const l=n?.textContent??e.getAttribute("data-label")??e.id;$.textContent=l,$.classList.add("active")}},R=()=>{const t=document.getElementById("scroll-progress");if(!t)return;const e=document.body.scrollHeight-window.innerHeight,n=e>0?window.scrollY/e*100:0;t.style.height=`${n}%`},P=()=>{const t=document.querySelector(".side-nav"),e=document.querySelector(".side-links");if(!t&&!e)return;const n=window.scrollY>40;t?.classList.toggle("blurred",n),e?.classList.toggle("blurred",n)};document.querySelectorAll(".side-nav a, .mobile-menu a").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault();const n=t.getAttribute("href")?.replace("#","");if(!n)return;const l=document.getElementById(n);l&&(l.scrollIntoView({behavior:"smooth",block:"start"}),history.pushState(null,"",`#${n}`))})});window.addEventListener("scroll",()=>{j(),R(),P()});window.addEventListener("load",()=>{j(),R(),P()});document.querySelectorAll(".simulate-btn").forEach(t=>{t.addEventListener("click",()=>{t.closest(".project-card")?.querySelector(".sim-visual")?.classList.toggle("active")})});const Y=document.querySelector(".hamburger"),w=document.querySelector(".mobile-menu");Y?.addEventListener("click",()=>{w?.classList.toggle("open"),w?.setAttribute("aria-hidden",w.classList.contains("open")?"false":"true")});w?.querySelectorAll("a").forEach(t=>{t.addEventListener("click",()=>{w.classList.remove("open"),w.setAttribute("aria-hidden","true")})});const f=document.getElementById("lang-toggle"),p=document.getElementById("lang-menu"),B=document.getElementById("lang-current"),O=t=>`
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
      `,X=t=>t.includes("RAFT")||t.includes("Raft")||t.includes("Hash Table")||t.includes("Distributed")||t.includes("Kademlia")||t.includes("Redis"),_=t=>t.includes("RAFT")||t.includes("Raft"),G=t=>t.includes("Hash Table")||t.includes("Distributed")||t.includes("Kademlia"),K=t=>t.includes("Redis"),W=t=>{const e=[];return t.links?.github&&e.push(`<a class="project-link" href="${t.links.github}" target="_blank" rel="noopener">${q.labels.links.github}</a>`),X(t.name)&&e.push('<button class="simulate-btn" type="button">Simulate</button>'),e.join("")},V=t=>_(t.name)?`
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
        `:G(t.name)?`
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
        `:K(t.name)?`
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
        `:"";let q=A.en;const z=t=>(q=t,`
        <h2>${t.labels.headings.projects}</h2>
        ${t.projects.map(e=>`
              <div class="project-card">
                <div class="project-header">
                  <div>
                    <h3>${e.name}</h3>
                    <div class="project-tech">${e.tech.join(" · ")}</div>
                  </div>
                  <div class="project-actions">
                    ${W(e)}
                  </div>
                </div>
                ${e.impact?`<div class="project-impact"><strong>Impact:</strong> ${e.impact.replace(/^(?:Impact:\s*)+/i,"")}</div>`:""}
                <ul class="project-bullets">
                  ${e.bullets.map(n=>`<li>${n}</li>`).join("")}
                </ul>
                ${V(e)}
              </div>
            `).join("")}
      `),J=t=>`
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
      `,U=t=>`
        <h2>${t.labels.headings.education}</h2>
        <div class="meta-card">
          <h3>${t.education.title}</h3>
          <div class="tech-meta">${t.education.meta}</div>
          <ul>
            ${t.education.bullets.map(e=>`<li>${e}</li>`).join("")}
          </ul>
        </div>
      `,Q=t=>`
        <h2>${t.labels.headings.skills}</h2>
        ${t.skills.map(e=>`
              <div class="meta-card">
                <h3>${e.category}</h3>
                <div class="tech-meta skills-line">${e.items.join(" · ")}</div>
              </div>
            `).join("")}
      `,Z=t=>`
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
      `,ee=t=>{const n=(t.labels.connectTemplate||"Reach me at {email} or {phone}").replace("{email}",'<a href="mailto:riadmukh@gmail.com" target="_blank" rel="noopener">riadmukh@gmail.com</a>').replace("{phone}",'<a href="tel:+994508998676" target="_blank" rel="noopener"> +994 50 899 8676</a>');return`
        <h2>${t.labels.headings.connect}</h2>
        <p class="connect-text">${n}</p>
      `},te=t=>{const e=document.querySelector(".intro-name");e&&(e.setAttribute("aria-label",t),e.innerHTML="",Array.from(t).forEach((n,l)=>{const g=document.createElement("span");g.textContent=n===" "?" ":n,g.style.animationDelay=`${(.05+l*.08).toFixed(2)}s`,e.appendChild(g)}))},se=t=>{const e=A[t]||A.en;q=e,document.documentElement.lang=t,B&&(B.textContent=F[t]||"English");const n=document.querySelector("main section h1"),l=document.querySelector(".hero-links"),g=document.querySelector(".hero-cta .cta-btn"),v=document.querySelectorAll(".hero-tagline");if(n&&(n.textContent=e.hero.name),v.length){const s=e.hero.tagline.split(". "),c=s[0]?.trim()??"",y=s.slice(1).join(". ").trim();v[0].textContent=`${c}${c.endsWith(".")?"":"."}`,v[1]&&(v[1].textContent=y)}if(l){const s=l.querySelectorAll("a");s[0]&&(s[0].textContent=e.labels.links.resume,s[0].setAttribute("href",e.links.resume)),s[1]&&(s[1].textContent=e.labels.links.linkedin,s[1].setAttribute("href",e.links.linkedin)),s[2]&&(s[2].textContent=e.labels.links.github,s[2].setAttribute("href",e.links.github))}g&&(g.setAttribute("href",e.links.resume),g.innerHTML=`<svg class="cta-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v10m0 0l-4-4m4 4l4-4M5 20h14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"></path></svg>${e.labels.links.resume}`);const i=document.querySelector(".intro-phrase");if(i){const s=i.querySelectorAll(".lead"),c=!!e.labels.introLead,y=!!e.labels.introTail;if(s.length===0&&(c||y)){if(c){const u=document.createElement("span");u.className="lead",u.textContent=e.labels.introLead,i.insertBefore(u,i.firstChild)}if(y){const u=document.createElement("span");u.className="lead",u.textContent=e.labels.introTail,i.appendChild(u)}}else if(s.length===1){if(c&&!y)i.insertBefore(s[0],i.querySelector(".intro-name")),s[0].textContent=e.labels.introLead;else if(!c&&y)i.appendChild(s[0]),s[0].textContent=e.labels.introTail;else if(c&&y){s[0].textContent=e.labels.introLead,i.insertBefore(s[0],i.querySelector(".intro-name"));const u=document.createElement("span");u.className="lead",u.textContent=e.labels.introTail,i.appendChild(u)}}else s.length>=2&&(c?(s[0].textContent=e.labels.introLead,s[0].style.display=""):s[0].style.display="none",y?(s[s.length-1].textContent=e.labels.introTail,s[s.length-1].style.display=""):s[s.length-1].style.display="none")}te(e.hero.name);const a=document.querySelector(".side-links");if(a){const s=a.querySelectorAll("a");s[0]&&(s[0].textContent=e.labels.links.resume),s[1]&&(s[1].textContent=e.labels.links.linkedin),s[2]&&(s[2].textContent=e.labels.links.github)}const o=document.querySelectorAll(".side-nav a"),r=document.querySelectorAll(".mobile-menu a"),m=[e.labels.nav.education,e.labels.nav.experience,e.labels.nav.projects,e.labels.nav.teaching,e.labels.nav.skills,e.labels.nav.reading,e.labels.nav.connect];o.forEach((s,c)=>{m[c]&&(s.textContent=m[c])}),r.forEach((s,c)=>{m[c]&&(s.textContent=m[c])});const d=document.getElementById("experience"),h=document.getElementById("projects"),x=document.getElementById("teaching"),b=document.getElementById("education"),E=document.getElementById("skills"),C=document.getElementById("reading"),S=document.getElementById("connect");d&&(d.innerHTML=O(e)),h&&(h.innerHTML=z(e)),x&&(x.innerHTML=J(e)),b&&(b.innerHTML=U(e)),E&&(E.innerHTML=Q(e)),C&&(C.innerHTML=Z(e)),S&&(S.innerHTML=ee(e)),d?.setAttribute("data-label",e.labels.headings.experience),h?.setAttribute("data-label",e.labels.headings.projects),x?.setAttribute("data-label",e.labels.headings.teaching),b?.setAttribute("data-label",e.labels.headings.education),E?.setAttribute("data-label",e.labels.headings.skills),C?.setAttribute("data-label",e.labels.headings.reading),S?.setAttribute("data-label",e.labels.headings.connect),document.querySelectorAll(".simulate-btn").forEach(s=>{s.addEventListener("click",()=>{s.closest(".project-card")?.querySelector(".sim-visual")?.classList.toggle("active")})}),j()},L=document.querySelector(".lang-switcher");f?.addEventListener("click",()=>{const t=p?.classList.contains("open");p?.classList.toggle("open",!t),L?.classList.toggle("open",!t),f?.setAttribute("aria-expanded",String(!t))});p?.querySelectorAll("button").forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-lang")||"en",n=document.documentElement.lang||"en";if(e===n){p.classList.remove("open"),L?.classList.remove("open"),f?.setAttribute("aria-expanded","false");return}localStorage.setItem("portfolio-lang",e),p.classList.remove("open"),L?.classList.remove("open"),f?.setAttribute("aria-expanded","false"),window.location.reload()})});document.addEventListener("click",t=>{if(!p||!f)return;const e=t.target;e instanceof Node&&(p.contains(e)||f.contains(e))||(p.classList.remove("open"),L?.classList.remove("open"),f.setAttribute("aria-expanded","false"))});const ie=localStorage.getItem("portfolio-lang")||"en";se(ie);const T=document.getElementById("theme-toggle"),M=T?.querySelector(".theme-icon"),D=()=>{const t=document.documentElement.classList.contains("light");M&&(M.textContent=t?"🌙":"☀️"),T?.setAttribute("aria-label",t?"Switch to dark mode":"Switch to light mode")};T?.addEventListener("click",()=>{document.documentElement.classList.toggle("light");const t=document.documentElement.classList.contains("light");localStorage.setItem("portfolio-theme",t?"light":"dark"),D()});D();const ne=window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(!ne){const t=new WeakSet,e=()=>{document.querySelectorAll(".project-card, .meta-card").forEach(i=>{t.has(i)||(t.add(i),i.addEventListener("mousemove",a=>{const o=i.getBoundingClientRect(),r=a.clientX-o.left,m=a.clientY-o.top,d=o.width/2,h=o.height/2,x=(m-h)/h*-4,b=(r-d)/d*4;i.style.transform=`perspective(600px) rotateX(${x}deg) rotateY(${b}deg)`,i.style.setProperty("--spot-x",`${r}px`),i.style.setProperty("--spot-y",`${m}px`)}),i.addEventListener("mouseleave",()=>{i.style.transform=""}))})};e();const n=document.querySelector(".content");n&&new MutationObserver(()=>e()).observe(n,{childList:!0,subtree:!0});const l=new WeakSet,g=i=>{const a=i.textContent;if(!a||!a.trim())return;const o=a.length,r=400/o;let m=0;i.textContent="";const d=()=>{i.textContent=a.slice(0,++m),m<o&&setTimeout(d,r)};d()};document.querySelectorAll("section[id]").forEach(i=>{new MutationObserver((a,o)=>{if(i.classList.contains("section-revealed")){const r=i.querySelector("h2");r&&!l.has(r)&&(l.add(r),g(r)),o.disconnect()}}).observe(i,{attributes:!0,attributeFilter:["class"]})});const v=document.querySelectorAll(".side-nav a, .side-links a, .theme-toggle, .lang-toggle, .cta-btn");document.addEventListener("mousemove",i=>{v.forEach(a=>{const o=a.getBoundingClientRect(),r=o.left+o.width/2,m=o.top+o.height/2,d=i.clientX-r,h=i.clientY-m,x=Math.sqrt(d*d+h*h);if(x<50){const b=(1-x/50)*.35;a.style.transform=`translate(${d*b}px, ${h*b}px)`}else a.style.transform&&(a.style.transform="")})})}
