// Fails when any tracked text file contains an em dash (U+2014). Riad does not
// want them anywhere: not in copy, not in comments, not in commit-adjacent
// docs. An en dash or a plain hyphen is fine.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const SKIP = [
  /^\.claude\//,
  /^graphify-out\//,
  /^wasm\//,
  /^public\/lab\/.*\.wasm$/,
  /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|pdf|wasm|mp3|ogg)$/i,
];

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter((f) => f && !SKIP.some((re) => re.test(f)));

const hits = [];
for (const f of files) {
  let text;
  try {
    text = readFileSync(f, 'utf8');
  } catch {
    continue;
  }
  if (!text.includes('\u2014')) continue;
  text.split('\n').forEach((line, i) => {
    if (line.includes('\u2014')) hits.push(`${f}:${i + 1}: ${line.trim().slice(0, 100)}`);
  });
}

if (hits.length) {
  console.error(`em dash found in ${hits.length} line(s):`);
  for (const h of hits) console.error('  ' + h);
  process.exit(1);
}
console.log(`no em dashes in ${files.length} tracked files`);
