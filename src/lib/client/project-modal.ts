// @ts-nocheck — verbatim move of the (never type-checked) inline script.
// Project modal: card click delegation (survives language re-renders),
// view-transition morph between card and modal, SMIL stripping under
// reduced motion, and the sim quick-look hand-off.
import { buildProjectSim, getLogoUrl as getLogoUrlJS, esc as escData } from '../builders';
import * as sfx from './sfx';
import * as focusTrap from './focus-trap';
import { fetchBadges } from './badges';
import { state } from './state';
import { openSimOverlay } from './sim-overlay';

export let closeProject = () => {};

export const initProjectModal = () => {
  const projBackdrop = document.getElementById('proj-backdrop');
  const projModal = document.getElementById('proj-modal');
  const projModalCard = document.getElementById('proj-modal-card');
  const projClose = document.getElementById('proj-close');
  let projLastCard = null;
  const PROJ_VT = 'proj-shared';
  const supportsVT = typeof document.startViewTransition === 'function';
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stripImpact = (s) => (s || '').replace(/^(?:Impact:\s*)+/i, '');

  const populateProject = (p) => {
    if (!projModalCard) return;
    const tech = (p.tech || [])
      .map((t) => {
        const logo = getLogoUrlJS(t);
        return logo
          ? `<span class="skill-badge-local"><img src="${logo}" alt="" aria-hidden="true" loading="lazy" />${escData(t)}</span>`
          : `<span class="feat-pill">${escData(t)}</span>`;
      })
      .join('');
    const bullets = (p.bullets || []).map((b) => `<li>${escData(b)}</li>`).join('');
    const sim = buildProjectSim(p, state.currentProfile?.labels?.simLegends);
    const ghLink = p.links?.github
      ? `<a class="feat-gh" href="${p.links.github}" target="_blank" rel="noopener"><svg class="gh-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>GitHub</a>`
      : '';
    const cratesLink = p.links?.crates
      ? `<a class="feat-gh" href="${p.links.crates}" target="_blank" rel="noopener"><svg class="gh-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .5 1 4v8l7 3.5L15 12V4L8 .5zm0 1.62 4.9 2.45L8 6.95 3.1 4.57 8 2.12zM2.5 5.6l4.8 2.4v5.9L2.5 11.5V5.6zm6.2 8.3V8l4.8-2.4v5.9l-4.8 2.4z"/></svg>crates.io</a>`
      : '';
    const docsLink = p.links?.docs
      ? `<a class="feat-gh" href="${p.links.docs}" target="_blank" rel="noopener"><svg class="gh-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M3.5 1A1.5 1.5 0 0 0 2 2.5v11A1.5 1.5 0 0 0 3.5 15H13a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3.5zM3 2.5a.5.5 0 0 1 .5-.5H13v9H3.5a1.5 1.5 0 0 0-.5.085V2.5zM3.5 12H13v2H3.5a.5.5 0 0 1 0-1zM5 4h6v1H5V4zm0 2.5h6v1H5v-1z"/></svg>docs.rs</a>`
      : '';
    const badgesHtml = (p.badges || [])
      .map(
        (b) =>
          `<span class="badge-stat proj-badge-live" data-badge-api="${b.api || ''}"><a class="feat-gh" href="${b.link || '#'}" target="_blank" rel="noopener"><span class="badge-count">—</span> ${b.pillLabel}</a> ${b.platform}</span>`,
      )
      .join(' ');
    const badgeBullet = badgesHtml ? `<li class="badge-bullet">${badgesHtml}</li>` : '';
    const actions =
      ghLink || cratesLink || docsLink
        ? `<div class="proj-card-actions proj-modal-actions">${ghLink}${cratesLink}${docsLink}</div>`
        : '';
    projModalCard.innerHTML = `
      <div class="proj-modal-head">
        <h3>${escData(p.name)}</h3>
      </div>
      ${actions}
      <div class="project-tech-pills">${tech}</div>
      ${p.impact ? `<div class="project-impact">${escData(stripImpact(p.impact))}</div>` : ''}
      ${bullets || badgeBullet ? `<ul class="project-bullets">${badgeBullet}${bullets}</ul>` : ''}
      ${sim}
    `;
    const sv = projModalCard.querySelector('.sim-visual');
    if (sv) {
      sv.classList.add('active');
      if (reduceMotion()) sv.querySelectorAll('animate').forEach((a) => a.remove());
    }
    fetchBadges(projModalCard);
  };

  const showProjModal = () => {
    sfx.whoosh(true);
    projBackdrop?.classList.add('open');
    projModal?.classList.add('open');
    projModal?.setAttribute('aria-hidden', 'false');
    projBackdrop?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('proj-lock');
    state.projOpen = true;
    if (projModal) focusTrap.activate(projModal);
    projClose?.focus();
  };

  const hideProjModal = () => {
    sfx.whoosh(false);
    projBackdrop?.classList.remove('open');
    projModal?.classList.remove('open');
    projModal?.setAttribute('aria-hidden', 'true');
    projBackdrop?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('proj-lock');
    state.projOpen = false;
    focusTrap.deactivate();
  };

  const openProject = (p, card) => {
    projLastCard = card;
    if (!supportsVT || reduceMotion()) {
      populateProject(p);
      showProjModal();
      return;
    }
    card.style.transform = '';
    card.style.viewTransitionName = PROJ_VT;
    const t = document.startViewTransition(() => {
      card.style.viewTransitionName = '';
      populateProject(p);
      showProjModal();
      projModalCard.style.viewTransitionName = PROJ_VT;
    });
    t.finished.finally(() => {
      if (projModalCard) projModalCard.style.viewTransitionName = '';
    });
  };

  closeProject = () => {
    if (!state.projOpen) return;
    if (!supportsVT || reduceMotion()) {
      hideProjModal();
      return;
    }
    projModalCard.style.viewTransitionName = PROJ_VT;
    const t = document.startViewTransition(() => {
      projModalCard.style.viewTransitionName = '';
      hideProjModal();
      if (projLastCard) projLastCard.style.viewTransitionName = PROJ_VT;
    });
    t.finished.finally(() => {
      if (projLastCard) projLastCard.style.viewTransitionName = '';
    });
  };

  const projectsSection = document.getElementById('projects');
  projectsSection?.addEventListener('click', (e) => {
    const card = e.target.closest?.('.proj-card');
    if (!card || !projectsSection.contains(card)) return;
    const simBtn = e.target.closest?.('.sim-toggle');
    if (simBtn) {
      openSimOverlay(card);
      return;
    }
    if (e.target.closest('a, button')) return;
    const sel = window.getSelection?.();
    if (sel && sel.toString().length > 0) return;
    const title = card.querySelector('h3')?.textContent?.trim();
    const p = (state.currentProfile?.projects || state.I18N.en.projects || []).find(
      (x) => x.name === title,
    );
    if (p) openProject(p, card);
  });
  projectsSection?.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest?.('.proj-card');
    if (!card || !projectsSection.contains(card)) return;
    e.preventDefault();
    const title = card.querySelector('h3')?.textContent?.trim();
    const p = (state.currentProfile?.projects || state.I18N.en.projects || []).find(
      (x) => x.name === title,
    );
    if (p) openProject(p, card);
  });
  projBackdrop?.addEventListener('click', closeProject);
  projClose?.addEventListener('click', closeProject);
};
