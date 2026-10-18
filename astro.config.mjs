// @ts-check
import { defineConfig } from 'astro/config';

// SITE_URL / BASE_PATH let the same code deploy to pranjalsinghsesodia.github.io (root)
// or to a project page such as pranjalsinghsesodia.github.io/portfolio (base "/portfolio").
export default defineConfig({
  site: process.env.SITE_URL || 'https://pranjalsinghsesodia.github.io',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'ignore',
  // the toolbar only ever shows in `npm run dev`; switched off so local previews match the live site
  devToolbar: { enabled: false },
});
