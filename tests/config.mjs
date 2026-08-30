import { readFileSync } from "node:fs";

export const config = JSON.parse(readFileSync("site.config.json", "utf8"));

export const localeCodes = Object.keys(config.locales);
export const defaultLocale = localeCodes.find((code) => config.locales[code].isDefault);
export const secondaryLocales = localeCodes.filter((code) => code !== defaultLocale);

/** Repo-relative HTML path for a page in a locale: "about.html" / "en/about.html". */
export function pagePath(slug, locale) {
  const { dir } = config.locales[locale];
  return dir === "." ? `${slug}.html` : `${dir}/${slug}.html`;
}

/** Repo-relative Markdown mirror path: "about.md" / "en/about.md". */
export function markdownPath(slug, locale) {
  return pagePath(slug, locale).replace(/\.html$/, ".md");
}

/** Public clean URL for a page: "https://bero.land/about" / "https://bero.land/en/about". */
export function pageUrl(slug, locale) {
  const { home } = config.locales[locale];
  if (slug === "index") return `${config.origin}${home === "/" ? "/" : home}`;
  return `${config.origin}${home === "/" ? "" : home}/${slug}`;
}

/** Every [slug, locale, path] triple the site is expected to ship. */
export const allPages = config.pages.flatMap((page) =>
  localeCodes.map((locale) => ({ slug: page.slug, locale, path: pagePath(page.slug, locale), ...page })),
);

export const readPage = (path) => readFileSync(path, "utf8");

export const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
