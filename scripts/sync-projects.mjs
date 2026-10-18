#!/usr/bin/env node
/*
 * Pulls each project's portfolio/ folder from its own GitHub repo before the site is built:
 *   portfolio/project.md  -> src/content/projects/<slug>.md
 *   everything else       -> src/assets/projects/<slug>/
 * Paths like ./cover.jpg inside project.md are rewritten to point at the assets folder.
 *
 *   node scripts/sync-projects.mjs            # all projects in projects.sources.json
 *   node scripts/sync-projects.mjs deskmilo   # just one
 *
 * Only the portfolio/ folder is downloaded (sparse checkout), so CAD files,
 * videos and code in the project repo never touch the portfolio build.
 * Set GH_TOKEN to read private repos. A missing repo or folder is not an
 * error: the local copy is kept.
 */
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const { projects } = JSON.parse(readFileSync(join(root, 'projects.sources.json'), 'utf8'));
const only = process.argv.slice(2);
const tmpRoot = join(root, '.sync-tmp');
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';

const git = (args, cwd) =>
  spawnSync('git', args, { cwd, encoding: 'utf8', timeout: 120_000, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } });

let synced = 0;
let kept = 0;
rmSync(tmpRoot, { recursive: true, force: true });
mkdirSync(tmpRoot, { recursive: true });

for (const p of projects) {
  if (only.length && !only.includes(p.slug)) continue;
  const folder = p.path || 'portfolio';
  const tmp = join(tmpRoot, p.slug);
  const remote = `https://${token ? `x-access-token:${token}@` : ''}github.com/${p.repo}.git`;

  const clone = git(['clone', '--depth', '1', '--filter=blob:none', '--sparse', ...(p.ref ? ['--branch', p.ref] : []), remote, tmp], root);
  if (clone.status !== 0) {
    console.warn(`· ${p.slug}: couldn't reach ${p.repo}, keeping the local copy`);
    kept++;
    continue;
  }
  git(['sparse-checkout', 'set', folder], tmp);

  const src = join(tmp, folder);
  const mdName = ['project.md', 'index.md'].find((f) => existsSync(join(src, f)));
  if (!mdName) {
    console.warn(`· ${p.slug}: ${p.repo} has no ${folder}/project.md yet, keeping the local copy`);
    kept++;
    continue;
  }

  // text
  const md = readFileSync(join(src, mdName), 'utf8').replace(/(?<=[\s("'=])\.\//g, `../../assets/projects/${p.slug}/`);
  writeFileSync(join(root, 'src', 'content', 'projects', `${p.slug}.md`), md);

  // files
  const assets = join(root, 'src', 'assets', 'projects', p.slug);
  rmSync(assets, { recursive: true, force: true });
  mkdirSync(assets, { recursive: true });
  for (const f of readdirSync(src)) {
    if (f !== mdName) cpSync(join(src, f), join(assets, f), { recursive: true });
  }

  console.log(`✓ ${p.slug}: synced from ${p.repo}`);
  synced++;
}

rmSync(tmpRoot, { recursive: true, force: true });
console.log(`\n${synced} synced from GitHub, ${kept} kept locally.`);
