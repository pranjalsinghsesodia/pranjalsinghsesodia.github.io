import { staticFile } from '../lib/static-file';

// /favicon.svg ← src/assets/site/favicon.svg
export const GET = staticFile('site/favicon.svg', 'image/svg+xml');
