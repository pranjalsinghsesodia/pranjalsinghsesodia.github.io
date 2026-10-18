import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { staticFile } from '../../lib/static-file';

/*
 * Videos (and their poster frames) live in src/assets/projects/<slug>/video/.
 * Astro doesn't process video, so each file is served as-is at
 * /media/<slug>/<file>, e.g. /media/depth-estimation/pose-early.mp4
 */
const TYPES: Record<string, string> = { mp4: 'video/mp4', webm: 'video/webm', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' };

export function getStaticPaths() {
  const root = join(process.cwd(), 'src', 'assets', 'projects');
  return readdirSync(root).flatMap((slug) => {
    const dir = join(root, slug, 'video');
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((f) => TYPES[f.split('.').pop()!.toLowerCase()])
      .map((f) => ({ params: { path: `${slug}/${f}` }, props: { slug, file: f } }));
  });
}

export async function GET({ props }: { props: { slug: string; file: string } }) {
  const ext = props.file.split('.').pop()!.toLowerCase();
  return staticFile(`projects/${props.slug}/video/${props.file}`, TYPES[ext])();
}
