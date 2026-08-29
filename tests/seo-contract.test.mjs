import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";

const pages = [
  ...readdirSync(".").filter((file) => file.endsWith(".html")),
  ...readdirSync("en").filter((file) => file.endsWith(".html")).map((file) => `en/${file}`),
];

const mirrorPages = new Map([
  ["index.html", "https://bero.land/index.md"],
  ["about.html", "https://bero.land/about.md"],
  ["setup.html", "https://bero.land/setup.md"],
  ["projects.html", "https://bero.land/projects.md"],
  ["media-kit.html", "https://bero.land/media-kit.md"],
  ["en/index.html", "https://bero.land/en/index.md"],
  ["en/about.html", "https://bero.land/en/about.md"],
  ["en/setup.html", "https://bero.land/en/setup.md"],
  ["en/projects.html", "https://bero.land/en/projects.md"],
  ["en/media-kit.html", "https://bero.land/en/media-kit.md"],
]);

assert.equal(pages.length, 26, "sitemap and navigation expect 26 active HTML pages");

for (const page of pages) {
  const html = readFileSync(page, "utf8");
  const isEnglish = page.startsWith("en/");

  assert.match(html, /<title>[^<]{12,}[^<]*<\/title>/, `${page} must have a useful title`);
  assert.match(html, /<meta name="description" content="[^"]{50,}">/, `${page} must have a useful description`);
  assert.match(html, /<meta name="robots" content="index,follow(?:,max-image-preview:large)?">/, `${page} must be indexable`);
  assert.match(html, /<link rel="canonical" href="https:\/\/bero\.land\/[^"]*">/, `${page} must have a canonical URL`);
  assert.match(html, /<link rel="alternate" hreflang="pt-BR" href="https:\/\/bero\.land\/[^"]*">/, `${page} must have a PT alternate`);
  assert.match(html, /<link rel="alternate" hreflang="en" href="https:\/\/bero\.land\/en[^"]*">/, `${page} must have an EN alternate`);
  assert.match(html, /<link rel="alternate" hreflang="x-default" href="https:\/\/bero\.land\/[^"]*">/, `${page} must have an x-default alternate`);
  assert.match(html, /<link rel="describedby" href="\/llms\.txt">/, `${page} must reference llms.txt`);
  assert.match(html, /<meta property="og:site_name" content="Bero">/, `${page} must use Bero as the site name`);
  assert.doesNotMatch(
    html,
    isEnglish ? /<a[^>]*href="\/en\/links">08\.[^<]*<\/a>/ : /<a[^>]*href="\/links">08\.[^<]*<\/a>/,
    `${page} must keep the links directory out of the global sidebar`,
  );

  for (const json of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    assert.doesNotThrow(() => JSON.parse(json[1]), `${page} must contain valid JSON-LD`);
  }

  const registeredCount = (html.match(/®/g) || []).length;
  const shouldShowRegisteredBrand = page === "index.html" || page === "en/index.html";
  assert.equal(registeredCount, shouldShowRegisteredBrand ? 1 : 0, `${page} must follow the home-only registered brand rule`);
}

for (const [page, markdownUrl] of mirrorPages) {
  const html = readFileSync(page, "utf8");
  assert.match(html, new RegExp(`<link rel="alternate" type="text/markdown" href="${markdownUrl.replaceAll(".", "\\.")}">`), `${page} must link to its Markdown mirror`);

  const markdownPath = markdownUrl.replace("https://bero.land/", "");
  assert.equal(existsSync(markdownPath), true, `${markdownPath} must exist`);
  const markdown = readFileSync(markdownPath, "utf8");
  assert.match(markdown, /^# /, `${markdownPath} must start with a heading`);
  assert.match(markdown, /https:\/\/bero\.land\//, `${markdownPath} must reference a canonical HTML page`);
  assert.match(markdown, /Last updated: 2026-08-28/, `${markdownPath} must expose its update date`);
}

const priorityPages = new Map([
  ["setup.html", ["Setup", "Setup | Equipamentos e ferramentas"]],
  ["projects.html", ["Projetos", "Projetos | Apps, open source e comunidade"]],
  ["media-kit.html", ["Media Kit", "Media Kit | Publicidade e parcerias"]],
  ["en/setup.html", ["Setup", "Setup | Gear and tools"]],
  ["en/projects.html", ["Projects", "Projects | Apps, open source and community"]],
  ["en/media-kit.html", ["Media Kit", "Media Kit | Brand partnerships"]],
]);

for (const [page, [heading, title]] of priorityPages) {
  const html = readFileSync(page, "utf8");
  assert.equal(html.includes(`<h1>${heading}</h1>`), true, `${page} must use the planned H1`);
  assert.equal(html.includes(`<title>${title}</title>`), true, `${page} must use the planned title`);
}

const homeSchema = JSON.parse(readFileSync("index.html", "utf8").match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const website = homeSchema["@graph"].find((item) => item["@type"] === "WebSite");
assert.equal(website.name, "Bero");
assert.deepEqual(website.alternateName, ["Bero Land", "bero.land"]);

const llms = readFileSync("llms.txt", "utf8");
assert.match(llms, /^# Bero/m);
assert.match(llms, /## Portugues/);
assert.match(llms, /## English/);
assert.match(llms, /mail@bero\.land/);
assert.match(llms, /61\.026\.871\/0001-79/);

const sitemap = readFileSync("sitemap.xml", "utf8");
assert.equal((sitemap.match(/<loc>/g) || []).length, 26, "sitemap must list all 26 HTML pages");
assert.doesNotMatch(sitemap, /<loc>https:\/\/bero\.land\/(?:en\/)?links<\/loc>/);
assert.doesNotMatch(sitemap, /\.md<\/loc>/, "Markdown mirrors must not be indexed through the sitemap");

const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
const llmsHeaders = vercel.headers.find((entry) => entry.source === "/llms.txt");
const markdownHeaders = vercel.headers.find((entry) => entry.source.includes(".md"));
assert.equal(llmsHeaders.headers.some((header) => header.key === "X-Robots-Tag" && header.value === "noindex, follow"), true);
assert.equal(markdownHeaders.headers.some((header) => header.key === "Content-Type" && header.value.startsWith("text/markdown")), true);
assert.equal(markdownHeaders.headers.some((header) => header.key === "X-Robots-Tag" && header.value === "noindex, follow"), true);

console.log("seo contract: brand, 26 pages, structured data, sitemap, and agent-readable mirrors verified");
