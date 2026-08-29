# My Page

Static personal site built with plain HTML, no build step, and support for both PT-BR and English.

This project is organized to be easy to fork and reuse as a template. The goal is to keep the core simple and isolate integrations, tracking, sound feedback, and easter eggs into separate files.

## Structure

- `index.html` and root pages: PT-BR version
- `en/`: English mirror
- `styles.css`: shared visual system
- `i18n.js`: language switch and automatic PT/EN redirect
- `app-router.js`: progressive internal navigation that preserves the document and audio context
- `interaction-sounds.js`: delegated sound feedback for global interactions
- `public/`: favicon, banner, and static assets
- `llms.txt` and `*.md`: agent-readable site guide and canonical page summaries
- `vercel.json`: platform-specific configuration

## Base template

If you want to reuse this project as a serious personal site template, these files are the core:

- `*.html` pages
- `en/*.html`
- `styles.css`
- `i18n.js`
- `public/`
- `robots.txt`
- `sitemap.xml`
- `vercel.json`

## Optional scripts

These files are intentionally isolated. You can remove them in a fork if you do not want tracking or easter eggs.

- `analytics.js`
  - PostHog tracking
  - to remove it, delete `<script src="/analytics.js"></script>` from the pages

- `secret-link.js`
  - enables the secret link easter egg on the home page
  - to remove it, delete the secret content link from `index.html` and `en/index.html`, and remove `<script src="/secret-link.js"></script>` from those two pages

- `chaos-mode.js`
  - loaded on demand by the easter egg
  - if `secret-link.js` is removed, this file is no longer needed

## URLs

Public URLs use the clean format:

- `/`
- `/about`
- `/media-kit`
- `/projects`
- `/videos`
- `/contact`
- `/minilab`
- `/berolab`
- `/setup`
- `/gallery`
- `/site`
- `/terms`
- `/privacy`
- `/en`
- matching routes inside `/en/...`

Legacy `.html` routes still work through permanent redirects. That logic is intentionally kept inside `vercel.json`.

## Deploy

The project is ready for static deployment on Vercel.

Important notes:

- there is no build step
- `vercel.json` handles clean URLs and legacy redirects
- `sitemap.xml` and SEO metadata already use canonical URLs without `.html`

## Local preview

Open the HTML files directly in a browser, or use any static file server:

```bash
python3 -m http.server 5500
```

The `local-routing.js` script rewrites clean URLs to `.html` paths automatically when running on localhost.

## Interaction runtime

Internal links are progressively enhanced by `app-router.js`. The server still receives regular static HTML requests on direct access, while in-page navigation swaps the next document body and preserves the global runtime. This keeps language changes, browser history, metadata, scroll restoration, motion, and the Web Audio context synchronized across PT-BR and English pages.

`interaction-sounds.js` uses delegated events instead of per-component listeners. It classifies links, controls, fields, scrolling, navigation, and expandable content globally. The sound preference is stored locally and can be changed with the `SOM` / `SOUND` control in the status bar.

## Search and agent discovery

Every public HTML page declares canonical and language-alternate URLs. `sitemap.xml` lists the 28 Portuguese and English pages, while `llms.txt` points agents to concise Markdown summaries of the main content. The Markdown mirrors are served with `X-Robots-Tag: noindex, follow` so they do not compete with the canonical HTML pages in search results.

## Note

The `example/` folder is only kept as historical reference for an older version. It is not part of the base template or the deployment setup.
