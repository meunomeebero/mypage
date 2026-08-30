// Gate: one page, one date. The sitemap <lastmod>, the JSON-LD dateModified and
// the Markdown mirror must never disagree — a stale date tells search engines to
// skip a page you actually changed.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { config, localeCodes, pagePath, markdownPath, pageUrl, readPage } from "./config.mjs";

const sitemap = readPage("sitemap.xml");
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const sitemapDates = new Map();
for (const entry of sitemap.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)) {
  sitemapDates.set(entry[1], entry[2]);
}

const expectedUrls = config.pages.flatMap((page) => localeCodes.map((locale) => pageUrl(page.slug, locale)));
assert.equal(sitemapDates.size, expectedUrls.length, `sitemap must list exactly ${expectedUrls.length} pages`);

for (const url of expectedUrls) {
  assert.equal(sitemapDates.has(url), true, `sitemap is missing ${url}`);
}
for (const url of sitemapDates.keys()) {
  assert.equal(expectedUrls.includes(url), true, `sitemap lists ${url}, which is not declared in site.config.json`);
  assert.match(sitemapDates.get(url), DATE, `${url} must use an ISO lastmod`);
}
assert.doesNotMatch(sitemap, /\.md<\/loc>/, "Markdown mirrors must stay out of the sitemap");

for (const page of config.pages) {
  const dates = new Set();

  for (const locale of localeCodes) {
    const path = pagePath(page.slug, locale);
    const lastmod = sitemapDates.get(pageUrl(page.slug, locale));
    dates.add(lastmod);

    for (const declared of readPage(path).matchAll(/"dateModified":\s*"([^"]+)"/g)) {
      assert.equal(
        declared[1],
        lastmod,
        `${path} declares dateModified ${declared[1]} but the sitemap says ${lastmod} — update both`,
      );
    }

    if (!page.markdownMirror) continue;
    const mirror = markdownPath(page.slug, locale);
    assert.equal(existsSync(mirror), true, `missing Markdown mirror: ${mirror}`);
    const stamp = readPage(mirror).match(/Last updated: (\S+)/);
    assert.notEqual(stamp, null, `${mirror} must end with a "Last updated:" stamp`);
    assert.equal(
      stamp[1],
      lastmod,
      `${mirror} says ${stamp[1]} but the sitemap says ${lastmod} — update both`,
    );
  }

  assert.equal(dates.size, 1, `${page.slug} has different lastmod values per locale — translations ship together`);
}

console.log(`freshness: ${sitemapDates.size} sitemap entries agree with their pages and mirrors`);
