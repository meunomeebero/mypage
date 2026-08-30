# bero.land

Static personal site in plain HTML, CSS and JavaScript. No build step, no
dependencies, bilingual (Portuguese at the root, English under `en/`), deployed as
static files on Vercel.

Built to be forked. Editing it — by hand or with an agent — is guarded by a set of
gates that fail loudly when a change reaches only one language, when a date goes
stale, or when SEO metadata falls out of sync.

## Quick start

```bash
make preview   # http://localhost:5500
make check     # run every gate — do this before committing
```

Nothing to install. `make check` needs Node 18+, `make preview` needs Python 3.

## How it is organised

`site.config.json` is the source of truth the gates read: domain, brand, contact,
the list of pages, official profiles and asset versions. Change it, run `make check`,
and the failures tell you exactly what still needs updating.

- `index.html` and the other root pages — Portuguese
- `en/` — the English mirror, one file per Portuguese page
- `styles.css` — the whole visual system
- `*.md` + `llms.txt` — Markdown summaries for agents, served `noindex, follow`
- `tests/` — the gates
- `api/visitors.js` — serverless visitor counter
- `vercel.json` — clean URLs, legacy redirects, headers

Optional and removable in a fork: `analytics.js` (PostHog), `secret-link.js` and
`chaos-mode.js` (easter egg), `interaction-sounds.js` (sound feedback),
`avatar-spin.js`, and `api/` with the counter.

## Runtime

`app-router.js` progressively enhances internal links: direct hits are plain static
HTML requests, while in-page navigation swaps the body and preserves history,
metadata, scroll position and the Web Audio context.

`i18n.js` handles the language switch. It auto-redirects Brazilian visitors to the
Portuguese pages and leaves everyone else — including crawlers — on the page they
requested; targeting the rest of the world is `hreflang`'s job.

`interaction-sounds.js` uses delegated events to classify links, controls, fields,
scrolling and navigation globally. The preference is stored locally and toggled by
the `SOM` / `SOUND` control in the status bar.

## Search and agents

Every page declares a self-referencing canonical plus reciprocal `hreflang`.
`sitemap.xml` lists all 26 pages, and `llms.txt` points agents at concise Markdown
mirrors of the main content. The `freshness` gate keeps sitemap dates, JSON-LD
`dateModified` and the mirrors from ever disagreeing.

## Deploy

Static deploy on Vercel, no build step. `vercel.json` handles clean URLs and the
permanent redirects from the legacy `.html` routes.

## Forking

Read [AGENTS.md](AGENTS.md). It documents the layout, the recipes for common
changes and what each gate guarantees — written to be followed by a coding agent or
by you.
