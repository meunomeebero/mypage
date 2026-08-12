import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";

const styleVersion = "20260804-11";
const scriptVersion = "20260804-5";
const globalScripts = [
  "analytics.js",
  "local-routing.js",
  "i18n.js",
  "interaction-sounds.js",
  "link-previews.js",
  "secret-link.js",
  "avatar-spin.js",
  "lite-embed.js",
  "app-router.js",
];
const activePages = [
  ...readdirSync(".").filter((file) => file.endsWith(".html")),
  ...readdirSync("en").filter((file) => file.endsWith(".html")).map((file) => `en/${file}`),
];

assert.equal(activePages.length, 22, "expected all 22 active pages");

for (const page of activePages) {
  const html = readFileSync(page, "utf8");
  assert.match(html, new RegExp(`/styles\\.css\\?v=${styleVersion}`), `${page} must version styles.css`);
  for (const script of globalScripts) {
    const version = script === "interaction-sounds.js" ? "20260804-6" : scriptVersion;
    assert.match(html, new RegExp(`/${script.replaceAll(".", "\\.")}\\?v=${version}`), `${page} must load ${script}`);
  }
  assert.match(html, /\/gallery-gate\.js\?v=20260804-3/, `${page} must load the gallery gate lifecycle`);
  assert.doesNotMatch(html, /troll-mode|troll-nyancat|data-troll/, `${page} must not load troll mode`);
}

for (const page of ["index.html", "en/index.html"]) {
  const html = readFileSync(page, "utf8");
  const primaryLinks = html.match(/<nav class="link-list"[^>]*>[\s\S]*?<\/nav>/)?.[0] || "";
  const expectedLinkOrder = [
    "https://x.com/meunomeebero",
    "https://www.instagram.com/meunomeebero",
    "https://www.youtube.com/@beroodev",
    "https://www.youtube.com/@meunomeebero",
    "https://discord.com/servers/mansao-dev-1132161173484224642",
    "https://github.com/meunomeebero",
    "https://www.tiktok.com/@meunomeebero",
  ];

  assert.equal((html.match(/data-link-detail=/g) || []).length, 10, `${page} must have 10 direct link previews`);
  assert.equal((html.match(/<article class="featured-link">/g) || []).length, 10, `${page} must have 10 featured partners and projects`);
  assert.doesNotMatch(html, /linkedin\.com|>LinkedIn</i, `${page} must not expose LinkedIn`);
  assert.doesNotMatch(html, /runable\.com|>Runable</i, `${page} must not expose Runable`);
  assert.match(html, /66jYFFOmaZL4QONgNVHg\?ref=B5M7dSuHPHP1u3gDsSU0&amp;coupon=BERODEV/, `${page} must use the System Design referral URL`);
  assert.match(html, /L8wi9vio7WPnWbmF8ZIO\?ref=FyaI5qxfirL1UeRhJPum&amp;coupon=BERODEV/, `${page} must expose the data structures course`);
  assert.match(html, /hrZKmxeXzeLN8AvObjVJ\?ref=adQ9XhnXq6HLVohiypPx&amp;coupon=BERODEV/, `${page} must expose the job roadmap`);

  let previousLinkIndex = -1;
  for (const href of expectedLinkOrder) {
    const currentLinkIndex = primaryLinks.indexOf(`href="${href}"`);
    assert.ok(currentLinkIndex > previousLinkIndex, `${page} must preserve the requested primary-link order`);
    previousLinkIndex = currentLinkIndex;
  }
}

