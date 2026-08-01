import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Hand-rolled rather than @astrojs/rss. The build re-derives the runtime
// dependency list on every run and fails if it changed, and a feed is forty
// lines of string building — not worth spending the count on.

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://riad.cc');
  const posts = (await getCollection('writing', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.published.getTime() - a.data.published.getTime(),
  );

  const items = posts
    .map((post) => {
      const url = new URL(`/writing/${post.id}/`, base).href;
      return `    <item>
      <title>${esc(post.data.title)}</title>
      <link>${esc(url)}</link>
      <guid isPermaLink="true">${esc(url)}</guid>
      <description>${esc(post.data.summary)}</description>
      <pubDate>${post.data.published.toUTCString()}</pubDate>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Riad Mukhtarov — Writing</title>
    <link>${esc(new URL('/writing/', base).href)}</link>
    <description>Notes on the parts of a system that have to stay honest when nobody is checking.</description>
    <language>en</language>
    <atom:link href="${esc(new URL('/rss.xml', base).href)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
