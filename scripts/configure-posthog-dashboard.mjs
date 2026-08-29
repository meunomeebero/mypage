const PROJECT_ID = "483565";
const API_BASE = `https://us.posthog.com/api/projects/${PROJECT_ID}`;
const DASHBOARD_NAME = "Bero.land - Growth & Analytics";
const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;

if (!apiKey) throw new Error("POSTHOG_PERSONAL_API_KEY is required");

const headers = {
  Accept: "application/json",
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
};

const hostFilter = {
  key: "$host",
  type: "event",
  value: ["bero.land", "www.bero.land"],
  operator: "exact",
};

function eventSeries(event, name, math = "total", mathProperty) {
  return {
    kind: "EventsNode",
    event,
    name,
    math,
    ...(mathProperty ? { math_property: mathProperty } : {}),
  };
}

function trendsQuery(series, options = {}) {
  return {
    kind: "InsightVizNode",
    source: {
      kind: "TrendsQuery",
      version: 4,
      interval: options.interval || "day",
      dateRange: { date_from: options.dateFrom || "-30d", explicitDate: false },
      series,
      properties: [hostFilter, ...(options.properties || [])],
      filterTestAccounts: false,
      trendsFilter: {
        display: options.display || "ActionsLineGraph",
        showLegend: options.showLegend ?? true,
        showValuesOnSeries: options.showValues ?? false,
        yAxisScaleType: "linear",
        smoothingIntervals: 1,
        showPercentStackView: false,
        aggregationAxisFormat: options.aggregationAxisFormat || "numeric",
        showAlertThresholdLines: false,
      },
      ...(options.breakdown ? {
        breakdownFilter: {
          breakdown: options.breakdown,
          breakdown_type: "event",
        },
      } : {}),
    },
  };
}

