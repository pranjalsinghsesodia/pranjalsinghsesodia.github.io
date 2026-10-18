import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { staticFile } from '../../lib/static-file';

/*
 * Videos (and their poster frames) live in src/assets/projects/<slug>/video/.
 * Astro doesn't process video, so each file is served as-is at
 * /media/<slug>/<file>, e.g. /media/depth-estimation/pose-early.mp4.
 * Story clips in src/assets/stories/ are served at /media/stories/<file>.
 */
const TYPES: Record<string, string> = { mp4: 'video/mp4', webm: 'video/webm', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' };

export function getStaticPaths() {
  const root = join(process.cwd(), 'src', 'assets', 'projects');
  const storiesDir = join(process.cwd(), 'src', 'assets', 'stories');
  const stories = existsSync(storiesDir)
    ? readdirSync(storiesDir)
        .filter((f) => /\.(mp4|webm)$/i.test(f))
        .map((f) => ({ params: { path: `stories/${f}` }, props: { slug: 'stories', file: f } }))
    : [];
  return stories.concat(readdirSync(root).flatMap((slug) => {
    const dir = join(root, slug, 'video');
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((f) => TYPES[f.split('.').pop()!.toLowerCase()])
      .map((f) => ({ params: { path: `${slug}/${f}` }, props: { slug, file: f } }));
  }));
}

export async function GET({ props }: { props: { slug: string; file: string } }) {
  const ext = props.file.split('.').pop()!.toLowerCase();
  const path = props.slug === 'stories' ? `stories/${props.file}` : `projects/${props.slug}/video/${props.file}`;
  return staticFile(path, TYPES[ext])();
}
