# Analytics do bero.land

## Visão geral

O navegador envia eventos somente quando o host é `bero.land` ou `www.bero.land`. Acessos locais e previews não contaminam os dados de produção.

O contador da home consulta `/api/visitors`, que acessa o PostHog no servidor com `POSTHOG_PERSONAL_API_KEY`. A chave privada nunca é enviada ao navegador.

## Métricas coletadas

- Pageviews e visitantes únicos
- Cliques e impressões de links e botões
- Profundidade de rolagem
- Tempo ativo e tempo total por página
- Origem, dispositivo e idioma
- Tempo de navegação interna
- LCP, CLS e INP
- Erros JavaScript, promises rejeitadas e recursos que falharam

Gravação de sessão, movimentos do mouse e conteúdo digitado permanecem desativados.

## Painel

O painel `Bero.land - Growth & Analytics` pertence ao projeto PostHog `483565`. Suas análises são filtradas por `$host` para não misturar os eventos de outros produtos existentes no mesmo projeto.

Para recriar ou atualizar o painel de forma idempotente:

```sh
set -a
source .env.local
set +a
node scripts/configure-posthog-dashboard.mjs
```

## Contador público

`hoje` e `mês` representam visitantes únicos com evento `$pageview`. O dia e o mês atual seguem o fuso `America/Sao_Paulo`. A resposta fica em cache por cinco minutos na CDN e no navegador.