const styles = readFileSync("styles.css", "utf8");
assert.match(styles, /\.link-row__detail\s*\{[^}]*position:\s*absolute/s);
assert.match(styles, /\.link-row__detail\s*\{[^}]*opacity:\s*0/s);
assert.match(styles, /\.link-row--preview:hover \.link-row__detail/);
assert.match(styles, /\.link-row--preview:focus-visible \.link-row__detail/);
assert.match(styles, /\.sidebar__subnav\[hidden\]\s*\{[^}]*display:\s*none/s);
assert.match(styles, /\.sidebar__subnav\.is-expanded/);
assert.match(styles, /\.sidebar__index-group:not\(\.is-route-active\) \.sidebar__subnav/);
assert.match(styles, /--ease-out:\s*cubic-bezier\(0\.23, 1, 0\.32, 1\)/);
assert.match(styles, /--ease-in-out:\s*cubic-bezier\(0\.77, 0, 0\.175, 1\)/);
assert.match(styles, /html\.is-route-leaving \.main/);
assert.match(styles, /html\.is-route-entering \.main/);
assert.match(styles, /transition:\s*opacity var\(--route-duration\) var\(--ease-out\)/);
assert.match(styles, /html\.is-route-entering \.content\s*\{[^}]*translateY\(0\.25rem\)/s);
assert.match(styles, /\.sound-control\[aria-pressed="false"\]/);
assert.match(styles, /html\[data-input-mode="pointer"\] \.link-row:active/);
assert.match(styles, /@media \(hover: hover\) and \(pointer: fine\)/);
assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
assert.doesNotMatch(styles, /troll-switch|troll-mode-on|troll-cursor/);
assert.match(styles, /url\("\/public\/assets\/obra-de-arte-parallax\.webp\?v=2"\)/);
assert.match(styles, /\.gallery-gate__float\s*\{[^}]*gallery-gate-float/s);
assert.match(styles, /\.gallery-gate\s*\{[^}]*position:\s*relative/s);
assert.match(styles, /\.gallery-portal\.is-bouncing \.gallery-gate\s*\{[^}]*gallery-gate-jelly-out 520ms/s);
assert.match(styles, /@keyframes gallery-gate-jelly-out/);
assert.doesNotMatch(styles, /gallery-gate__panel/);
assert.match(styles, /\.gallery__item\.is-revealing\s*\{[^}]*gallery-item-jelly-in 460ms/s);
assert.match(styles, /@keyframes gallery-item-jelly-in/);
assert.doesNotMatch(styles, /\.gallery-portal\.is-open \.gallery__item:nth-child/);
assert.doesNotMatch(styles, /\.content--gallery::before/);
assert.doesNotMatch(styles, /gallery-backdrop-in/);
assert.doesNotMatch(styles, /--gallery-parallax-opacity/);
assert.doesNotMatch(styles, /\.gallery-parallax/);
assert.match(styles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.gallery-gate__float[\s\S]*animation:\s*none/s);
assert.equal(existsSync("public/assets/obra-de-arte-parallax.webp"), true, "gallery parallax image must exist");

for (const page of ["gallery.html", "en/gallery.html"]) {
  const html = readFileSync(page, "utf8");
  assert.match(html, /<div class="gallery-portal" data-gallery-gate>/, `${page} must render the gallery portal`);
  assert.match(html, /class="gallery-gate"[^>]*aria-controls="gallery-collection"[^>]*aria-expanded="false"/, `${page} must expose the gallery gate state`);
  assert.match(html, /class="gallery-gate__art"/, `${page} must render the illustration as one piece`);
  assert.doesNotMatch(html, /gallery-gate__panel/, `${page} must not split the illustration`);
  assert.match(html, /class="gallery" id="gallery-collection"/, `${page} must connect the collection to its gate`);
  assert.match(html, /rel="preload" as="image" href="\/public\/assets\/obra-de-arte-parallax\.webp\?v=2"/, `${page} must preload the backdrop`);
}

