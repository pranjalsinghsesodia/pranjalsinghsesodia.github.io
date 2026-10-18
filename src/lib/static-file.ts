import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/*
 * Serves a file from src/assets at a fixed URL (no content hash), for files
 * whose address must never change, like /cv.pdf linked from emails.
 * Runs at build time, so the file is written into dist/ as-is.
 */
export function staticFile(assetPath: string, type: string) {
  return async () => {
    const body = await readFile(join(process.cwd(), 'src', 'assets', assetPath));
    return new Response(body, { headers: { 'Content-Type': type } });
  };
}
