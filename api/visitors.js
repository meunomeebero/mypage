// Override with the POSTHOG_PROJECT_ID environment variable when forking.
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID || "483565";
const POSTHOG_QUERY_URL = `https://us.posthog.com/api/projects/${POSTHOG_PROJECT_ID}/query/`;
const CACHE_HEADER = "public, s-maxage=300, stale-while-revalidate=3600";

const VISITOR_QUERY = `
  SELECT
    count() AS total,
    toString(toDate(toTimeZone(min(timestamp), 'America/Sao_Paulo'))) AS since
  FROM events
  WHERE event = '$pageview'
    AND properties.$host IN ('bero.land', 'www.bero.land')
`;

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  if (!apiKey) {
    response.setHeader("Cache-Control", "no-store");
    return response.status(503).json({ error: "Visitor count unavailable" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const posthogResponse = await fetch(POSTHOG_QUERY_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: { kind: "HogQLQuery", query: VISITOR_QUERY } }),
      signal: controller.signal,
    });

    if (!posthogResponse.ok) throw new Error(`PostHog returned ${posthogResponse.status}`);
    const payload = await posthogResponse.json();
    const row = Array.isArray(payload.results) ? payload.results[0] : null;
    if (!Array.isArray(row)) throw new Error("Unexpected PostHog response");

    const total = Number(row[0]);
    const since = total === 0 ? null : row[1];
    if (!Number.isSafeInteger(total) || total < 0 || !/^[0-9]+$/.test(String(row[0]))) {
      throw new Error("Invalid visit count");
    }
    if (total > 0 && (typeof since !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(since) || !Number.isFinite(Date.parse(since)) || new Date(since).toISOString().slice(0, 10) !== since)) {
      throw new Error("Invalid first visit date");
    }

    response.setHeader("Cache-Control", CACHE_HEADER);
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    return response.status(200).json({
      total,
      since,
      updatedAt: new Date().toISOString(),
      timezone: "America/Sao_Paulo",
    });
  } catch (_) {
    response.setHeader("Cache-Control", "no-store");
    return response.status(502).json({ error: "Visitor count unavailable" });
  } finally {
    clearTimeout(timeout);
  }
}
