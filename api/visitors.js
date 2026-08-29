const POSTHOG_PROJECT_ID = "483565";
const POSTHOG_QUERY_URL = `https://us.posthog.com/api/projects/${POSTHOG_PROJECT_ID}/query/`;
const CACHE_HEADER = "public, s-maxage=300, stale-while-revalidate=3600";

const VISITOR_QUERY = `
  SELECT
    count(DISTINCT if(
      toTimeZone(timestamp, 'America/Sao_Paulo') >= toStartOfDay(now('America/Sao_Paulo')),
      distinct_id,
      NULL
    )) AS today,
    count(DISTINCT if(
      toTimeZone(timestamp, 'America/Sao_Paulo') >= toStartOfMonth(now('America/Sao_Paulo')),
      distinct_id,
      NULL
    )) AS month
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

    response.setHeader("Cache-Control", CACHE_HEADER);
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    return response.status(200).json({
      today: Math.max(0, Number(row[0]) || 0),
      month: Math.max(0, Number(row[1]) || 0),
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
