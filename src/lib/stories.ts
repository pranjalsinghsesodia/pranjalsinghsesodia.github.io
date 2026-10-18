import { getCollection, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import { url } from './site';

export type Slide =
  | { type: 'img'; src: string; alt: string; caption?: string; sub?: string }
  | { type: 'video'; src: string; poster: string; alt: string; caption?: string; sub?: string }
  | { type: 'card'; kicker?: string; title?: string; text?: string };

export type StoryReel = { title: string; meta: string; href?: string; slides: Slide[] };

const STORY_WIDTH = 1080;

export async function getProjects() {
  const all = await getCollection('projects');
  return all.sort((a, b) => a.data.order - b.data.order);
}

/** Stories grouped into rolls by month, newest month last (frame numbers run through the whole roll). */
export async function getRolls() {
  const all = (await getCollection('stories')).sort((a, b) => +a.data.date - +b.data.date);
  const months = new Map<string, CollectionEntry<'stories'>[]>();
  for (const s of all) {
    const key = s.data.date.toISOString().slice(0, 7);
    if (!months.has(key)) months.set(key, []);
    months.get(key)!.push(s);
  }
  let frame = 0;
  return [...months.entries()].map(([key, items]) => ({
    key,
    name: new Date(key + '-01T00:00:00Z').toLocaleDateString('en-GB', { month: 'long', timeZone: 'UTC' }),
    label: new Date(key + '-01T00:00:00Z').toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
    frames: items.map((entry) => ({ entry, no: ++frame })),
  }));
}

export const highlightKey = (h: string) => 'h-' + h.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/** Everything the story viewer can play: one reel per project and one per photo highlight. */
export async function getReels(): Promise<Record<string, StoryReel>> {
  const reels: Record<string, StoryReel> = {};

  for (const p of await getProjects()) {
    const slides: Slide[] = [];
    for (const s of p.data.story) {
      if (s.image) {
        const img = await getImage({ src: s.image, width: STORY_WIDTH, format: 'webp' });
        slides.push({ type: 'img', src: img.src, alt: s.caption ?? p.data.title, caption: s.caption, sub: s.sub });
      } else {
        slides.push({ type: 'card', kicker: s.kicker, title: s.title, text: s.text });
      }
    }
    if (!slides.length) slides.push({ type: 'card', kicker: p.data.field, title: p.data.title, text: p.data.summary });
    reels['p-' + p.id] = {
      title: p.data.short,
      meta: `${p.data.year} · ${p.data.status.toLowerCase()}`,
      href: url(`work/${p.id}/`),
      slides,
    };
  }

  const stories = (await getCollection('stories')).sort((a, b) => +a.data.date - +b.data.date);
  for (const s of stories) {
    const key = highlightKey(s.data.highlight);
    reels[key] ??= { title: s.data.highlight, meta: '', slides: [] };
    const img = await getImage({ src: s.data.image, width: STORY_WIDTH, format: 'webp' });
    const when = s.data.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
    const common = { alt: s.data.caption ?? s.data.highlight, caption: s.data.caption, sub: [s.data.location, s.data.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })].filter(Boolean).join(' · ') };
    if (s.data.video) {
      reels[key].slides.push({ type: 'video', src: url(`media/stories/${s.data.video}`), poster: img.src, ...common });
      continue;
    }
    reels[key].slides.push({
      type: 'img',
      src: img.src,
      alt: s.data.caption ?? s.data.highlight,
      caption: s.data.caption,
      sub: [s.data.location, when].filter(Boolean).join(' · '),
    });
  }
  for (const [k, r] of Object.entries(reels)) {
    if (k.startsWith('h-')) r.meta = `${r.slides.length} ${r.slides.length === 1 ? 'story' : 'stories'}`;
  }
  return reels;
}
