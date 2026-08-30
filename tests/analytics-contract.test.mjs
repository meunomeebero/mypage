// Gate: analytics only fires in production, keeps the private key server-side,
// and reports the same numbers in every locale.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { config, defaultLocale, localeCodes, pagePath, escapeRegExp } from "./config.mjs";

const { publicKey, apiHost, trackedHosts, timezone } = config.analytics;
const analytics = readFileSync("analytics.js", "utf8");
const visitorsApi = readFileSync("api/visitors.js", "utf8");
const portugueseHome = readFileSync(pagePath("index", defaultLocale), "utf8");
const englishHome = readFileSync(pagePath("index", "en"), "utf8");

assert.equal(analytics.includes(publicKey), true, "analytics.js must use the public key from site.config.json");
assert.equal(analytics.includes(apiHost), true, "analytics.js must use the API host from site.config.json");
// The public key is safe in the browser; the personal API key never is.
assert.doesNotMatch(analytics, /phx_[A-Za-z0-9]/, "analytics.js must never embed a personal API key");
assert.match(analytics, /defaults:\s*"2026-05-30"/);
assert.match(analytics, /person_profiles:\s*"identified_only"/);
assert.match(analytics, /autocapture:\s*true/);
assert.match(analytics, /disable_session_recording:\s*true/);
assert.match(analytics, /TRACKED_HOSTS\.has\(window\.location\.hostname\)/);
for (const host of trackedHosts) {
  assert.equal(analytics.includes(`"${host}"`), true, `analytics.js must track ${host}`);
}
assert.equal(localeCodes.length >= 2, true, "the visitor counter is asserted per locale");
assert.doesNotMatch(analytics, /phc_j0R4f80F53ctkaYdSz9VEc0Vz1wFrs7V34jQszuSdN7/);
assert.doesNotMatch(analytics, /analytics\.bero\.land/);

for (const eventName of [
  "$pageview",
  "link_clicked",
  "link_impression",
  "button_clicked",
  "scroll_depth_reached",
  "engagement_milestone_reached",
  "page_engagement_summary",
  "route_transition_completed",
  "navigation_performance",
  "web_vital",
  "javascript_error",
  "resource_load_error",
  "unhandled_promise_rejection",
]) {
  assert.match(analytics, new RegExp(eventName.replace("$", "\\$")), `analytics must capture ${eventName}`);
}

assert.match(analytics, /window\.addEventListener\("bero:route-complete"/);
assert.match(analytics, /new IntersectionObserver/);
assert.match(analytics, /capturePageView\("soft_navigation"\)/);
assert.match(analytics, /new Intl\.NumberFormat\(getLocale\(\)\)/);
assert.match(analytics, /fetch\("\/api\/visitors"/);

assert.match(visitorsApi, /process\.env\.POSTHOG_PERSONAL_API_KEY/);
assert.doesNotMatch(visitorsApi, /phx_[A-Za-z0-9]+/);
assert.match(visitorsApi, /projects\/\$\{POSTHOG_PROJECT_ID\}\/query/);
const hostList = trackedHosts.map((host) => `'${host}'`).join(", ");
assert.equal(visitorsApi.includes(`properties.$host IN (${hostList})`), true, "the visitor API must filter by the tracked hosts");
assert.equal(visitorsApi.includes(config.analytics.projectId), true, "the visitor API must query the configured project");
assert.match(visitorsApi, /AS today/);
assert.match(visitorsApi, /toStartOfMonth/);
assert.match(visitorsApi, /AS month/);
assert.equal(visitorsApi.includes(timezone), true, "the visitor API must resolve days and months in the configured timezone");
assert.match(visitorsApi, /s-maxage=300, stale-while-revalidate=3600/);

for (const [home, labels] of [
  [portugueseHome, ["hoje", "mês"]],
  [englishHome, ["today", "month"]],
]) {
  assert.match(home, /data-visitor-stats/);
  assert.match(home, /data-visitor-today/);
  assert.match(home, /data-visitor-month/);
  assert.match(home, new RegExp(`analytics\\.js\\?v=${escapeRegExp(config.assetVersions["analytics.js"])}`));
  for (const label of labels) assert.match(home, new RegExp(`>${label}<`));
}

console.log("analytics contract: production-only PostHog, private visitor API, and bilingual counters verified");
