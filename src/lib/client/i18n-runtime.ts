// @ts-nocheck — verbatim move of the (never type-checked) inline script.
// Trilingual runtime: only EN ships inline (#i18n-data); RU/AZ load once from
// the static /i18n endpoints. applyLanguage re-renders every section through
// the shared builders and re-syncs nav labels, hero, terminal roles, and the
// carousel. Selected language persists in localStorage.
import {
  buildExperience,
  buildProjects,
  buildTeaching,
  buildEducation,
  buildSkills,
  buildRecommendations,
  buildConnect,
} from '../builders';
import * as timeAware from './time-aware';
import { renderSpotify } from './spotify';
import { initCarousel } from './carousel';
import { fetchBadges } from './badges';
import { state } from './state';
import { weightReveal } from './hero-reveal';
import { typeH2 } from './reveal-fx';
import { navLinks, mobileMenuLinks, setActiveLink, refreshActiveLink } from './nav';

export const initI18n = () => {
  const i18nEl = document.getElementById('i18n-data');
  try {
    state.I18N = i18nEl ? JSON.parse(i18nEl.textContent || '{}') : {};
  } catch {
    state.I18N = {};
  }
  const I18N = state.I18N;
  const languageLabels = {
    en: 'English',
    ru: 'Русский',
    az: 'Azərbaycanca',
  };

  const langToggle = document.getElementById('lang-toggle');
  const langMenu = document.getElementById('lang-menu');
  const langCurrent = document.getElementById('lang-current');

  state.currentProfile = I18N.en;

  // Only EN ships inline; other locales load once from the static endpoint.
  const ensureLang = async (lang) => {
    if (I18N[lang]) return I18N[lang];
    const res = await fetch(`/i18n/${lang}.json`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`i18n ${lang}: ${res.status}`);
    I18N[lang] = await res.json();
    return I18N[lang];
  };

  const applyLanguage = async (lang) => {
    let data;
    try {
      data = await ensureLang(lang);
    } catch (err) {
      console.warn('i18n fetch failed, falling back to en', err);
      lang = 'en';
      data = I18N.en;
    }
    state.currentProfile = data;
    window._termProfile = data;
    document.documentElement.lang = lang;
    if (langCurrent) langCurrent.textContent = languageLabels[lang] || 'English';

    const heroTitle = document.querySelector('main section h1');
    const heroLinks = document.querySelector('.hero-links');
    if (heroTitle) weightReveal(heroTitle, data.hero.name);
    timeAware.apply(data);
    const heroAbout = document.getElementById('hero-about');
    if (heroAbout) {
      const isFirstAbout = !heroAbout.dataset.applied;
      heroAbout.dataset.applied = '1';
      if (isFirstAbout && lang === 'en') {
        // SSR text is already visible — skip the word-gen animation to avoid hiding the LCP element
      } else if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        heroAbout.innerHTML = data.about
          .split(' ')
          .map((w) => `<span class="word-gen">${w}</span>`)
          .join(' ');
        heroAbout.querySelectorAll('.word-gen').forEach((w, i) => {
          setTimeout(() => w.classList.add('revealed'), 60 + i * 30);
        });
      } else {
        heroAbout.textContent = data.about;
      }
    }
    const t = data.labels.terminal;
    const tr1 = document.getElementById('term-role1');
    const tr2 = document.getElementById('term-role2');
    const ts1 = document.getElementById('term-stat1');
    const ts2 = document.getElementById('term-stat2');
    const ts3 = document.getElementById('term-stat3');
    if (tr1) tr1.textContent = t.role1;
    if (tr2) tr2.textContent = t.role2;
    const wrapNum = (s) => s.replace(/^([\d.,+Kk]+)/, '<span class="term-stat-num">$1</span>');
    if (ts1) ts1.innerHTML = wrapNum(t.stat1);
    if (ts2) ts2.innerHTML = wrapNum(t.stat2);
    if (ts3) ts3.innerHTML = wrapNum(t.stat3);
    if (heroLinks) {
      const links = heroLinks.querySelectorAll('a');
      // Replace only the text node so the inline SVG icon survives re-render
      const setLinkLabel = (link, label) => {
        for (const node of link.childNodes) {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            node.textContent = label;
            return;
          }
        }
        link.appendChild(document.createTextNode(label));
      };
      if (links[0]) {
        setLinkLabel(links[0], data.labels.links.linkedin);
        links[0].setAttribute('href', data.links.linkedin);
      }
      if (links[1]) {
        setLinkLabel(links[1], data.labels.links.github);
        links[1].setAttribute('href', data.links.github);
      }
      if (links[3]) {
        setLinkLabel(links[3], data.labels.links.resume);
        links[3].setAttribute('href', data.links.resume);
      }
    }

    const sideLinks = document.querySelector('.side-links');
    if (sideLinks) {
      const heading = document.getElementById('side-links-heading');
      if (heading) heading.textContent = data.labels.links.heading;
      const links = sideLinks.querySelectorAll('a');
      if (links[0]) links[0].textContent = data.labels.links.linkedin;
      if (links[1]) links[1].textContent = data.labels.links.github;
      if (links[3]) {
        links[3].textContent = data.labels.links.resume;
        links[3].setAttribute('href', data.links.resume);
      }
    }

    if (window._spotifyData) renderSpotify(window._spotifyData);

    const labels = [
      data.labels.nav.education,
      data.labels.nav.experience,
      data.labels.nav.projects,
      data.labels.nav.skills,
      data.labels.nav.teaching,
      data.labels.nav.recommendations,
      data.labels.nav.connect,
    ];
    navLinks.forEach((link, idx) => {
      if (labels[idx]) link.textContent = labels[idx];
    });
    mobileMenuLinks.forEach((link, idx) => {
      if (labels[idx]) link.textContent = labels[idx];
    });
    setActiveLink();

    const expSection = document.getElementById('experience');
    const projSection = document.getElementById('projects');
    const teachSection = document.getElementById('teaching');
    const eduSection = document.getElementById('education');
    const skillsSection = document.getElementById('skills');
    const recsSection = document.getElementById('recommendations');
    const connectSection = document.getElementById('connect');

    if (expSection) expSection.innerHTML = buildExperience(data);
    if (projSection) {
      projSection.innerHTML = buildProjects(data);
      fetchBadges(projSection);
    }
    if (teachSection) teachSection.innerHTML = buildTeaching(data);
    if (eduSection) eduSection.innerHTML = buildEducation(data);
    if (skillsSection) skillsSection.innerHTML = buildSkills(data);
    if (recsSection) recsSection.innerHTML = buildRecommendations(data);
    if (connectSection) connectSection.innerHTML = buildConnect(data);

    [
      expSection,
      projSection,
      teachSection,
      eduSection,
      skillsSection,
      recsSection,
      connectSection,
    ].forEach((sec) => {
      if (!sec) return;
      if (!sec.classList.contains('section-revealed')) return;
      const h2 = sec.querySelector('h2');
      if (h2) typeH2(h2);
    });

    expSection?.setAttribute('data-label', data.labels.headings.experience);
    projSection?.setAttribute('data-label', data.labels.headings.projects);
    teachSection?.setAttribute('data-label', data.labels.headings.teaching);
    eduSection?.setAttribute('data-label', data.labels.headings.education);
    skillsSection?.setAttribute('data-label', data.labels.headings.skills);
    recsSection?.setAttribute('data-label', data.labels.headings.recommendations);
    connectSection?.setAttribute('data-label', data.labels.headings.connect);

    initCarousel();

    refreshActiveLink();
  };

  const langWrapper = document.querySelector('.lang-switcher');
  langToggle?.addEventListener('click', () => {
    const isOpen = langMenu?.classList.contains('open');
    langMenu?.classList.toggle('open', !isOpen);
    langWrapper?.classList.toggle('open', !isOpen);
    langToggle?.setAttribute('aria-expanded', String(!isOpen));
  });

  let langSwitchTimer = null;
  langMenu?.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang') || 'en';
      const current = document.documentElement.lang || 'en';
      if (lang === current) {
        langMenu.classList.remove('open');
        langWrapper?.classList.remove('open');
        langToggle?.setAttribute('aria-expanded', 'false');
        return;
      }
      localStorage.setItem('portfolio-lang', lang);
      langMenu
        .querySelectorAll('[role="menuitemradio"]')
        .forEach((b) => b.setAttribute('aria-checked', b === btn ? 'true' : 'false'));
      langMenu.classList.remove('open');
      langWrapper?.classList.remove('open');
      langToggle?.setAttribute('aria-expanded', 'false');
      clearTimeout(langSwitchTimer);
      document.body.classList.add('lang-switching');
      ensureLang(lang).catch(() => {}); // warm the locale cache during the fade
      langSwitchTimer = setTimeout(async () => {
        await applyLanguage(lang);
        document.body.classList.remove('lang-switching');
        langSwitchTimer = null;
      }, 200);
    });
  });

  document.addEventListener('click', (event) => {
    if (!langMenu || !langToggle) return;
    const target = event.target;
    if (target instanceof Node && (langMenu.contains(target) || langToggle.contains(target)))
      return;
    langMenu.classList.remove('open');
    langWrapper?.classList.remove('open');
    langToggle.setAttribute('aria-expanded', 'false');
  });

  const savedLang = localStorage.getItem('portfolio-lang') || 'en';
  applyLanguage(savedLang);
};
