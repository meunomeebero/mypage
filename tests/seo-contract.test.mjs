// Gate: every page is indexable, self-describing and consistent with the brand.
// Locale wiring lives in i18n-parity.test.mjs; dates live in freshness.test.mjs.
import assert from "node:assert/strict";
import { config, localeCodes, defaultLocale, allPages, pagePath, readPage, escapeRegExp } from "./config.mjs";

for (const { path, slug, locale } of allPages) {
  const html = readPage(path);

  assert.match(html, /<title>[^<]{12,}<\/title>/, `${path} must have a useful title`);
  assert.match(html, /<meta name="description" content="[^"]{50,}">/, `${path} must have a useful description`);
  assert.match(html, /<meta name="robots" content="index,follow(?:,max-image-preview:large)?">/, `${path} must be indexable`);
  assert.match(html, /<link rel="describedby" href="\/llms\.txt">/, `${path} must reference llms.txt`);
  assert.match(
    html,
    new RegExp(`<meta property="og:site_name" content="${escapeRegExp(config.brand.name)}">`),
    `${path} must use ${config.brand.name} as the site name`,
  );

  // Open Graph and Twitter must repeat the real title, not a stale one.
  const title = html.match(/<title>([^<]+)<\/title>/)[1];
  for (const property of ['property="og:title"', 'name="twitter:title"']) {
    assert.equal(
      html.includes(`<meta ${property} content="${title}">`),
      true,
      `${path} must keep ${property} in sync with <title>`,
    );
  }

  for (const json of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    assert.doesNotThrow(() => JSON.parse(json[1]), `${path} must contain valid JSON-LD`);
  }

  // The registered trademark is claimed once, on the home page of each locale.
  const registeredCount = (html.match(/®/g) || []).length;
  assert.equal(registeredCount, slug === "index" ? 1 : 0, `${path} must follow the home-only registered brand rule`);

  // Removed pages must not creep back into the global sidebar.
  const localeHome = config.locales[locale].home;
  const retiredRoute = localeHome === "/" ? "/links" : `${localeHome}/links`;
  assert.doesNotMatch(html, new RegExp(`href="${escapeRegExp(retiredRoute)}"`), `${path} must not link to the retired links directory`);
}

const homeSchema = JSON.parse(readPage(pagePath("index", defaultLocale)).match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const website = homeSchema["@graph"].find((item) => item["@type"] === "WebSite");
assert.equal(website.name, config.brand.name);
assert.deepEqual(website.alternateName, config.brand.alternateNames);
assert.deepEqual(website.inLanguage, localeCodes);

const person = homeSchema["@graph"].find((item) => item["@type"] === "Person");
assert.equal(person.name, config.brand.person);
assert.equal(person.email, `mailto:${config.contact.email}`);
assert.deepEqual(
  [...person.sameAs].sort(),
  [...config.socialProfiles].sort(),
  "the Person schema must list exactly the profiles declared in site.config.json",
);

const llms = readPage("llms.txt");
assert.match(llms, new RegExp(`^# ${escapeRegExp(config.brand.name)}`, "m"), "llms.txt must open with the brand name");
assert.equal(llms.includes(config.contact.email), true, "llms.txt must expose the contact email");
assert.equal(llms.includes(config.contact.legalId.replace("CNPJ: ", "")), true, "llms.txt must expose the legal registration");
for (const profile of config.socialProfiles) {
  assert.equal(llms.includes(profile), true, `llms.txt must list ${profile}`);
}
for (const page of config.pages.filter((entry) => entry.markdownMirror)) {
  for (const locale of localeCodes) {
    const mirror = `${config.origin}/${pagePath(page.slug, locale).replace(/\.html$/, ".md")}`;
    assert.equal(llms.includes(mirror), true, `llms.txt must link the ${locale} mirror ${mirror}`);
  }
}

// Markdown mirrors are for agents, not for the index: they must never outrank the HTML.
const vercel = JSON.parse(readPage("vercel.json"));
const noindex = (source) => {
  const entry = vercel.headers.find((header) => header.source === source || header.source.includes(source));
  assert.notEqual(entry, undefined, `vercel.json must set headers for ${source}`);
  assert.equal(
    entry.headers.some((header) => header.key === "X-Robots-Tag" && header.value === "noindex, follow"),
    true,
    `${source} must be served as noindex, follow`,
  );
  return entry;
};
noindex("/llms.txt");
const markdownHeaders = noindex(".md");
assert.equal(
  markdownHeaders.headers.some((header) => header.key === "Content-Type" && header.value.startsWith("text/markdown")),
  true,
  "Markdown mirrors must be served as text/markdown",
);

// Clean URLs: every legacy .html route must keep redirecting.
for (const { slug, locale } of allPages) {
  const localeHome = config.locales[locale].home;
  const legacy = localeHome === "/" ? `/${slug}.html` : `${localeHome}/${slug}.html`;
  const redirect = vercel.redirects.find((entry) => entry.source === legacy);
  assert.notEqual(redirect, undefined, `vercel.json must redirect the legacy route ${legacy}`);
  assert.equal(redirect.permanent, true, `${legacy} must redirect permanently`);
}

console.log(`seo contract: ${allPages.length} pages, structured data, llms.txt and clean URLs verified`);