const galleryGate = readFileSync("gallery-gate.js", "utf8");
assert.match(galleryGate, /window\.BeroGalleryGate = Object\.freeze/);
assert.match(galleryGate, /collection\.hidden = true/);
assert.match(galleryGate, /collection\.inert = true/);
assert.match(galleryGate, /collection\.setAttribute\("aria-hidden", "true"\)/);
assert.match(galleryGate, /document\.documentElement\.dataset\.inputMode === "keyboard"/);
assert.match(galleryGate, /reduceMotion\.matches \|\| event\.detail === 0/);
assert.match(galleryGate, /portal\.classList\.add\("is-bouncing"\)/);
assert.match(galleryGate, /event\.animationName !== "gallery-gate-jelly-out"/);
assert.match(galleryGate, /window\.setTimeout\(revealCollection, 580\)/);
assert.match(galleryGate, /gate\.setAttribute\("aria-expanded", "true"\)/);
assert.match(galleryGate, /collection\.inert = false/);
assert.match(galleryGate, /portal\.classList\.add\("is-open"\)/);
assert.match(galleryGate, /const ITEM_REVEAL_INTERVAL = 180/);
assert.match(galleryGate, /item\.classList\.add\("is-revealed", "is-revealing"\)/);
assert.match(galleryGate, /kind: "reveal", profile: "gallery-" \+ index/);
assert.match(galleryGate, /window\.addEventListener\("bero:page-leave", clearRevealTimers\)/);
assert.match(galleryGate, /window\.addEventListener\("bero:page-enter"/);

const sounds = readFileSync("interaction-sounds.js", "utf8");
assert.match(sounds, /const INTERACTION_RULES = \[/);
assert.match(sounds, /window\.BeroSound = Object\.freeze/);
assert.match(sounds, /\.link-row, \.cta-button, \.gallery__frame/);
assert.match(sounds, /button:not\(\[disabled\]\), summary, \[role='button'\]/);
assert.match(sounds, /document\.addEventListener\("pointerover"/);
assert.match(sounds, /document\.addEventListener\("pointerdown"/);
assert.match(sounds, /window\.addEventListener\("scroll", handleScroll/);
assert.match(sounds, /window\.addEventListener\("bero:page-enter"/);
assert.match(sounds, /unlock\(\)\.then/);
assert.match(sounds, /setState\(enabled \? \(context\.state === "running" \? "ready" : "locked"\) : "muted"\)/);
assert.match(sounds, /document\.documentElement\.dataset\.inputMode = inputMode/);
assert.match(sounds, /kind === "navigate-out" \|\| kind === "navigate-in"/);
assert.match(sounds, /kind === "reveal"/);
assert.match(sounds, /const base = 360 \+ step \* 26/);
assert.match(sounds, /play\("scroll", "page"\)/);
assert.equal(existsSync("troll-mode.js"), false, "troll-mode.js must be removed");
assert.equal(existsSync("troll-nyancat.js"), false, "troll-nyancat.js must be removed");

const router = readFileSync("app-router.js", "utf8");
assert.match(router, /window\.BeroRouter = Object\.freeze/);
assert.match(router, /const EXIT_DURATION = 90/);
assert.match(router, /function beginEntrance\(shouldAnimate\)/);
assert.match(router, /navigate\(anchor\.href, \{ animate: event\.detail > 0 \}\)/);
assert.match(router, /saveCurrent: false,\s*animate: false,/s);
assert.equal((router.match(/currentNavigationId !== navigationId/g) || []).length, 2);
assert.match(router, /history\.pushState/);
assert.match(router, /window\.addEventListener\("popstate"/);
assert.match(router, /document\.body\.replaceWith\(nextBody\)/);
assert.match(router, /bero:page-leave/);
assert.match(router, /bero:page-enter/);
assert.match(router, /BeroSound\?\.play\("navigate-in", "navigation"\)/);

const previews = readFileSync("link-previews.js", "utf8");
assert.match(previews, /\.featured-link > \.link-row/);
assert.match(previews, /sourceNodes\.forEach\(function\(node\) \{ node\.remove\(\); \}\)/);

console.log("interaction contract: 22 pages, persistent router, global sound lifecycle, and 20 home previews verified");
