# Pranjal Singh Sesodia: portfolio and journal

Static site built with [Astro](https://astro.build), hosted on GitHub Pages at https://pranjalsinghsesodia.github.io. The theme follows the visitor's system setting (light when unknown), and the navbar toggle overrides it.

## Making a change

**From the browser (no setup):** open the file on GitHub, click the pencil icon, edit, then **Commit changes**. To add or replace an image, open the folder, choose **Add file → Upload files**, and commit. Every commit to `main` rebuilds the site in about two minutes; watch it under the repo's **Actions** tab. A green tick means it's live. A red cross means the build failed; click it to read the error, which names the file and line.

**From your laptop (with a preview):**

```
npm install        # once
npm run dev        # preview at http://localhost:4321; journal drafts show here only
npm run build      # the same check GitHub runs; fix any error before pushing
git add -A
git commit -m "What changed"
git push
```

If the live site doesn't change after a push, refresh with Ctrl+Shift+R. If the Actions tab shows no new run, GitHub may be having an outage (githubstatus.com); push again later.

## Where to change what

| I want to change… | Edit this |
| --- | --- |
| My name, role line, email, social links | `src/lib/site.ts` |
| Home page: heading, bio, research interests, Recent list, publication, About text, skills, facts | `src/pages/index.astro` |
| A project's title, summary, status, numbers, case study text | `src/content/projects/<slug>.md` |
| A project's cover or photos | `src/assets/projects/<slug>/` + the path in that project's `.md` |
| Profile photo | Replace `src/assets/site/me.jpeg` (keep the name) |
| CV | Replace `src/assets/site/cv.pdf` (keep the name) |
| Contact sheet photos and clips | `src/content/stories/` + `src/assets/stories/`, or Pages CMS from your phone |
| Journal entries | `src/content/journal/*.md` |
| Navbar links | `src/components/SiteHeader.astro` |
| Footer | `src/components/SiteFooter.astro` |
| Colours and fonts | `src/styles/global.css` (tokens at the top: dark, then light) |

### Home page text (`src/pages/index.astro`)

The top part, between the two `---` lines, holds lists you can edit like text:

- `NEWS`: the **Recent** list. Each line is `{ when: 'Jun 2026', html: 'What happened.' }`. Wrap words in `<b>…</b>` for bold or `<i>…</i>` for italics. Delete a line to remove it; keep three or four.
- `SKILLS`: the skill tags in About, by group.
- `BIBTEX`: the citation shown by the BibTeX button.

Below that is the page itself. Search for the sentence you want to change (Ctrl+F) and edit it in place. Leave the `<tags>` and `{curly braces}` around it alone.

### Projects (`src/content/projects/<slug>.md`)

Each project is one Markdown file. The block between the `---` lines at the top is its data:

| Field | What it does |
| --- | --- |
| `title`, `short` | Full name on the project page; short name under the story ring |
| `summary` | One-line description in the title block |
| `order` | Position in the list (1 is first) and the item code `PSS-001` |
| `featured` | `false` moves it under "Earlier and other work" |
| `inRings` | `true` puts it in the story rings at the top (keep it to four) |
| `year`, `period`, `where`, `role`, `supervisor`, `mentors`, `team` | Title-block rows |
| `discipline` | Filter group: robotics, biomech, fluids, hardware or research |
| `field`, `tools` | Shown in the work table and title block |
| `status`, `state` | Status text, and its style: `live` (in progress), `done` or `win` |
| `figures` | The numbers row. Every value must also appear in that project's text, or the build stops with an error |
| `cover`, `coverNote` | Cover image and its caption |
| `story` | The slides of the 30-second story (image + caption, or a text card) |
| `repo`, `links` | Code link and other links |

Everything below the second `---` is the case study, written in Markdown:

```md
## A heading

A paragraph. **Bold**, *italic*, [a link](https://example.com).

![What the photo shows](../../assets/projects/surgical-arm/arm-bench.jpg)
```

Text values containing a colon need quotes: `role: "Lead: CAD and testing"`.

### Images

- Put a project's images in `src/assets/projects/<slug>/` and refer to them from its `.md` with `../../assets/projects/<slug>/<file>`.
- File names: lowercase, no spaces (`arm-bench.jpg`, not `Arm Bench.JPG`).
- JPG, PNG or WebP. No need to resize: the build makes small, fast versions. Keep each file under 20 MB (GitHub's browser upload limit is 25 MB).
- Videos go in `src/assets/projects/<slug>/video/` and are linked as `/media/<slug>/<file>.mp4`.

### Contact sheet from your phone (Pages CMS)

1. Open [app.pagescms.org](https://app.pagescms.org), sign in with GitHub, and open this repo.
2. **Stories → Add**: upload the photo, write a caption, pick a set (Lab, Baja, Side builds). Tick "pick" to circle it.
3. Save. The site rebuilds in about two minutes.

The menu that Pages CMS shows is defined in `.pages.yml`.

## What every file does

```
.github/workflows/deploy.yml   Builds and publishes the site on every push, daily, or when a project repo pings it
.pages.yml                     Pages CMS menus (stories, journal, films)
astro.config.mjs               Site address and build settings
package.json                   Dependencies and the npm commands
projects.sources.json          Which project repos to pull at build time
scripts/sync-projects.mjs      Pulls each project repo's portfolio/ folder into src/
templates/project-repo/        Starter files for a new project repo

src/
├─ assets/                     Every image, video and file the site serves
│  ├─ site/                    me.jpeg, cv.pdf, favicon.svg
│  ├─ projects/<slug>/         Covers, photos and clips for each project
│  ├─ stories/                 Contact-sheet photos and clips
│  └─ films/                   Poster frames for the Films row
├─ content/                    All the writing, as Markdown
│  ├─ projects/                One file per project
│  ├─ journal/                 Journal entries (draft: true hides one)
│  ├─ stories/                 One file per contact-sheet frame
│  └─ films/                   One file per film card
├─ content.config.ts           The allowed fields for each content type (what the build checks)
├─ lib/
│  ├─ site.ts                  Name, role, email, CV, social links
│  ├─ stories.ts               Sorting and grouping for projects and stories
│  └─ static-file.ts           Helper that serves files at fixed addresses
├─ layouts/Base.astro          The page shell: head tags, theme script, navbar and footer
├─ components/
│  ├─ SiteHeader.astro         Sticky navbar, clock, theme toggle
│  ├─ SiteFooter.astro         Footer: email, links, updated date, credit
│  ├─ ProjectRings.astro       Story rings at the top of the home page
│  ├─ ProjectIndex.astro       Selected work: field list, table, hover preview
│  ├─ StoryViewer.astro        Full-screen story player for rings and the contact sheet
│  ├─ Photography.astro        Photography section wrapper
│  ├─ ContactSheet.astro       The contact sheet of frames
│  └─ Films.astro              The Films row
├─ pages/                      Each file is a page; its path is its address
│  ├─ index.astro              Home page (/)
│  ├─ work/[slug].astro        Template for every project page (/work/<slug>/)
│  ├─ journal/index.astro      Journal list (/journal/)
│  ├─ journal/[slug].astro     Template for every journal entry
│  ├─ photos/index.astro       All photo sets (/photos/)
│  ├─ 404.astro                Page-not-found
│  ├─ rss.xml.js               Journal RSS feed
│  ├─ cv.pdf.ts, favicon.svg.ts  Serve the CV and icon at fixed addresses
│  └─ media/[...path].ts       Serves videos at /media/...
└─ styles/global.css           Colours, fonts and shared styles
```

Files you'll edit often: `src/content/**`, `src/assets/**`, `src/pages/index.astro`, `src/lib/site.ts`. Files to leave alone unless you know Astro: `content.config.ts`, `lib/stories.ts`, `lib/static-file.ts`, `layouts/`, `pages/media/`, `scripts/`, `.github/`.

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

At build time `scripts/sync-projects.mjs` downloads only each repo's `portfolio/` folder. It writes `project.md` to `src/content/projects/<slug>.md`, copies the other files to `src/assets/projects/<slug>/`, and rewrites `./file` paths to match. Once a project comes from its repo, edit it there, not here: the next build overwrites the local copy.

## Deploying

The repo is `pranjalsinghsesodia/pranjalsinghsesodia.github.io`, in the `pranjalsinghsesodia` organisation. Settings → Pages → Source is **GitHub Actions**; pushing to `main` deploys.

For private project repos, add a `PROJECTS_READ_TOKEN` secret (a fine-grained token with read access to those repos). To use a custom domain, set the `SITE_URL` variable to it, add the domain under Settings → Pages, and point its DNS at GitHub Pages.

The site was designed and built with help from Claude, Anthropic's AI assistant.
