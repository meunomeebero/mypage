// Gate: every page must exist in every locale with the SAME structure.
// Copy is translated, markup is not. If you add a section, link or component to
// one locale and forget the other, this test fails and tells you where.
import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import { config, localeCodes, defaultLocale, secondaryLocales, pagePath, markdownPath, pageUrl, readPage } from "./config.mjs";

const declaredSlugs = new Set(config.pages.map((page) => page.slug));

// 1. No orphan files: what is on disk must match site.config.json, in every locale.
for (const locale of localeCodes) {
  const dir = config.locales[locale].dir;
  const onDisk = readdirSync(dir).filter((file) => file.endsWith(".html")).map((file) => file.replace(/\.html$/, ""));
  for (const slug of onDisk) {
    assert.equal(declaredSlugs.has(slug), true, `${pagePath(slug, locale)} exists but is not declared in site.config.json`);
  }
  for (const slug of declaredSlugs) {
    assert.equal(existsSync(pagePath(slug, locale)), true, `missing translation: ${pagePath(slug, locale)}`);
  }
}

// 2. Structural parity between the default locale and every translation.
const skeleton = (html) => ({
  sections: (html.match(/<section\b/g) || []).length,
  articles: (html.match(/<article\b/g) || []).length,
  headings: (html.match(/<h[1-6]\b/g) || []).length,
  anchors: (html.match(/<a\b/g) || []).length,
  images: (html.match(/<img\b/g) || []).length,
  ids: (html.match(/\sid="[^"]*"/g) || []).sort(),
  classes: (html.match(/\sclass="[^"]*"/g) || []).sort(),
  dataAttrs: (html.match(/\sdata-[a-z-]+(?==|[\s>])/g) || []).sort(),
  assets: (html.match(/\ssrc="[^"]*"/g) || []).sort(),
  // Outbound links are identity, not copy: they must be identical across locales.
  outbound: (html.match(/href="https?:\/\/[^"]*"/g) || [])
    .filter((href) => !href.includes(config.origin))
    .sort(),
  jsonLdBlocks: (html.match(/<script type="application\/ld\+json">/g) || []).length,
});

for (const { slug } of config.pages) {
  const base = skeleton(readPage(pagePath(slug, defaultLocale)));

  for (const locale of secondaryLocales) {
    const translated = skeleton(readPage(pagePath(slug, locale)));
    for (const key of Object.keys(base)) {
      assert.deepEqual(
        translated[key],
        base[key],
        `${pagePath(slug, locale)} drifted from ${pagePath(slug, defaultLocale)} on "${key}" — port the change to every locale`,
      );
    }
  }
}

// 3. Language wiring: correct lang, self-referencing canonical, reciprocal hreflang.
for (const { slug } of config.pages) {
  for (const locale of localeCodes) {
    const path = pagePath(slug, locale);
    const html = readPage(path);

    assert.match(html, new RegExp(`<html lang="${locale}">`), `${path} must declare lang="${locale}"`);
    assert.equal(
      html.includes(`<link rel="canonical" href="${pageUrl(slug, locale)}">`),
      true,
      `${path} must self-canonicalise to ${pageUrl(slug, locale)}`,
    );

    for (const alternate of localeCodes) {
      assert.equal(
        html.includes(`<link rel="alternate" hreflang="${alternate}" href="${pageUrl(slug, alternate)}">`),
        true,
        `${path} must point hreflang="${alternate}" at ${pageUrl(slug, alternate)}`,
      );
    }
    assert.equal(
      html.includes(`<link rel="alternate" hreflang="x-default" href="${pageUrl(slug, defaultLocale)}">`),
      true,
      `${path} must send x-default to the default locale`,
    );

    // Internal links must stay inside their own locale.
    const strayLocalePrefix = secondaryLocales
      .map((code) => config.locales[code].home)
      .find((home) => locale === defaultLocale && html.includes(`href="${home}/`));
    assert.equal(strayLocalePrefix, undefined, `${path} links into ${strayLocalePrefix} — keep navigation inside its locale`);

    if (locale !== defaultLocale) {
      const home = config.locales[locale].home;
      for (const { slug: other } of config.pages) {
        if (other === "index") continue;
        assert.equal(
          html.includes(`href="/${other}"`),
          false,
          `${path} links to the ${defaultLocale} route /${other} — it must use ${home}/${other}`,
        );
      }
    }
  }
}

// 4. Markdown mirrors follow the same rule: declared once, shipped in every locale.
for (const page of config.pages.filter((entry) => entry.markdownMirror)) {
  for (const locale of localeCodes) {
    const path = markdownPath(page.slug, locale);
    assert.equal(existsSync(path), true, `missing Markdown mirror: ${path}`);
    const markdown = readPage(path);
    assert.match(markdown, /^# /, `${path} must start with a heading`);
    assert.equal(
      markdown.includes(pageUrl(page.slug, locale)),
      true,
      `${path} must point at its own canonical page ${pageUrl(page.slug, locale)}`,
    );
    assert.equal(
      readPage(pagePath(page.slug, locale)).includes(`<link rel="alternate" type="text/markdown" href="${config.origin}/${path}">`),
      true,
      `${pagePath(page.slug, locale)} must link to its Markdown mirror`,
    );
  }
}

// 5. The language switch must be reachable from every page, in every locale.
for (const { slug } of config.pages) {
  for (const locale of localeCodes) {
    const path = pagePath(slug, locale);
    const html = readPage(path);
    for (const code of localeCodes) {
      assert.match(html, new RegExp(`data-lang-choice="${code}"`), `${path} must offer a switch to ${code}`);
    }
  }
}

console.log(`i18n parity: ${config.pages.length} pages x ${localeCodes.length} locales verified`);
