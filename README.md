# My Page

Static personal site built with plain HTML, no build step, and support for both PT-BR and English.

This project is organized to be easy to fork and reuse as a template. The goal is to keep the core simple and isolate integrations, tracking, and joke features into separate files.

## Structure

- `index.html` and root pages: PT-BR version
- `en/`: English mirror
- `styles.css`: shared visual system
- `i18n.js`: language switch and automatic PT/EN redirect
- `public/`: favicon, banner, and static assets
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

- `troll-mode.js`
  - visual troll mode toggle
  - to remove it, delete `<script src="/troll-mode.js"></script>` from the pages

- `troll-nyancat.js`
  - extra visual effect for troll mode
  - to remove it, delete `<script src="/troll-nyancat.js"></script>` from the pages

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
- `/setup`
- `/site`
- `/en`
- matching routes inside `/en/...`

Legacy `.html` routes still work through permanent redirects. That logic is intentionally kept inside `vercel.json`.

## Deploy

The project is ready for static deployment on Vercel.

Important notes:

- there is no real build step
- `vercel.json` handles clean URLs and legacy redirects
- `sitemap.xml` and SEO metadata already use canonical URLs without `.html`

## Local preview

Any simple static server will work. Example with Live Server or a similar tool:

```txt
http://127.0.0.1:5500/
```

## Note

The `example/` folder is only kept as historical reference for an older version. It is not part of the base template or the deployment setup.
