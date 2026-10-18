import { staticFile } from '../lib/static-file';

// /cv.pdf ← src/assets/site/cv.pdf
export const GET = staticFile('site/cv.pdf', 'application/pdf');
