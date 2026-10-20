# Pranjal Singh Sesodia: portfolio and journal

Static site built with [Astro](https://astro.build), hosted on GitHub Pages. Dark by default, with a light/dark toggle in the sticky navbar.

Three design styles, switched by the style button in the navbar: **Studio** (default), **Retro** (a 1995 desktop) and **Notebook** (an engineering pad). Each has light and dark. Studio lives in `src/styles/global.css`; Retro and Notebook are in `src/styles/skins.css`.

```
npm install
npm run dev        # http://localhost:4321 (journal drafts are visible here)
npm run sync       # pull project data from the project repos
npm run build      # production build into dist/
```

## Where things live

Text lives in `src/content/`. Every file the site loads from this repo lives in `src/assets/`:

```
src/assets/
├─ site/                 cv.pdf, favicon.svg, me.jpeg
├─ films/                poster frames for the Films row
├─ projects/<slug>/      cover, story images, photos, CAD shots, clips for that project
└─ stories/              photos for the contact sheet (Pages CMS uploads here)
```

| What | Text | Files | How to add one |
| --- | --- | --- | --- |
| Projects (index rows, story rings, case studies) | `src/content/projects/<slug>.md` | `src/assets/projects/<slug>/` | Best: in the project's own repo (below). Or add both here. |
| Journal entries | `src/content/journal/*.md` | `src/assets/journal/` if needed | Add a Markdown file, or use Pages CMS. `draft: true` keeps it off the live site. |
| Contact sheet frames | `src/content/stories/*.md` (`highlight` = the set: Lab, Baja, ...) | `src/assets/stories/` | Pages CMS → Stories. Clips: add the `.mp4` and name it in `video`. |
| Films | `src/content/films/*.md` | `src/assets/films/` (poster frame only) | Pages CMS → Films. The video itself stays on YouTube, Vimeo or Instagram; the card links there. |
| CV and favicon | | `src/assets/site/` | Replace the file. It's served at a fixed address, `/cv.pdf`, so links in emails never break. |
| Name, email, social links | `src/lib/site.ts` | | Empty links are hidden. |
| Colours and type | `src/styles/global.css` | | Tokens at the top: dark first, then light. |

In a project's Markdown, refer to its files by path from the Markdown file, e.g. `cover: ../../assets/projects/surgical-arm/cover.png` or `![Bench test](../../assets/projects/surgical-arm/bench.jpg)`. To fill a placeholder slot, replace the `<figure class="ph-fig">` block with an image like that.

## Project data from project repos

Each project can live in its own repo with a `portfolio/` folder:

```
pranjalsinghsesodia/surgical-arm-6dof
├─ portfolio/
│  ├─ project.md    front matter: title, year, status, tools, story slides; body: the case study
│  ├─ cover.jpg
│  └─ ...images used by the story
├─ cad/             stays here, never downloaded by the site build
└─ src/
```

1. Copy `templates/project-repo/portfolio/` into the project repo and fill in `project.md`.
2. Add the repo to `projects.sources.json`.
3. Optional: copy `templates/project-repo/.github/workflows/notify-portfolio.yml` into the project repo and add a `PORTFOLIO_DISPATCH_TOKEN` secret, so a push there rebuilds the site straight away. Without it, the site still picks up changes in its daily rebuild.

At build time `scripts/sync-projects.mjs` downloads only each repo's `portfolio/` folder. It writes `project.md` to `src/content/projects/<slug>.md`, copies the other files to `src/assets/projects/<slug>/`, and rewrites `./file` paths to match. Astro then resizes the images. In the project repo, keep using `./cover.jpg`-style paths next to `project.md`. Visitors never request anything from GitHub. If a repo or folder doesn't exist yet, the local copy is used.

## Stories from a private Instagram

Instagram's API can't read private accounts, so the site keeps its own copies of the stories you choose:

1. Save the story from Instagram (Profile → Archive).
2. Open [pagescms.org](https://pagescms.org), sign in with GitHub, and open this repo.
3. Stories → Add: upload the photo, write a caption, pick a highlight and the date. Tick "Pick of the month" for the one to circle.
4. Save. GitHub Actions redeploys in about two minutes.

The photography section, and its nav link, only appear once there is at least one story or film. The Instagram link comes from `src/lib/site.ts`.

## Deploying

1. Signed in as your own account (Kenkada), create a free organisation named `pranjalsinghsesodia` at github.com/account/organizations/new. Organisations get their own Pages address, so the site lives at pranjalsinghsesodia.github.io and your account name never appears.
   Create a repo in the organisation named `pranjalsinghsesodia.github.io` and push this folder to `main`.
   Keep project repos in the organisation too (transfer DeskMilo there), so repo links on the site read `github.com/pranjalsinghsesodia/...`.
2. Repo Settings → Pages → Source: **GitHub Actions**.
3. Optional: for private project repos, add a `PROJECTS_READ_TOKEN` secret (a fine-grained token with read access to those repos).

To use a different repo name, set the repository variable `BASE_PATH` to `/repo-name`. To use a custom domain, set `SITE_URL` to it and add a `public/CNAME` file containing the domain.
