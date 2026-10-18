import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const entries = (await getCollection('journal', (e) => !e.data.draft)).sort((a, b) => +b.data.date - +a.data.date);
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return rss({
    title: 'Pranjal Singh Sesodia · Journal',
    description: 'Build logs and notes on mechanisms, surgical robotics and fluids.',
    site: context.site,
    items: entries.map((e) => ({
      title: e.data.title,
      pubDate: e.data.date,
      description: e.data.summary,
      link: `${base}/journal/${e.id}/`,
    })),
  });
}