const insights = [
  {
    name: "[Bero] Visitantes e visualizações",
    description: "Visitantes únicos e pageviews diários do bero.land.",
    query: trendsQuery([
      eventSeries("$pageview", "Visitantes únicos", "dau"),
      eventSeries("$pageview", "Visualizações", "total"),
    ]),
  },
  {
    name: "[Bero] Páginas mais visitadas",
    description: "Ranking de páginas por visualizações.",
    query: trendsQuery([eventSeries("$pageview", "Visualizações")], {
      breakdown: "page_path",
      display: "ActionsTable",
      showValues: true,
    }),
  },
  {
    name: "[Bero] Links mais clicados",
    description: "Ranking dos textos de links acionados em todo o site.",
    query: trendsQuery([eventSeries("link_clicked", "Cliques")], {
      breakdown: "link_text",
      display: "ActionsTable",
      showValues: true,
    }),
  },
  {
    name: "[Bero] Exposição e cliques por link",
    description: "Compara quantas vezes cada link ficou visível com seus cliques.",
    query: trendsQuery([
      eventSeries("link_impression", "Impressões"),
      eventSeries("link_clicked", "Cliques"),
    ], {
      breakdown: "link_text",
      display: "ActionsTable",
      showValues: true,
    }),
  },
  {
    name: "[Bero] Destinos mais clicados",
    description: "URLs de destino mais acionadas, sem parâmetros de consulta.",
    query: trendsQuery([eventSeries("link_clicked", "Cliques")], {
      breakdown: "link_href",
      display: "ActionsTable",
      showValues: true,
    }),
  },
  {
    name: "[Bero] Botões mais acionados",
    description: "Interações com botões, controles e elementos expansíveis.",
    query: trendsQuery([eventSeries("button_clicked", "Cliques")], {
      breakdown: "button_text",
      display: "ActionsTable",
      showValues: true,
    }),
  },
  {
    name: "[Bero] Profundidade de rolagem",
    description: "Distribuição dos marcos de 25%, 50%, 75%, 90% e 100%.",
    query: trendsQuery([eventSeries("scroll_depth_reached", "Leituras")], {
      breakdown: "depth_percent",
      display: "ActionsBar",
      showValues: true,
    }),
  },
  {
    name: "[Bero] Tempo ativo por página",
    description: "Média de segundos em que a página permaneceu visível e ativa.",
    query: trendsQuery([eventSeries("page_engagement_summary", "Segundos ativos", "avg", "active_seconds")], {
      breakdown: "page_name",
      display: "ActionsTable",
      showValues: true,
      aggregationAxisFormat: "duration",
    }),
  },
  {
    name: "[Bero] Origem do tráfego",
    description: "Domínios que enviaram visitantes para o site.",
    query: trendsQuery([eventSeries("$pageview", "Visitantes", "dau")], {
      breakdown: "$referring_domain",
      display: "ActionsTable",
      showValues: true,
    }),
  },
  {
    name: "[Bero] Dispositivos",
    description: "Distribuição de visitantes por tipo de dispositivo.",
    query: trendsQuery([eventSeries("$pageview", "Visitantes", "dau")], {
      breakdown: "$device_type",
      display: "ActionsPie",
      showValues: true,
    }),
  },
  {
    name: "[Bero] Idiomas",
    description: "Uso das versões em português e inglês.",
    query: trendsQuery([eventSeries("$pageview", "Visitantes", "dau")], {
      breakdown: "locale",
      display: "ActionsPie",
      showValues: true,
    }),
  },
  {
    name: "[Bero] LCP p90",
    description: "90º percentil do Largest Contentful Paint em milissegundos.",
    query: trendsQuery([eventSeries("web_vital", "LCP p90", "p90", "metric_value")], {
      properties: [{ key: "metric_name", type: "event", value: ["LCP"], operator: "exact" }],
      aggregationAxisFormat: "duration",
    }),
  },
  {
    name: "[Bero] INP p90",
    description: "90º percentil do Interaction to Next Paint em milissegundos.",
    query: trendsQuery([eventSeries("web_vital", "INP p90", "p90", "metric_value")], {
      properties: [{ key: "metric_name", type: "event", value: ["INP"], operator: "exact" }],
      aggregationAxisFormat: "duration",
    }),
  },
  {
    name: "[Bero] CLS p90",
    description: "90º percentil do Cumulative Layout Shift.",
    query: trendsQuery([eventSeries("web_vital", "CLS p90", "p90", "metric_value")], {
      properties: [{ key: "metric_name", type: "event", value: ["CLS"], operator: "exact" }],
    }),
  },
  {
    name: "[Bero] Erros do site",
    description: "Erros JavaScript, promises rejeitadas e falhas no carregamento de recursos.",
    query: trendsQuery([
      eventSeries("javascript_error", "JavaScript"),
      eventSeries("unhandled_promise_rejection", "Promises"),
      eventSeries("resource_load_error", "Recursos"),
    ], { showValues: true }),
  },
];

async function api(path, options = {}) {
  const response = await fetch(API_BASE + path, { headers, ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${options.method || "GET"} ${path}: ${response.status} ${JSON.stringify(body)}`);
  return body;
}

const dashboards = await api("/dashboards/?limit=100");
let dashboard = dashboards.results.find((item) => item.name === DASHBOARD_NAME);
if (!dashboard) {
  dashboard = await api("/dashboards/", {
    method: "POST",
    body: JSON.stringify({
      name: DASHBOARD_NAME,
      description: "Tráfego, cliques, engajamento, aquisição, desempenho e estabilidade do bero.land.",
      pinned: true,
      tags: ["bero.land", "growth"],
    }),
  });
}

const savedInsights = await api("/insights/?limit=200");
for (const definition of insights) {
  const existing = savedInsights.results.find((item) => item.name === definition.name);
  const payload = {
    ...definition,
    dashboards: [dashboard.id],
    tags: ["bero.land", "growth"],
  };
  if (existing) {
    await api(`/insights/${existing.id}/`, { method: "PATCH", body: JSON.stringify(payload) });
  } else {
    await api("/insights/", { method: "POST", body: JSON.stringify(payload) });
  }
}

console.log(JSON.stringify({ dashboardId: dashboard.id, dashboardName: dashboard.name, insights: insights.length }));
