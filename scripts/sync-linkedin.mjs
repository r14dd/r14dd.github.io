// Pulls Riad's own LinkedIn posts into src/data/linkedin-posts.json.
//
// LinkedIn has no public API for a member's posts, and www.linkedin.com
// answers bots with a 999. The regional az. host still serves the public
// profile and each post page to link-preview crawlers, which is all this
// needs. Run `npm run sync:linkedin`, review the JSON diff, commit it. The
// build never calls LinkedIn, so a blocked fetch can't break a deploy.

import { writeFileSync } from 'node:fs';

const PROFILE = 'https://az.linkedin.com/in/riadmukhtarov';
const OWN_POST = /https:\/\/www\.linkedin\.com\/posts\/riadmukhtarov_[^"?&]+/g;
const OUT = new URL('../src/data/linkedin-posts.json', import.meta.url);

const get = async (url) => {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Twitterbot/1.0', 'Accept-Language': 'en-US,en' },
  });
  const body = await res.text();
  // A blocked request comes back as a tiny authwall page, sometimes with 200.
  if (!res.ok || body.length < 10_000) throw new Error(`${res.status} from ${url}`);
  return body;
};

const unescape = (s) =>
  s
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

// The post page carries its text in JSON-LD; reposts with commentary only
// have it in the rendered card.
const postText = (html) => {
  for (const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    let d;
    try {
      d = JSON.parse(m[1]);
    } catch {
      continue;
    }
    const items = d['@graph'] ?? [d];
    const post = items.find((it) => it.articleBody || it.text);
    if (post) return post.articleBody || post.text;
  }
  const card = html.match(/data-test-id="main-feed-activity-card__commentary"[^>]*>(.*?)<\/p>/s);
  if (card) return unescape(card[1]);
  return null;
};

// Activity ids are snowflakes: the top 41 bits are the post's epoch millis.
const postedAt = (url) => {
  const id = url.match(/activity-(\d+)/)[1];
  return new Date(Number(BigInt(id) >> 22n)).toISOString();
};

// The card links to the full post, and the homepage has a
// gzip budget in src/data/claims.ts, so only ship what fits on the card.
const MAX_CHARS = 260;
const excerpt = (text) => {
  if (text.length <= MAX_CHARS) return text;
  const cut = text.slice(0, MAX_CHARS);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,.:;]+$/, '') + '…';
};

const profile = await get(PROFILE);
const urls = [...new Set(profile.match(OWN_POST) ?? [])];
if (urls.length === 0) throw new Error('no posts found on the profile page');

const posts = [];
for (const url of urls) {
  const raw = postText(await get(url));
  if (!raw) throw new Error(`no text in ${url}`);
  const tags = [...new Set([...raw.matchAll(/#(\w+)/g)].map((m) => m[1].toLowerCase()))];
  const text = raw
    .split('\n')
    .filter((line) => !/^\s*(#\w+\s*)+$/.test(line))
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/https:\/\/lnkd\.in\/\S+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  posts.push({ url, postedAt: postedAt(url), text: excerpt(text), tags });
}

posts.sort((a, b) => b.postedAt.localeCompare(a.postedAt));
writeFileSync(OUT, JSON.stringify(posts, null, 2) + '\n');
console.log(`wrote ${posts.length} posts to src/data/linkedin-posts.json`);
