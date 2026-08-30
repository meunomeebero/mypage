import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { config, allPages, escapeRegExp } from "./config.mjs";

// Cache busting: every asset ships with the version declared in site.config.json.
// Change a file, bump its version there, and this gate finds the pages you missed.
const assetVersions = Object.entries(config.assetVersions);
const activePages = allPages.map((page) => page.path);

for (const page of activePages) {
  const html = readFileSync(page, "utf8");
  for (const [asset, version] of assetVersions) {
    assert.match(
      html,
      new RegExp(`/${escapeRegExp(asset)}\\?v=${escapeRegExp(version)}`),
      `${page} must load ${asset} at version ${version}`,
    );
    assert.doesNotMatch(
      html,
      new RegExp(`/${escapeRegExp(asset)}\\?v=(?!${escapeRegExp(version)})`),
      `${page} loads a stale version of ${asset} — site.config.json says ${version}`,
    );
  }
  assert.doesNotMatch(html, /troll-mode|troll-nyancat|data-troll/, `${page} must not load troll mode`);

  const isEnglish = page.startsWith("en/");
  const footer = html.match(/<footer class="footer">[\s\S]*?<\/footer>/)?.[0] || "";
  assert.equal(footer.includes(`mailto:${config.contact.email}`), true, `${page} must display a contact email in the footer`);
  assert.equal(footer.includes(config.contact.legalId), true, `${page} must display the legal registration in the footer`);
  assert.match(footer, isEnglish ? /href="\/en\/terms"/ : /href="\/terms"/, `${page} must link to terms in the footer`);
  assert.match(footer, isEnglish ? /href="\/en\/privacy"/ : /href="\/privacy"/, `${page} must link to privacy in the footer`);
}

for (const { path } of allPages.filter((page) => page.slug === "terms" || page.slug === "privacy")) {
  const html = readFileSync(path, "utf8");
  assert.equal(html.includes(config.contact.legalId), true, `${path} must identify the business registration`);
  assert.equal(html.includes(config.contact.email), true, `${path} must expose the privacy contact channel`);
}

for (const { path: page } of allPages.filter((entry) => entry.slug === "index")) {
  const html = readFileSync(page, "utf8");
  const primaryLinks = html.match(/<nav class="link-list"[^>]*>[\s\S]*?<\/nav>/)?.[0] || "";
  // The home page lists the official profiles in exactly the order declared in site.config.json.
  const expectedLinkOrder = config.socialProfiles;

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
assert.match(styles, /\.status-bar\s*\{[^}]*justify-content:\s*space-between/s);
assert.match(styles, /\.visitor-stats\s*\{[^}]*font-variant-numeric|\.visitor-stats dd\s*\{[^}]*font-variant-numeric/s);
assert.match(styles, /html\[data-input-mode="pointer"\] \.link-row:active/);
assert.match(styles, /@media \(hover: hover\) and \(pointer: fine\)/);
assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
assert.doesNotMatch(styles, /troll-switch|troll-mode-on|troll-cursor/);
assert.match(styles, /url\("\/public\/assets\/obra-de-arte-parallax\.webp\?v=2"\)/);
assert.match(styles, /\.gallery-gate__float\s*\{[^}]*gallery-gate-float/s);
assert.match(styles, /\.gallery-gate\s*\{[^}]*position:\s*relative/s);
assert.match(styles, /\.gallery-gate-stage\s*\{[^}]*place-items:\s*start center[^}]*padding-top:/s);
assert.match(styles, /\.gallery-portal\.is-bouncing \.gallery-gate\s*\{[^}]*gallery-gate-jelly-out 520ms/s);
assert.match(styles, /@keyframes gallery-gate-jelly-out/);
assert.doesNotMatch(styles, /gallery-gate__panel/);
assert.match(styles, /\.gallery__item\.is-revealing\s*\{[^}]*gallery-item-jelly-in 460ms/s);
assert.match(styles, /@keyframes gallery-item-jelly-in/);
assert.match(styles, /\.gallery\s*\{[^}]*position:\s*relative[^}]*isolation:\s*isolate/s);
assert.match(styles, /\.gallery__cluster--primary\s*\{[^}]*min-height:\s*clamp\(31rem, 64vw, 44rem\)/s);
assert.match(styles, /\.gallery__cluster--secondary\s*\{[^}]*margin-top:\s*clamp\(6rem, 10vw, 9rem\)/s);
assert.doesNotMatch(styles, /column-width:\s*19rem/);
assert.match(styles, /\.gallery__cluster--primary > \.gallery__item:nth-child\(6\)\s*\{[^}]*z-index:\s*2/s);
assert.match(styles, /\.gallery__item\.is-revealed:hover\s*\{[^}]*z-index:\s*20/s);
assert.match(styles, /\.gallery__item--lab\s*\{[^}]*top:\s*42%/s);
assert.doesNotMatch(styles, /\.gallery-portal\.is-open \.gallery__item:nth-child/);
assert.doesNotMatch(styles, /\.content--gallery::before/);
assert.doesNotMatch(styles, /gallery-backdrop-in/);
assert.doesNotMatch(styles, /--gallery-parallax-opacity/);
assert.doesNotMatch(styles, /\.gallery-parallax/);
assert.doesNotMatch(styles, /\.record--product|\.record__image/);
assert.match(styles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.gallery-gate__float[\s\S]*animation:\s*none/s);
assert.equal(existsSync("public/assets/obra-de-arte-parallax.webp"), true, "gallery parallax image must exist");

