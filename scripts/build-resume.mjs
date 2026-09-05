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
    .replace(/~/g, '$\\sim$')
    .replace(/\^/g, '\\textasciicircum{}');

const bullets = (items) =>
  items.length
    ? `\\resumeItemListStart\n${items.map((b) => `  \\resumeItem{${esc(b)}}`).join('\n')}\n\\resumeItemListEnd`
    : '';

// Four roles, three bullets each: the page fits by cutting, not shrinking.
const experience = p.experience
  .slice(0, 4)
  .map(
    (e) =>
      `\\resumeSubheading{${esc(e.role)}}{${esc(e.period)}}{${esc(e.org)}}{${esc(e.location)}}\n${bullets(e.bullets.slice(0, 3))}`,
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
          `\\href{${url}}{\\textit{${esc(k === 'crates' ? 'crates.io' : k === 'github' ? 'GitHub' : 'docs.rs')}}}`,
      )
      .join(' ');
    const head = `\\textbf{${esc(pr.name)}} ${links}${links ? ' ' : ''}$|$ \\emph{${esc(pr.tech.join(', '))}}`;
    return `\\resumeProjectHeading{${head}}{${esc(pr.date ?? '')}}\n${bullets(pr.bullets.slice(0, 2))}`;
  })
  .join('\n');

const skills = p.skills
  .map((s) => `\\textbf{${esc(s.category)}}{: ${esc(s.groups.flatMap((g) => g.items).join(', '))}}`)
  .join(' \\\\\n');

const [eduDates, eduPlace] = p.education.meta.split(' · ');
const education = `\\resumeSubheading{${esc(p.education.title)}}{${esc(eduDates)}}{${esc(p.education.bullets.join(' '))}}{${esc(eduPlace)}}`;

const site = 'https://riad.cc';
const sha = (() => {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
      cwd: root,
      encoding: 'utf8',
    }).trim();
  } catch {
    return '';
  }
})();
const stamp = ['riad.cc/resume', sha, new Date().toISOString().slice(0, 10)]
  .filter(Boolean)
  .join(' · ');
const phoneHref = `tel:${p.resume.phone.replace(/[^+\d]/g, '')}`;

// The preamble is the one from resume.tex (Jake Gutierrez's template, MIT),
// with the pdfTeX-only glyph-to-unicode lines replaced by fontspec since
// tectonic drives XeTeX. XCharter is the bundle's Charter.
const tex = String.raw`\documentclass[letterpaper,11pt]{article}
\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage[usenames,dvipsnames]{xcolor}
\definecolor{accent}{HTML}{A8863D}
\usepackage{enumitem}
\usepackage[colorlinks=true, urlcolor=accent, linkcolor=accent]{hyperref}
\usepackage{fancyhdr}
\usepackage{tabularx}
\usepackage{fontspec}
\setmainfont{XCharter}[Extension=.otf,UprightFont=*-Roman,BoldFont=*-Bold,ItalicFont=*-Italic,BoldItalicFont=*-BoldItalic]
\pagestyle{fancy}
\fancyhf{}
\fancyfoot[C]{\raisebox{-14pt}{\tiny\color{gray}\href{${site}/resume/}{${esc(stamp)}}}}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}
\addtolength{\oddsidemargin}{-0.5in}
\addtolength{\evensidemargin}{-0.5in}
\addtolength{\textwidth}{1in}
\addtolength{\topmargin}{-.7in}
\addtolength{\textheight}{1.0in}
\urlstyle{same}
\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}
\titleformat{\section}{\vspace{-4pt}\scshape\raggedright\large\color{accent}}{}{0em}{}[\color{accent}\titlerule \vspace{-5pt}]
\newcommand{\resumeItem}[1]{\item\small{{#1 \vspace{-2pt}}}}
\newcommand{\resumeSubheading}[4]{\vspace{-2pt}\item
  \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
    \textbf{#1} & #2 \\
    \textit{\small#3} & \textit{\small #4} \\
  \end{tabular*}\vspace{-7pt}}
\newcommand{\resumeProjectHeading}[2]{\item
  \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
    \small#1 & #2 \\
  \end{tabular*}\vspace{-7pt}}
\renewcommand\labelitemii{$\vcenter{\hbox{\tiny$\bullet$}}$}
\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.15in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}
\begin{document}
\begin{center}
  \textbf{\Huge \scshape \textcolor{accent}{${esc(p.hero.name)}}} \\ \vspace{1pt}
  \small \href{${phoneHref}}{\underline{${esc(p.resume.phone)}}} $|$
  \href{mailto:${p.email}}{\underline{${esc(p.email)}}} $|$
  \href{${p.links.linkedin}}{\underline{LinkedIn}} $|$
  \href{${p.links.github}}{\underline{GitHub}} $|$
  \href{${site}}{\underline{riad.cc}}
\end{center}
\section{Experience}
\resumeSubHeadingListStart
${experience}
\resumeSubHeadingListEnd
\section{Education}
\resumeSubHeadingListStart
${education}
\resumeSubHeadingListEnd
\section{Projects}
\resumeSubHeadingListStart
${projects}
\resumeSubHeadingListEnd
\section{Technical Skills}
\begin{itemize}[leftmargin=0.15in, label={}]
\small{\item{
${skills}
}}
\end{itemize}
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
