// @ts-nocheck — verbatim move of the (never type-checked) inline script.
// Section navigation: hash deep-links, side-nav active tracking, Lenis-aware
// smooth anchor scrolling, the mobile nav pill, and the hero parallax that
// shares the same rAF-throttled scroll handler.
import { prefersReducedMotion, scrollBehavior } from './motion';

export let navLinks = [];
export let mobileMenuLinks = [];
export let setActiveLink = () => {};
export let refreshActiveLink = () => {};
export let smoothScrollTo = (_el, _duration = 480) => {};

export const initNav = () => {
  const openFromHash = () => {
    const id = window.location.hash.replace('#', '');
    if (!id) return;
    const section = document.getElementById(id);
    if (!section) return;
    section.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
  };

  window.addEventListener('hashchange', openFromHash);
  window.addEventListener('load', openFromHash);

  const sections = Array.from(document.querySelectorAll('section[id]'));
  navLinks = Array.from(document.querySelectorAll('.side-nav a'));
  const mobileNav = document.getElementById('mobile-nav');
  const mobileLabel = document.getElementById('mobile-nav-label');
  const mobileMenu = document.getElementById('mobile-nav-menu');
  mobileMenuLinks = mobileMenu ? Array.from(mobileMenu.querySelectorAll('a')) : [];

  // Runs every scroll frame — DOM writes are gated on the active id actually
  // changing so a steady scroll doesn't mutate (and re-layout) per frame.
  let lastActiveId = null;
  setActiveLink = () => {
    const scrollPos = window.scrollY + 120;
    let current = sections[0];
    sections.forEach((section) => {
      if (section.offsetTop <= scrollPos) current = section;
    });
    if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 4) {
      current = sections[sections.length - 1];
    }
    if (current?.id === lastActiveId) return;
    lastActiveId = current?.id ?? null;
    navLinks.forEach((link) => link.classList.remove('active'));
    const active = navLinks.find((link) => link.getAttribute('href') === `#${current.id}`);
    active?.classList.add('active');

    if (mobileLabel && current?.id) {
      const mobileActive = mobileMenuLinks.find((a) => a.getAttribute('href') === `#${current.id}`);
      mobileLabel.textContent = mobileActive ? mobileActive.textContent : current.id;
      mobileMenuLinks.forEach((a) => a.classList.toggle('active', a === mobileActive));
    }
  };
  refreshActiveLink = () => {
    lastActiveId = null;
    setActiveLink();
  };

  smoothScrollTo = (el, duration = 480) => {
    const lenis = window.__lenis;
    if (lenis) {
      lenis.scrollTo(el, { offset: -24 });
      return;
    }
    const end = el.getBoundingClientRect().top + window.scrollY - 24;
    if (prefersReducedMotion) {
      window.scrollTo(0, end);
      return;
    }
    const start = window.scrollY;
    const startTime = performance.now();
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
    const step = (now) => {
      const elapsed = Math.min((now - startTime) / duration, 1);
      window.scrollTo(0, start + (end - start) * easeOutQuart(elapsed));
      if (elapsed < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.getAttribute('href')?.replace('#', '');
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      smoothScrollTo(target);
      history.pushState(null, '', `#${id}`);
    });
  });

  if (mobileNav) {
    const pill = document.getElementById('mobile-nav-pill');
    let hideTimer;
    const showNav = () => {
      if (window.scrollY > 200) mobileNav.classList.add('visible');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        if (!mobileNav.classList.contains('open')) mobileNav.classList.remove('visible');
      }, 2500);
    };
    let scrollTick = false;
    window.addEventListener(
      'scroll',
      () => {
        if (!scrollTick) {
          scrollTick = true;
          requestAnimationFrame(() => {
            scrollTick = false;
            if (window.scrollY <= 200) {
              mobileNav.classList.remove('visible');
              return;
            }
            showNav();
          });
        }
      },
      { passive: true },
    );

    pill?.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      if (mobileNav.classList.contains('open')) {
        mobileNav.classList.add('visible');
        clearTimeout(hideTimer);
      }
    });
    mobileMenuLinks.forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        mobileNav.classList.remove('open');
        const id = a.getAttribute('href')?.replace('#', '');
        if (!id) return;
        const target = document.getElementById(id);
        if (target) smoothScrollTo(target);
        history.pushState(null, '', `#${id}`);
      });
    });
    document.addEventListener('click', (e) => {
      if (!mobileNav.contains(e.target)) mobileNav.classList.remove('open');
    });
  }

  const heroEl = document.querySelector('main > section:first-of-type');
  const isTouch = window.matchMedia('(hover: none)').matches;
  if (isTouch && heroEl) {
    const h1 = heroEl.querySelector('h1');
    if (h1) h1.style.transform = '';
  }
  const updateParallax = () => {
    if (!heroEl || isTouch) return;
    const scrolled = window.scrollY;
    const h1 = heroEl.querySelector('h1');
    if (h1) h1.style.transform = `translateY(${scrolled * 0.12}px)`;
  };

  let scrollTicking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        setActiveLink();
        updateParallax();
        scrollTicking = false;
      });
    },
    { passive: true },
  );
  window.addEventListener('load', () => {
    setActiveLink();
    updateParallax();
  });
};
