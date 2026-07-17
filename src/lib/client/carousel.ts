let carouselTimer: ReturnType<typeof setInterval> | null = null;
let carouselAbort: AbortController | null = null;
let scrollEndTimer: ReturnType<typeof setTimeout> | null = null;
let hintObs: IntersectionObserver | null = null;
let autoObs: IntersectionObserver | null = null;
const DOT_COUNT = 5;

export function initCarousel() {
  if (carouselTimer) clearInterval(carouselTimer);
  if (scrollEndTimer) clearTimeout(scrollEndTimer);
  if (carouselAbort) carouselAbort.abort();
  carouselAbort = new AbortController();
  const signal = carouselAbort.signal;
  const scroll = document.getElementById('testi-scroll');
  const dotsEl = document.getElementById('car-dots');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  if (!scroll || !dotsEl) return;

  const realCards = Array.from(scroll.querySelectorAll('.testi-card'));
  const count = realCards.length;
  if (count < 2) return;

  const firstClone = realCards[0].cloneNode(true) as HTMLElement;
  const lastClone = realCards[count - 1].cloneNode(true) as HTMLElement;
  firstClone.setAttribute('aria-hidden', 'true');
  lastClone.setAttribute('aria-hidden', 'true');
  firstClone.classList.add('clone');
  lastClone.classList.add('clone');
  scroll.appendChild(firstClone);
  scroll.insertBefore(lastClone, realCards[0]);

  const allSlides = Array.from(scroll.children) as HTMLElement[];
  const getSlideWidth = () => {
    const gap = parseFloat(getComputedStyle(scroll).gap) || 0;
    return allSlides[0].offsetWidth + gap;
  };

  scroll.style.scrollBehavior = 'auto';
  scroll.scrollLeft = getSlideWidth();
  scroll.style.scrollBehavior = '';

  dotsEl.innerHTML = '';
  for (let i = 0; i < DOT_COUNT; i++) {
    const d = document.createElement('div');
    d.className = 'car-dot' + (i === 0 ? ' on' : '');
    d.addEventListener('click', () => {
      const cardIdx = Math.round(i / (DOT_COUNT - 1) * (count - 1));
      goTo(cardIdx);
    }, { signal });
    dotsEl.appendChild(d);
  }

  const scrollToPhysical = (physIdx: number, smooth = true) => {
    const sw = getSlideWidth();
    scroll.scrollTo({ left: sw * physIdx, behavior: smooth ? 'smooth' : 'auto' });
  };

  const goTo = (logicalIdx: number) => {
    scrollToPhysical(logicalIdx + 1, true);
  };

  const getLogicalIndex = () => {
    const sw = getSlideWidth();
    const physIdx = Math.round(scroll.scrollLeft / sw);
    return ((physIdx - 1) % count + count) % count;
  };

  const cardToDot = (cardIdx: number) => Math.round(cardIdx / (count - 1) * (DOT_COUNT - 1));

  const syncDots = () => {
    const logical = getLogicalIndex();
    const dotIdx = cardToDot(logical);
    dotsEl.querySelectorAll('.car-dot').forEach((d, j) => d.classList.toggle('on', j === dotIdx));
    return logical;
  };

  let teleporting = false;
  const checkTeleport = () => {
    if (teleporting) return;
    const sw = getSlideWidth();
    const physIdx = Math.round(scroll.scrollLeft / sw);
    if (physIdx === 0) {
      teleporting = true;
      scroll.style.scrollBehavior = 'auto';
      scroll.scrollLeft = sw * count;
      scroll.style.scrollBehavior = '';
      teleporting = false;
    } else if (physIdx === allSlides.length - 1) {
      teleporting = true;
      scroll.style.scrollBehavior = 'auto';
      scroll.scrollLeft = sw;
      scroll.style.scrollBehavior = '';
      teleporting = false;
    }
    syncDots();
  };

  let scrollTick = false;
  scroll.addEventListener('scroll', () => {
    if (teleporting) return;
    if (!scrollTick) {
      scrollTick = true;
      requestAnimationFrame(() => { syncDots(); scrollTick = false; });
    }
    if (scrollEndTimer) clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(checkTeleport, 80);
  }, { passive: true, signal });

  prevBtn?.addEventListener('click', () => {
    const sw = getSlideWidth();
    scroll.scrollBy({ left: -sw, behavior: 'smooth' });
    if (scrollEndTimer) clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(checkTeleport, 400);
  }, { signal });
  nextBtn?.addEventListener('click', () => {
    const sw = getSlideWidth();
    scroll.scrollBy({ left: sw, behavior: 'smooth' });
    if (scrollEndTimer) clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(checkTeleport, 400);
  }, { signal });

  const wrap = scroll.closest('[aria-roledescription="carousel"]');
  if (wrap) {
    wrap.addEventListener('keydown', (e) => {
      const sw = getSlideWidth();
      if ((e as KeyboardEvent).key === 'ArrowLeft') { e.preventDefault(); scroll.scrollBy({ left: -sw, behavior: 'smooth' }); if (scrollEndTimer) clearTimeout(scrollEndTimer); scrollEndTimer = setTimeout(checkTeleport, 400); }
      else if ((e as KeyboardEvent).key === 'ArrowRight') { e.preventDefault(); scroll.scrollBy({ left: sw, behavior: 'smooth' }); if (scrollEndTimer) clearTimeout(scrollEndTimer); scrollEndTimer = setTimeout(checkTeleport, 400); }
    }, { signal });
  }

  const startAutoplay = () => {
    if (carouselTimer) clearInterval(carouselTimer);
    carouselTimer = setInterval(() => {
      const sw = getSlideWidth();
      scroll.scrollBy({ left: sw, behavior: 'smooth' });
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(checkTeleport, 400);
    }, 13000);
  };

  let hintDone = false;
  const runHint = () => {
    if (hintDone) return;
    hintDone = true;
    const sw = getSlideWidth();
    let step = 0;
    const hintNext = () => {
      step++;
      if (step < count) {
        scroll.scrollBy({ left: sw, behavior: 'smooth' });
        if (scrollEndTimer) clearTimeout(scrollEndTimer);
        scrollEndTimer = setTimeout(() => { checkTeleport(); hintNext(); }, 320);
      } else {
        scroll.style.scrollBehavior = 'auto';
        scroll.scrollLeft = sw;
        scroll.style.scrollBehavior = '';
        syncDots();
        startAutoplay();
      }
    };
    hintNext();
  };

  const recsSection = document.getElementById('recommendations');
  if (recsSection) {
    // initCarousel re-runs on every language switch against the persistent
    // #recommendations element — disconnect the previous pair so stale
    // closures (holding detached carousel nodes) stop firing.
    hintObs?.disconnect();
    autoObs?.disconnect();
    hintObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        hintObs?.disconnect();
        setTimeout(runHint, 400);
      }
    }, { threshold: 0.3 });
    hintObs.observe(recsSection);
    autoObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { if (!carouselTimer) startAutoplay(); }
      else { if (carouselTimer) clearInterval(carouselTimer); carouselTimer = null; }
    }, { threshold: 0 });
    autoObs.observe(recsSection);
  } else {
    startAutoplay();
  }
}
