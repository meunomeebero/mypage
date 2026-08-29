import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const analytics = readFileSync("analytics.js", "utf8");
const visitorsApi = readFileSync("api/visitors.js", "utf8");
const portugueseHome = readFileSync("index.html", "utf8");
const englishHome = readFileSync("en/index.html", "utf8");

assert.match(analytics, /phc_ATBb9rU2g9UtZzV4eBYsGehvqUcCpL7w8KFSzRubhdUL/);
assert.match(analytics, /https:\/\/us\.i\.posthog\.com/);
assert.match(analytics, /defaults:\s*"2026-05-30"/);
assert.match(analytics, /person_profiles:\s*"identified_only"/);
assert.match(analytics, /autocapture:\s*true/);
assert.match(analytics, /disable_session_recording:\s*true/);
assert.match(analytics, /TRACKED_HOSTS\.has\(window\.location\.hostname\)/);
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
assert.match(visitorsApi, /properties\.\$host IN \('bero\.land', 'www\.bero\.land'\)/);
assert.match(visitorsApi, /AS today/);
assert.match(visitorsApi, /toStartOfMonth/);
assert.match(visitorsApi, /AS month/);
assert.match(visitorsApi, /America\/Sao_Paulo/);
assert.match(visitorsApi, /s-maxage=300, stale-while-revalidate=3600/);

for (const [home, labels] of [
  [portugueseHome, ["hoje", "mês"]],
  [englishHome, ["today", "month"]],
]) {
  assert.match(home, /data-visitor-stats/);
  assert.match(home, /data-visitor-today/);
  assert.match(home, /data-visitor-month/);
  assert.match(home, /analytics\.js\?v=20260828-6/);
  for (const label of labels) assert.match(home, new RegExp(`>${label}<`));
}

console.log("analytics contract: production-only PostHog, private visitor API, and bilingual counters verified");
