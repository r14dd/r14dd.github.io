#!/usr/bin/env node
// Renders public/resume.pdf from the same profile data the site is built from.
// Runs before `astro build` (npm `prebuild`), so the PDF the site links to is
// never older than the words on the page.
//
// Requires `tectonic` on PATH. Node's native type stripping loads the .ts
// data modules directly; nothing is transpiled.

import { mkdtempSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { registerHooks } from 'node:module';

const root = fileURLToPath(new URL('..', import.meta.url));

// The data modules import each other without extensions (Vite resolves that;
// Node does not). Append .ts for relative specifiers that lack one.
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.') && !/\.[cm]?[jt]s$/.test(specifier)) specifier += '.ts';
    return next(specifier, context);
  },
});
const { profiles } = await import('../src/data/profile-i18n.ts');
const p = profiles.en;

// Escape the handful of characters LaTeX treats as syntax. Text is joined
// after escaping, so markup below never passes through here.
const esc = (s) =>
  String(s)
    .replace(/[\\{}]/g, (c) => `\\${c}`)
    .replace(/[&%$#_]/g, (c) => `\\${c}`)
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');

const bullets = (items) =>
  items.length
    ? `\\begin{tight}\n${items.map((b) => `  \\item ${esc(b)}`).join('\n')}\n\\end{tight}`
    : '';

const experience = p.experience
  .map(
    (e) =>
      `\\entry{${esc(e.role)}}{${esc(e.period)}}{${esc(e.org)}}{${esc(e.location)}}\n${bullets(e.bullets.slice(0, 3))}`,
  )
  .join('\n');

const byId = new Map(p.projects.map((pr) => [pr.id, pr]));
const projects = p.resume.projects
  .map((id) => {
    const pr = byId.get(id);
    if (!pr) throw new Error(`build-resume: resume.projects names unknown project "${id}"`);
    return pr;
  })
  .map((pr) => {
    const links = Object.entries(pr.links ?? {})
      .filter(([k]) => k !== 'demo')
      .map(
        ([k, url]) =>
          `\\href{${url}}{${esc(k === 'crates' ? 'crates.io' : k === 'github' ? 'GitHub' : 'docs.rs')}}`,
      )
      .join(' ');
    const head = `${esc(pr.name)}${links ? ` \\lnk{${links}}` : ''} \\tech{${esc(pr.tech.join(', '))}}`;
    return `\\project{${head}}{${esc(pr.date ?? '')}}\n${bullets(pr.bullets.slice(0, 2))}`;
  })
  .join('\n');

const skills = p.skills
  .map((s) => `\\textbf{${esc(s.category)}:} ${esc(s.groups.flatMap((g) => g.items).join(', '))}`)
  .join('\\\\\n');

const [eduDates, eduPlace] = p.education.meta.split(' · ');
const education = `\\entry{${esc(p.education.title)}}{${esc(eduDates)}}{${esc(p.education.bullets.join(' '))}}{${esc(eduPlace)}}`;

const site = 'https://riad.cc';
const tex = String.raw`\documentclass[10pt,letterpaper]{article}
\usepackage[margin=0.5in]{geometry}
\usepackage{fontspec}
\setmainfont{texgyretermes}[Extension=.otf,UprightFont=*-regular,BoldFont=*-bold,ItalicFont=*-italic,BoldItalicFont=*-bolditalic]
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage[hidelinks]{hyperref}
\usepackage{tabularx}
\pagestyle{empty}
\setlength{\parindent}{0pt}
\setlength{\tabcolsep}{0pt}
\titleformat{\section}{\large\scshape\raggedright}{}{0em}{}[\titlerule]
\titlespacing*{\section}{0pt}{5pt}{2pt}
\newlist{tight}{itemize}{1}
\setlist[tight]{label=\textbullet,leftmargin=1.2em,itemsep=0pt,topsep=1pt,parsep=0pt}
\newcommand{\entry}[4]{\vspace{2pt}\begin{tabularx}{\textwidth}{X r}\textbf{#1} & #2\\ #3 & #4\end{tabularx}}
\newcommand{\project}[2]{\vspace{2pt}\begin{tabularx}{\textwidth}{X r}\textbf{#1} & #2\end{tabularx}}
\newcommand{\lnk}[1]{{\small #1}}
\newcommand{\tech}[1]{{\small\textit{#1}}}
\begin{document}
\begin{center}
{\LARGE\scshape ${esc(p.hero.name)}}\\[3pt]
${esc(p.resume.phone)} \textbar{} \href{mailto:${p.email}}{${esc(p.email)}} \textbar{} \href{${p.links.linkedin}}{LinkedIn} \textbar{} \href{${p.links.github}}{GitHub} \textbar{} \href{${site}}{riad.cc}
\end{center}
\section{Experience}
${experience}
\section{Education}
${education}
\section{Projects}
${projects}
\section{Technical Skills}
${skills}
\end{document}
`;

const work = mkdtempSync(join(tmpdir(), 'resume-'));
try {
  writeFileSync(join(work, 'resume.tex'), tex);
  execFileSync('tectonic', ['--chatter', 'minimal', 'resume.tex'], { cwd: work, stdio: 'inherit' });
  copyFileSync(join(work, 'resume.pdf'), join(root, 'public/resume.pdf'));
  console.log('build-resume: wrote public/resume.pdf');
} finally {
  rmSync(work, { recursive: true, force: true });
}
