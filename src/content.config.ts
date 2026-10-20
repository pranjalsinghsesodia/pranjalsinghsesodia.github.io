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
      inRings: z.boolean().default(false), // shown as a story ring in the hero (keep it to 3–4)
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
      // key numbers for the title block; each value must appear word for word in the project's own text (checked at build)
      figures: z.array(z.object({ value: z.string(), unit: z.string().optional(), label: z.string() })).default([]),
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

/* Stories: frames on the contact sheet, grouped into sets by `highlight` (Lab, Baja, ...). Added from a phone via Pages CMS. */
const stories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stories' }),
  schema: ({ image }) =>
    z.object({
      date: z.coerce.date().optional(),
      highlight: z.string(), // the set this frame belongs to
      order: z.number().optional(), // lower comes first within the sheet; otherwise newest first
      image: image(), // the photo, or the poster frame of a clip
      video: z.string().optional(), // optional clip in src/assets/stories/, e.g. 2026-10-clip.mp4
      caption: z.string().optional(),
      location: z.string().optional(),
      pick: z.boolean().default(false), // circled on the contact sheet
    }),
});

/* Films: your best videos. The poster lives in src/assets/films/; the video itself stays on YouTube, Vimeo or Instagram. */
const films = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/films' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      poster: image(),
      link: z.string().url(), // where the film plays
      role: z.string().optional(), // "Shot and edited"
      duration: z.string().optional(), // "2:40"
      order: z.number().default(100), // lower comes first
    }),
});

export const collections = { projects, journal, stories, films };