for (const { path: page } of allPages.filter((entry) => entry.slug === "gallery")) {
  const html = readFileSync(page, "utf8");
  assert.match(html, /<div class="gallery-portal" data-gallery-gate>/, `${page} must render the gallery portal`);
  assert.match(html, /class="gallery-gate"[^>]*aria-controls="gallery-collection"[^>]*aria-expanded="false"/, `${page} must expose the gallery gate state`);
  assert.match(html, /class="gallery-gate__art"/, `${page} must render the illustration as one piece`);
  assert.doesNotMatch(html, /gallery-gate__panel/, `${page} must not split the illustration`);
  assert.match(html, /class="gallery" id="gallery-collection"/, `${page} must connect the collection to its gate`);
  assert.match(html, /class="gallery__cluster gallery__cluster--primary"/, `${page} must preserve the original gallery pile`);
  assert.match(html, /class="gallery__cluster gallery__cluster--secondary"/, `${page} must render the second gallery pile separately`);
  assert.match(html, /rel="preload" as="image" href="\/public\/assets\/obra-de-arte-parallax\.webp\?v=2"/, `${page} must preload the backdrop`);
  assert.equal((html.match(/class="gallery__item/g) || []).length, 9, `${page} must render both gallery piles`);
  assert.equal((html.match(/\/public\/assets\/gallery\/[^\"]+\.webp/g) || []).length, 6, `${page} must use three optimized assets in the second pile`);
  assert.doesNotMatch(html, /bero-duck|star-eyes|bero-grin|bero-skeptic/, `${page} must not render the removed transparent characters`);
}

for (const asset of [
  "coder-relaxing.webp",
  "mirror-horse.webp",
  "html-lab.webp",
]) {
  assert.equal(existsSync(`public/assets/gallery/${asset}`), true, `${asset} must exist`);
}

for (const { path: page } of allPages.filter((entry) => entry.slug === "setup")) {
  const html = readFileSync(page, "utf8");
  assert.equal((html.match(/<article class="record">/g) || []).length, 8, `${page} must render all setup items`);
  assert.doesNotMatch(html, /record--product|record__image|\/public\/assets\/setup\//, `${page} must keep the setup list text-only`);
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
assert.match(sounds, /document\.querySelectorAll\("\.status-bar"\)/);
assert.match(sounds, /status-bar__slot status-bar__slot--left/);
assert.match(sounds, /statusBar\.prepend\(slot\)/);
assert.doesNotMatch(sounds, /sound-control__separator/);
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

console.log("interaction contract: 26 pages, persistent router, global sound lifecycle, and 20 home previews verified");
