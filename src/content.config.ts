import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/*
 * Projects: text in src/content/projects/<slug>.md, files in src/assets/projects/<slug>/.
 * scripts/sync-projects.mjs refreshes both from each project's own GitHub repo
 * (its portfolio/ folder) before every build.
 */
const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      short: z.string(), // label under the story ring
      order: z.number(), // position in rings and index (lower first)
      featured: z.boolean().default(true), // featured projects get a story ring and sit above "Earlier and other work"
      year: z.string(), // shown as written, e.g. "2026–" or "2021–25"
      discipline: z.enum(['robotics', 'biomech', 'fluids', 'hardware', 'research']),
      field: z.string(), // label shown in the index
      tools: z.string(),
      status: z.string(),
      state: z.enum(['live', 'done', 'win']).default('done'),
      summary: z.string(),
      period: z.string().optional(), // "Jun 2026 – present"
      role: z.string().optional(), // what you personally did
      where: z.string().optional(), // lab / organisation
      supervisor: z.string().optional(),
      mentors: z.array(z.string()).default([]),
      team: z.string().optional(),
      cover: image().optional(),
      coverNote: z.string().optional(), // e.g. "Render" or "Prototype, Oct 2026"
      ring: z.string().optional(), // short text for the ring when there is no cover
      peek: z.string().optional(), // hover text when there is no cover
      repo: z.string().optional(), // "pranjalsinghsesodia/repo-name"
      links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
      story: z
        .array(
          z.object({
            image: image().optional(),
            caption: z.string().optional(),
            sub: z.string().optional(),
            kicker: z.string().optional(),
            title: z.string().optional(),
            text: z.string().optional(),
          }),
        )
        .default([]),
    }),
});

const journal = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

/* Stories: one file per published Instagram story (added from a phone via Pages CMS). */
const stories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stories' }),
  schema: ({ image }) =>
    z.object({
      date: z.coerce.date(),
      highlight: z.string(),
      image: image(),
      caption: z.string().optional(),
      location: z.string().optional(),
      pick: z.boolean().default(false), // circled on the contact sheet
    }),
});

export const collections = { projects, journal, stories };
