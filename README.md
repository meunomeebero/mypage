# Bero Land

Site pessoal estático em HTML puro, sem build step e com suporte a PT-BR e inglês.

O projeto foi organizado para ser fácil de forkear e reutilizar como template. A ideia é manter o núcleo do site simples e isolar integrações, tracking e brincadeiras em arquivos próprios.

## Estrutura

- `index.html` e páginas na raiz: versão em PT-BR
- `en/`: espelho em inglês
- `styles.css`: visual compartilhado
- `i18n.js`: switch de idioma e redirecionamento automático PT/EN
- `public/`: favicon, banner e assets estáticos
- `vercel.json`: única configuração de plataforma

## O que faz parte do template base

Se você quiser usar este projeto como ponto de partida para um site sério, estes arquivos formam o núcleo:

- páginas `*.html`
- `en/*.html`
- `styles.css`
- `i18n.js`
- `public/`
- `robots.txt`
- `sitemap.xml`
- `vercel.json`

## Scripts opcionais

Os arquivos abaixo são isolados de propósito. Você pode removê-los em um fork se não quiser tracking ou easter eggs.

- `analytics.js`
  - tracking com PostHog
  - para remover: apague o `<script src="/analytics.js"></script>` das páginas

- `troll-mode.js`
  - toggle visual de troll mode
  - para remover: apague o `<script src="/troll-mode.js"></script>` das páginas

- `troll-nyancat.js`
  - efeito visual extra do troll mode
  - para remover: apague o `<script src="/troll-nyancat.js"></script>` das páginas

- `secret-link.js`
  - ativa o easter egg do link secreto da home
  - para remover: apague o link de conteúdo secreto em `index.html` e `en/index.html`, e remova o `<script src="/secret-link.js"></script>` dessas duas páginas

- `chaos-mode.js`
  - rotina carregada sob demanda pelo easter egg
  - se `secret-link.js` sair, este arquivo deixa de ser necessário

## URLs

As URLs públicas usam formato limpo:

- `/`
- `/about`
- `/media-kit`
- `/projects`
- `/videos`
- `/contact`
- `/minilab`
- `/setup`
- `/site`
- `/en`
- equivalentes dentro de `/en/...`

As rotas antigas com `.html` continuam funcionando por redirect permanente. Essa regra fica concentrada em `vercel.json`.

## Deploy

O projeto está preparado para deploy estático na Vercel.

Pontos importantes:

- não existe build step real
- `vercel.json` controla URLs limpas e redirects legados
- `sitemap.xml` e metadados SEO já usam as URLs canônicas sem `.html`

## Preview local

Qualquer servidor estático simples resolve. Exemplo com Live Server ou similar:

```txt
http://127.0.0.1:5500/
```

## Observação

A pasta `example/` existe só como referência histórica de uma versão anterior. Ela não faz parte do template base nem do deploy.
