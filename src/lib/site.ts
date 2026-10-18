/* Site-wide details. Empty links are hidden, so fill them in when you have them. */
export const SITE = {
  name: 'Pranjal Singh Sesodia',
  role: 'Mechanical engineer',
  currently: 'R&D intern, mPragati, IIT Delhi',
  description:
    'Pranjal Singh Sesodia, mechanical engineering undergraduate at NSUT Delhi and R&D intern at IIT Delhi: robot mechanisms, surgical robotics, depth estimation and simulation.',
  emails: ['pranjalsinghsesodia@gmail.com'],
  cv: 'cv.pdf',
  links: [
    { label: 'GitHub', href: 'https://github.com/pranjalsinghsesodia' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/pranjalsinghsesodia/' },
    { label: 'Google Scholar', href: 'https://scholar.google.com/citations?hl=en&user=K10pZz0AAAAJ' },
    { label: 'ResearchGate', href: '' },
    { label: 'Instagram', href: 'https://www.instagram.com/hipranjal_/' },
  ],
};

/** Prefix a site path with the configured base, so links work at / or /repo-name/. */
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (/^(https?:|mailto:|#)/.test(path)) return path;
  return `${base}/${path.replace(/^\//, '')}`;
}

export const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

export const fmtShort = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', timeZone: 'UTC' }).replace(/\//g, '.');

/** Journal entries visible in this build: drafts only show up in `npm run dev`. */
export const isVisible = (entry: { data: { draft: boolean } }) => import.meta.env.DEV || !entry.data.draft;
