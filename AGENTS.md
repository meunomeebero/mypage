# Working in this repository

Static bilingual site. No build step, no framework, no dependencies. You edit HTML,
CSS and plain JavaScript directly, then run the gates.

## The one rule

**Run `make check` before you finish. If it fails, you are not done.**

Every gate prints the exact file and the exact reason it failed. A failing gate is a
to-do list, not an obstacle.

## Layout

| Path | What it is |
| --- | --- |
| `site.config.json` | Source of truth for the gates: domain, brand, contact, pages, profiles, asset versions |
| `*.html` | Portuguese pages (the default locale) |
| `en/*.html` | English pages — one per Portuguese page, same structure |
| `*.md`, `en/*.md` | Markdown mirrors for agents, listed in `llms.txt` |
| `styles.css` | The whole visual system |
| `tests/*.test.mjs` | The gates |
| `api/visitors.js` | Serverless endpoint for the visitor counter |
| `vercel.json` | Clean URLs, legacy redirects, headers |

Optional and safe to delete in a fork: `analytics.js`, `secret-link.js`,
`chaos-mode.js`, `interaction-sounds.js`, `avatar-spin.js`, `api/`.
Remove the matching `<script>` tag and the entry in `site.config.json.assetVersions`.

## Recipes

### Change copy on a page

Edit the Portuguese file **and** its English counterpart in the same change. If the
page has a Markdown mirror, update it too, then bump the date in all three places
(`sitemap.xml` `<lastmod>`, JSON-LD `dateModified`, `Last updated:` in the mirror).
`make check` refuses to let those dates disagree.

### Change markup, add a section or a component

Apply the identical structure to every locale. Only the human-readable text differs
between `about.html` and `en/about.html`; tags, `id`s, `class`es, `data-*`
attributes, images and outbound links must match exactly. `i18n-parity` diffs them
for you and names the attribute that drifted.

### Add a page

1. Add the slug to `pages` in `site.config.json`.
2. Create `<slug>.html` and `en/<slug>.html`. Copy the closest existing pair so the
   head, sidebar and footer stay consistent.
3. Set `<html lang>`, a self-referencing `<link rel="canonical">`, one
   `<link rel="alternate" hreflang>` per locale plus `x-default`.
4. Keep `<title>`, `og:title` and `twitter:title` identical.
5. Add both URLs to `sitemap.xml` with the same `<lastmod>`.
6. Add both legacy `.html` redirects to `vercel.json`.
7. Add the sidebar link to **all** pages in that locale.
8. If it needs a Markdown mirror, set `markdownMirror: true`, create both `.md`
   files and list them in `llms.txt`.

`make check` verifies steps 1 and 3-8. It will name whatever you skipped.

### Edit a JavaScript or CSS file

Bump that file's version in `site.config.json.assetVersions`, then update the
`?v=` query string on every page that loads it:

```bash
sed -i '' 's|/i18n\.js?v=[0-9-]*|/i18n.js?v=20260830-1|g' *.html en/*.html
```

The gate fails on any page still on the old version, so nothing ships half-cached.

### Remove a page

Delete both locales, drop the slug from `site.config.json`, and remove its entries
from `sitemap.xml`. Leave the `vercel.json` redirect in place if the URL was ever
public.

## The gates

| Gate | Guarantees |
| --- | --- |
| `i18n-parity` | Every page exists in every locale with identical structure; canonical and hreflang are reciprocal; navigation never leaks across locales |
| `freshness` | `sitemap.xml`, JSON-LD `dateModified` and Markdown mirrors always agree on one date per page |
| `seo-contract` | Titles, descriptions, robots, valid JSON-LD, social tags in sync, `llms.txt` complete, legacy redirects intact |
| `interaction-contract` | Asset versions are uniform, the router / sound / gallery runtime contracts hold |
| `analytics-contract` | Tracking is production-only, the private key stays server-side, counters work in every locale |

## Forking this site

1. Edit `site.config.json` with your own domain, brand, contact and profiles.
2. Run `make check`. Every failure is a place that still has the original owner's
   content. Work through the list.
3. Replace `public/`, then delete the optional scripts you do not want.
4. Copy `.env.example` to `.env.local` if you keep the visitor counter.

`scripts/` and `ANALYTICS.md` are the original owner's PostHog operations setup and
are deliberately untracked.

## Conventions

- No dependencies and no build step. Do not add either.
- Never hardcode a secret. Server-side values come from `process.env`.
- Portuguese is the default locale and lives at the root; English lives under `en/`.
- Only Brazilian visitors are auto-redirected between locales (`i18n.js`).
  Redirecting everyone else also redirects crawlers and collapses the Portuguese
  pages in search results. Language targeting is `hreflang`'s job.
- Preview locally with `make preview` at http://localhost:5500.
