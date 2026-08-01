import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Writing lives as markdown files. Astro builds one page per file and the
// index builds itself, so adding a piece means adding a file — nothing else.
//
// `order` is curation, not chronology: the list is arranged by what is worth
// reading first, and no date is rendered anywhere on the site. `published`
// exists solely because RSS items need a pubDate to sort by; it never appears
// on a page. A reverse-chronological archive advertises how long it has been
// since you last wrote. A curated list doesn't.
const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number(),
    published: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { writing };
