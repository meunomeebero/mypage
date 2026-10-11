import assert from "node:assert/strict";
import handler from "../api/visitors.js";

const originalFetch = globalThis.fetch;
const originalKey = process.env.POSTHOG_PERSONAL_API_KEY;
let calls = 0;

async function request(method = "GET") {
  const response = {
    headers: {},
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
  };
  await handler({ method }, response);
  return response;
}

function mock(payload, ok = true) {
  globalThis.fetch = async (_, options) => {
    calls++;
    assert.match(options.headers.Authorization, /^Bearer /);
    const query = JSON.parse(options.body).query;
    assert.equal(query.kind, "HogQLQuery");
    assert.match(query.query, /count\(\) AS total/);
    assert.match(query.query, /min\(timestamp\)/);
    assert.match(query.query, /event = '\$pageview'/);
    assert.match(query.query, /properties\.\$host IN/);
    assert.ok(options.signal instanceof AbortSignal);
    return { ok, status: ok ? 200 : 500, json: async () => payload };
  };
}

try {
  delete process.env.POSTHOG_PERSONAL_API_KEY;
  mock({});
  assert.equal((await request("POST")).code, 405);
  assert.equal((await request()).code, 503);
  assert.equal(calls, 0, "missing credentials and unsupported methods must never query PostHog");

  process.env.POSTHOG_PERSONAL_API_KEY = "test-only";
  mock({ results: [[12345, "2026-08-28"]] });
  const valid = await request();
  assert.equal(valid.code, 200);
  assert.equal(valid.body.total, 12345);
  assert.equal(valid.body.since, "2026-08-28");
  assert.equal(valid.body.timezone, "America/Sao_Paulo");
  assert.match(valid.headers["Cache-Control"], /s-maxage=300/);
  assert.equal(valid.body.today, undefined);
  assert.equal(valid.body.month, undefined);

  mock({ results: [[0, "1970-01-01"]] });
  const empty = await request();
  assert.equal(empty.code, 200);
  assert.equal(empty.body.total, 0);
  assert.equal(empty.body.since, null, "no traffic must not invent a start date");

  for (const payload of [{}, { results: [] }, { results: [[null, null]] },
    { results: [[-1, "2026-08-28"]] }, { results: [["bad", "2026-08-28"]] },
    { results: [[true, "2026-08-28"]] }, { results: [[1, null]] },
    { results: [[1, "2026-02-31"]] }, { results: [[1, "yesterday"]] }]) {
    mock(payload);
    const result = await request();
    assert.equal(result.code, 502, "bad upstream data must not be reported as zero visits");
    assert.equal(result.headers["Cache-Control"], "no-store");
    assert.equal(result.body.total, undefined);
  }
  mock({}, false);
  assert.equal((await request()).code, 502);
  globalThis.fetch = async () => { throw new Error("test transport failure"); };
  assert.equal((await request()).code, 502);
} finally {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.POSTHOG_PERSONAL_API_KEY;
  else process.env.POSTHOG_PERSONAL_API_KEY = originalKey;
}

console.log("visitor runtime: total, first date, empty dataset, upstream errors and private credentials verified");
