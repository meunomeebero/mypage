(function() {
  const BRAZIL_TIMEZONES = new Set([
    'America/Sao_Paulo',
    'America/Fortaleza',
    'America/Recife',
    'America/Bahia',
    'America/Belem',
    'America/Manaus',
    'America/Cuiaba',
    'America/Porto_Velho',
    'America/Boa_Vista',
    'America/Rio_Branco',
    'America/Araguaina',
    'America/Maceio',
    'America/Noronha'
  ]);

  function detectLanguage() {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const locale = (navigator.language || '').toLowerCase();
    const isBrazil = BRAZIL_TIMEZONES.has(timezone) || locale.endsWith('-br');
    return isBrazil ? 'pt-BR' : 'en';
  }

  function setText(selector, value) {
    const node = document.querySelector(selector);
    if (node) {
      node.textContent = value;
    }
  }

  function setHTML(selector, value) {
    const node = document.querySelector(selector);
    if (node) {
      node.innerHTML = value;
    }
  }

  function setMeta(selector, value) {
    const node = document.querySelector(selector);
    if (node) {
      node.setAttribute('content', value);
    }
  }

  function setAttr(selector, attr, value) {
    const node = document.querySelector(selector);
    if (node) {
      node.setAttribute(attr, value);
    }
  }

  function pageName() {
    const pathname = window.location.pathname;
    const last = pathname.split('/').pop();
    return last && last.length ? last : 'index.html';
  }

  function applyGlobalLabels(locale) {
    const navLabels = locale === 'pt-BR'
      ? ['00. links', '01. sobre', '02. media kit', '03. projetos', '04. videos', '05. contato']
      : ['00. links', '01. about', '02. media kit', '03. projects', '04. videos', '05. contact'];

    setAttr('.sidebar', 'aria-label', locale === 'pt-BR' ? 'Paginas' : 'Pages');

    document.querySelectorAll('.sidebar__nav a').forEach(function(node, index) {
      if (navLabels[index]) {
        node.textContent = navLabels[index];
      }
    });
  }

  const translations = {
    'index.html': {
      'pt-BR': {
        title: 'Bero Land | Links',
        metaDescription: 'Links oficiais do Bero. Home estatica com acesso rapido para canais, projetos, comunidade e contato comercial.',
        ogTitle: 'Bero Land | Links',
        ogDescription: 'Links oficiais do Bero em uma home estatica, com sidebar para about, media kit, projects, videos e contact.',
        twitterTitle: 'Bero Land | Links',
        twitterDescription: 'Home com links oficiais do Bero e acesso lateral para o restante do perfil.',
        texts: [
          ['.sidebar__label', 'paginas'],
          ['.status-bar span:last-child', 'static html / links first'],
          ['.hero .eyebrow', 'Creator / Programmer / Brand Partnerships'],
          ['.hero .lede', 'Desenvolvedor brasileiro baseado em Sao Jose dos Campos. 6+ anos programando, 10+ anos criando conteudo e + de 360 mil seguidores e inscritos somados nas plataformas.'],
          ['#primary-links-title', 'Primary Links'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(1) .link-row__meta', 'channel'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(2) .link-row__meta', 'channel'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(3) .link-row__meta', 'code'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(4) .link-row__meta', 'updates'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(5) .link-row__meta', 'stories'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(6) .link-row__meta', 'shorts'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(7) .link-row__meta', 'work'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(8) .link-row__meta', 'community'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(9) .link-row__meta', 'email'],
          ['#secret-trigger span:first-child', 'Conteudo secreto'],
          ['#secret-trigger .link-row__meta', 'descubra'],
          ['#routing-title', 'Cursos / Comunidades'],
          ['.featured-link:nth-of-type(1) .link-row__meta', 'community'],
          ['.featured-link:nth-of-type(1) .featured-link__text', 'Comunidade fechada para networking, compartilhamento de conhecimento, eventos ao vivo e acompanhamento em grupo, com planos a partir de R$ 0.'],
          ['.featured-link:nth-of-type(1) .featured-link__note', 'Iniciativas: clube do livro tecnico, clube do ingles tech, maratona de SaaS e BeroLab Open Source.'],
          ['.featured-link:nth-of-type(2) .link-row__meta', 'course'],
          ['.featured-link:nth-of-type(2) .featured-link__text', 'Uma hora e meia de conteudo, saindo do zero em JavaScript ate a criacao de um bot de WhatsApp integrado com GPT, por R$ 37.'],
          ['#secondary-links-title', 'Other links'],
          ['.link-list[aria-label="Links sociais"] a:nth-of-type(1) .link-row__meta', 'document'],
          ['.link-list[aria-label="Links sociais"] a:nth-of-type(2) .link-row__meta', 'play'],
          ['.footer p:first-child', 'bero.land. Todos os direitos reservados.'],
          ['.footer p:nth-child(2)', 'Curtiu o projeto? Deixe uma estrela no repo: <a href="https://github.com/meunomeebero/linktree" target="_blank" rel="noopener noreferrer">github.com/meunomeebero/linktree</a>', 'html']
        ]
      },
      en: {
        title: 'Bero Land | Links',
        metaDescription: 'Official Bero links. Static home with quick access to channels, projects, community and business contact.',
        ogTitle: 'Bero Land | Links',
        ogDescription: 'Official Bero links in a static home, with a sidebar for about, media kit, projects, videos and contact.',
        twitterTitle: 'Bero Land | Links',
        twitterDescription: 'Home with Bero official links and sidebar access to the rest of the profile.',
        texts: [
          ['.sidebar__label', 'pages'],
          ['.status-bar span:last-child', 'static html / links first'],
          ['.hero .eyebrow', 'Creator / Programmer / Brand Partnerships'],
          ['.hero .lede', 'Brazilian developer based in Sao Jose dos Campos. 6+ years coding, 10+ years creating content and 360k+ followers and subscribers combined across platforms.'],
          ['#primary-links-title', 'Primary Links'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(1) .link-row__meta', 'channel'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(2) .link-row__meta', 'channel'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(3) .link-row__meta', 'code'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(4) .link-row__meta', 'updates'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(5) .link-row__meta', 'stories'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(6) .link-row__meta', 'shorts'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(7) .link-row__meta', 'work'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(8) .link-row__meta', 'community'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(9) .link-row__meta', 'email'],
          ['#secret-trigger span:first-child', 'Secret content'],
          ['#secret-trigger .link-row__meta', 'discover'],
          ['#routing-title', 'Courses / Communities'],
          ['.featured-link:nth-of-type(1) .link-row__meta', 'community'],
          ['.featured-link:nth-of-type(1) .featured-link__text', 'Private community for networking, knowledge sharing, live events and group accountability, with plans starting at R$ 0.'],
          ['.featured-link:nth-of-type(1) .featured-link__note', 'Initiatives: technical book club, tech English club, SaaS marathon and BeroLab Open Source.'],
          ['.featured-link:nth-of-type(2) .link-row__meta', 'course'],
          ['.featured-link:nth-of-type(2) .featured-link__text', 'Ninety minutes of content, going from zero in JavaScript to building a WhatsApp bot integrated with GPT, for R$ 37.'],
          ['#secondary-links-title', 'Other links'],
          ['.link-list[aria-label="Links sociais"] a:nth-of-type(1) .link-row__meta', 'document'],
          ['.link-list[aria-label="Links sociais"] a:nth-of-type(2) .link-row__meta', 'play'],
          ['.footer p:first-child', 'bero.land. All rights reserved.'],
          ['.footer p:nth-child(2)', 'Enjoyed the project? Leave a star on the repo: <a href="https://github.com/meunomeebero/linktree" target="_blank" rel="noopener noreferrer">github.com/meunomeebero/linktree</a>', 'html']
        ]
      }
    },
    'about.html': {
      'pt-BR': {
        title: 'Bero Land | About',
        metaDescription: 'About do Bero: identidade de marca, areas de atuacao e posicionamento como criador de conteudo e programador.',
        ogTitle: 'Bero Land | About',
        ogDescription: 'Quem e Bero, como a marca opera e quais assuntos atravessam o conteudo e os projetos.',
        twitterTitle: 'Bero Land | About',
        twitterDescription: 'Identidade, posicionamento e areas de atuacao do Bero.',
        texts: [
          ['.sidebar__label', 'paginas'],
          ['.status-bar span:last-child', 'brand identity'],
          ['.hero .eyebrow', 'About'],
          ['.hero .subtitle', 'Bero e meu nome artistico. Profissionalmente, eu tambem assino como Roberto Junior.'],
          ['#about-title', 'Positioning'],
          ['.section:nth-of-type(1) .body-copy p:nth-of-type(1)', 'Eu sou o Bero, nome artistico de Roberto Junior. Sou um desenvolvedor brasileiro baseado em Sao Jose dos Campos, programo ha mais de 6 anos e atualmente trabalho na Ask.com como Software Engineer com foco em Golang e Python.'],
          ['.section:nth-of-type(1) .body-copy p:nth-of-type(2)', 'Hoje minha stack principal e Node.js com TypeScript, Golang e Next.js. No conteudo, misturo animacao, carreira, programacao, mercado tech, mundo corporativo sem eufemismos e dicas de investimento para jovens da geracao milenial e Z que ainda estao se encontrando na carreira.'],
          ['#identity-title', 'Identity Markers'],
          ['.info-grid .fact:nth-of-type(1) dt', 'Base'],
          ['.info-grid .fact:nth-of-type(2) dt', 'Experiencia'],
          ['.info-grid .fact:nth-of-type(3) dt', 'Historico profissional'],
          ['.info-grid .fact:nth-of-type(4) dt', 'Stack atual'],
          ['.info-grid .fact:nth-of-type(5) dt', 'Ferramentas do dia a dia'],
          ['.info-grid .fact:nth-of-type(6) dt', 'Foco de mercado'],
          ['.info-grid .fact:nth-of-type(7) dt', 'Nome'],
          ['.info-grid .fact:nth-of-type(8) dt', 'Funcoes'],
          ['.info-grid .fact:nth-of-type(9) dt', 'Temas'],
          ['.info-grid .fact:nth-of-type(10) dt', 'Foco atual'],
          ['.info-grid .fact:nth-of-type(10) dd', 'Continuar crescendo como dev, desenvolver meus projetos pessoais e construir a melhor comunidade de devs do Brasil'],
          ['#cta-title', 'Open To'],
          ['.section:nth-of-type(3) .body-copy p:nth-of-type(1)', 'Estou aberto a oportunidades em empresas com projetos realmente empolgantes, a trabalhos freelance na linha de software house com apoio da equipe da BeroLab e a parcerias publicitarias com fit claro com tecnologia.'],
          ['.section:nth-of-type(3) .body-copy p:nth-of-type(2)', 'Se fizer sentido para o que voce esta construindo, <a href="./contact.html">entre em contato</a>.', 'html'],
          ['.footer p:first-child', 'bero.land. Todos os direitos reservados.'],
          ['.footer p:nth-child(2)', 'Curtiu o projeto? Deixe uma estrela no repo: <a href="https://github.com/meunomeebero/linktree" target="_blank" rel="noopener noreferrer">github.com/meunomeebero/linktree</a>', 'html']
        ]
      },
      en: {
        title: 'Bero Land | About',
        metaDescription: 'About Bero: brand identity, background and positioning as a content creator and software engineer.',
        ogTitle: 'Bero Land | About',
        ogDescription: 'Who Bero is, how the brand operates and which topics drive the content and projects.',
        twitterTitle: 'Bero Land | About',
        twitterDescription: 'Identity, positioning and focus areas behind Bero.',
        texts: [
          ['.sidebar__label', 'pages'],
          ['.status-bar span:last-child', 'brand identity'],
          ['.hero .eyebrow', 'About'],
          ['.hero .subtitle', 'Bero is my stage name. Professionally, I also sign as Roberto Junior.'],
          ['#about-title', 'Positioning'],
          ['.section:nth-of-type(1) .body-copy p:nth-of-type(1)', 'I am Bero, the stage name of Roberto Junior. I am a Brazilian developer based in Sao Jose dos Campos, I have been coding for over 6 years, and I currently work at Ask.com as a Software Engineer focused on Golang and Python.'],
          ['.section:nth-of-type(1) .body-copy p:nth-of-type(2)', 'Today my core stack is Node.js with TypeScript, Golang and Next.js. In content, I mix animation, career, programming, the tech market, corporate life without euphemisms, and investment advice for millennials and Gen Z still figuring out their path.'],
          ['#identity-title', 'Identity Markers'],
          ['.info-grid .fact:nth-of-type(1) dt', 'Base'],
          ['.info-grid .fact:nth-of-type(2) dt', 'Experience'],
          ['.info-grid .fact:nth-of-type(3) dt', 'Professional background'],
          ['.info-grid .fact:nth-of-type(4) dt', 'Current stack'],
          ['.info-grid .fact:nth-of-type(5) dt', 'Daily tools'],
          ['.info-grid .fact:nth-of-type(6) dt', 'Market focus'],
          ['.info-grid .fact:nth-of-type(7) dt', 'Name'],
          ['.info-grid .fact:nth-of-type(8) dt', 'Roles'],
          ['.info-grid .fact:nth-of-type(9) dt', 'Topics'],
          ['.info-grid .fact:nth-of-type(10) dt', 'Current focus'],
          ['.info-grid .fact:nth-of-type(1) dd', 'Sao Jose dos Campos, Brazil'],
          ['.info-grid .fact:nth-of-type(2) dd', '6+ years in software / 10+ years creating content'],
          ['.info-grid .fact:nth-of-type(3) dd', 'Current: Ask.com / Software Engineer / Golang and Python'],
          ['.info-grid .fact:nth-of-type(4) dd', 'Node.js, TypeScript, Golang and Next.js'],
          ['.info-grid .fact:nth-of-type(5) dd', 'ChatGPT, Claude, Codex and Openclaw'],
          ['.info-grid .fact:nth-of-type(6) dd', 'Artificial intelligence companies'],
          ['.info-grid .fact:nth-of-type(7) dd', 'Bero (Roberto Junior)'],
          ['.info-grid .fact:nth-of-type(8) dd', 'Content Creator / Programmer'],
          ['.info-grid .fact:nth-of-type(9) dd', 'Programming, AI, animation, career, corporate life, investing and indie hacking'],
          ['.info-grid .fact:nth-of-type(10) dd', 'Keep growing as a developer, build my personal projects and create the best developer community in Brazil'],
          ['#cta-title', 'Open To'],
          ['.section:nth-of-type(3) .body-copy p:nth-of-type(1)', 'I am open to opportunities in companies working on genuinely exciting projects, freelance work in a software house model with support from the BeroLab team, and advertising partnerships with a clear fit for technology.'],
          ['.section:nth-of-type(3) .body-copy p:nth-of-type(2)', 'If that fits what you are building, <a href="./contact.html">get in touch</a>.', 'html'],
          ['.footer p:first-child', 'bero.land. All rights reserved.'],
          ['.footer p:nth-child(2)', 'Enjoyed the project? Leave a star on the repo: <a href="https://github.com/meunomeebero/linktree" target="_blank" rel="noopener noreferrer">github.com/meunomeebero/linktree</a>', 'html']
        ]
      }
    },
    'media-kit.html': {
      'pt-BR': {
        title: 'Bero Land | Media Kit',
        metaDescription: 'Media kit do Bero: fit de marca, formatos, entregas e fluxo comercial para publicidade e parcerias.',
        ogTitle: 'Bero Land | Media Kit',
        ogDescription: 'Fit de marca, formatos e caminho comercial para trabalhar com o Bero.',
        twitterTitle: 'Bero Land | Media Kit',
        twitterDescription: 'Fit de marca, formatos e fluxo comercial do Bero.',
        texts: [
          ['.sidebar__label', 'paginas'],
          ['.status-bar span:last-child', 'commercial snapshot'],
          ['.hero .eyebrow', 'Media Kit'],
          ['.hero .subtitle', 'Publicidade com linguagem nativa de internet, software e inteligencia artificial.'],
          ['#audience-title', 'Audience Snapshot'],
          ['#fit-title', 'Brand Fit'],
          ['.section:nth-of-type(2) .text-list li:nth-of-type(1)', 'Meu foco atual esta especialmente em empresas de inteligencia artificial.'],
          ['.section:nth-of-type(2) .text-list li:nth-of-type(2)', 'No dia a dia eu uso ChatGPT, Claude, Codex e Openclaw, entao tenho repertorio real para falar de ferramentas e fluxo de uso.'],
          ['.section:nth-of-type(2) .text-list li:nth-of-type(3)', 'As campanhas funcionam melhor quando a marca quer ser entendida por uma audiencia tech-native, nao apenas aparecer nela.'],
          ['#formats-title', 'Formats'],
          ['.section:nth-of-type(3) .record:nth-of-type(1) h3', 'Video Dedicado (YouTube)'],
          ['.section:nth-of-type(3) .record:nth-of-type(2) h3', 'Video Insert / Integracao (YouTube)'],
          ['.section:nth-of-type(3) .record:nth-of-type(3) h3', 'Animacao Publicitaria (Instagram / Shorts / TikTok)'],
          ['.section:nth-of-type(3) .record:nth-of-type(4) h3', 'Pacotes Multiplataforma'],
          ['.section:nth-of-type(3) .record:nth-of-type(1) .record__tag', 'bookable'],
          ['.section:nth-of-type(3) .record:nth-of-type(2) .record__tag', 'bookable'],
          ['.section:nth-of-type(3) .record:nth-of-type(3) .record__tag', 'bookable'],
          ['.section:nth-of-type(3) .record:nth-of-type(4) .record__tag', 'custom'],
          ['#campaigns-title', 'Selected Campaigns'],
          ['#flow-title', 'Flow'],
          ['.footer p:first-child', 'bero.land. Todos os direitos reservados.'],
          ['.footer p:nth-child(2)', 'Curtiu o projeto? Deixe uma estrela no repo: <a href="https://github.com/meunomeebero/linktree" target="_blank" rel="noopener noreferrer">github.com/meunomeebero/linktree</a>', 'html']
        ]
      },
      en: {
        title: 'Bero Land | Media Kit',
        metaDescription: 'Bero media kit: brand fit, formats, campaign examples and business flow for partnerships.',
        ogTitle: 'Bero Land | Media Kit',
        ogDescription: 'Brand fit, formats and a commercial overview for working with Bero.',
        twitterTitle: 'Bero Land | Media Kit',
        twitterDescription: 'Brand fit, formats and commercial flow behind Bero partnerships.',
        texts: [
          ['.sidebar__label', 'pages'],
          ['.status-bar span:last-child', 'commercial snapshot'],
          ['.hero .eyebrow', 'Media Kit'],
          ['.hero .subtitle', 'Advertising in the native language of internet, software and artificial intelligence.'],
          ['#audience-title', 'Audience Snapshot'],
          ['#fit-title', 'Brand Fit'],
          ['.section:nth-of-type(2) .text-list li:nth-of-type(1)', 'My current commercial focus is especially on artificial intelligence companies.'],
          ['.section:nth-of-type(2) .text-list li:nth-of-type(2)', 'In day-to-day work I use ChatGPT, Claude, Codex and Openclaw, so I have real context for talking about tools and workflow.'],
          ['.section:nth-of-type(2) .text-list li:nth-of-type(3)', 'Campaigns perform best when a brand wants to be understood by a tech-native audience, not merely shown to it.'],
          ['#formats-title', 'Formats'],
          ['.section:nth-of-type(3) .record:nth-of-type(1) h3', 'Dedicated Video (YouTube)'],
          ['.section:nth-of-type(3) .record:nth-of-type(2) h3', 'Video Insert / Integration (YouTube)'],
          ['.section:nth-of-type(3) .record:nth-of-type(3) h3', 'Branded Animation (Instagram / Shorts / TikTok)'],
          ['.section:nth-of-type(3) .record:nth-of-type(4) h3', 'Multiplatform Packages'],
          ['.section:nth-of-type(3) .record:nth-of-type(1) .record__tag', 'available'],
          ['.section:nth-of-type(3) .record:nth-of-type(2) .record__tag', 'available'],
          ['.section:nth-of-type(3) .record:nth-of-type(3) .record__tag', 'available'],
          ['.section:nth-of-type(3) .record:nth-of-type(4) .record__tag', 'custom'],
          ['.section:nth-of-type(3) .record:nth-of-type(1) p', 'Content fully focused on the brand or product, with deep integration, full narrative and room for explanation, demonstration and a strong CTA.'],
          ['.section:nth-of-type(3) .record:nth-of-type(2) p', 'Brand insertion inside editorial channel content in a natural and contextual way. Strong for awareness and consideration without breaking the audience experience.'],
          ['.section:nth-of-type(3) .record:nth-of-type(3) p', 'Authorial animation pieces with storytelling, characters, humor and real usage context. Strong for memorability and retention.'],
          ['.section:nth-of-type(3) .record:nth-of-type(4) p', 'A combination of YouTube + Instagram + Shorts/TikTok built like a funnel: primary piece, short-form spin-offs and cross-platform CTA to increase reach and conversion.'],
          ['#campaigns-title', 'Selected Campaigns'],
          ['.section:nth-of-type(4) .record:nth-of-type(1) h3', 'MGX / Instagram Reel'],
          ['.section:nth-of-type(4) .record:nth-of-type(1) .record__tag', '190k+ organic views'],
          ['.section:nth-of-type(4) .record:nth-of-type(1) p', 'Storytelling-driven campaign where I say I am going to hack my ex’s Instagram to show MGX in action and present multiple product features through a narrative hook.'],
          ['.section:nth-of-type(4) .record:nth-of-type(1) .record__meta strong', 'Link:'],
          ['.section:nth-of-type(4) .record:nth-of-type(1) .record__meta a', 'Instagram Reel / MGX'],
          ['.section:nth-of-type(4) .record:nth-of-type(2) h3', 'Abacus AI / Dedicated YouTube'],
          ['.section:nth-of-type(4) .record:nth-of-type(2) .record__tag', '26k+ views'],
          ['.section:nth-of-type(4) .record:nth-of-type(2) p', 'A 13-minute dedicated video on beroodev, building a SaaS from scratch with Abacus AI. The integration felt so natural that many viewers did not immediately realize it was sponsored.'],
          ['.section:nth-of-type(4) .record:nth-of-type(2) .record__meta strong', 'Link:'],
          ['.section:nth-of-type(4) .record:nth-of-type(2) .record__meta a', 'YouTube / Abacus AI'],
          ['#flow-title', 'Flow'],
          ['.section:nth-of-type(5) .body-copy p', 'Fast brief, recommended format, message alignment, execution and delivery. The goal is to reduce friction and keep the campaign consistent with the brand universe.'],
          ['.section:nth-of-type(5) .note p', 'Detailed audience numbers, analytics screenshots, pricing, brand assets and billing details can be shared by email on request.'],
          ['.footer p:first-child', 'bero.land. All rights reserved.'],
          ['.footer p:nth-child(2)', 'Enjoyed the project? Leave a star on the repo: <a href="https://github.com/meunomeebero/linktree" target="_blank" rel="noopener noreferrer">github.com/meunomeebero/linktree</a>', 'html']
        ]
      }
    },
    'projects.html': {
      'pt-BR': {
        title: 'Bero Land | Projects',
        metaDescription: 'Projetos do Bero: BeroLab, Bero Royale e Blaboard.',
        ogTitle: 'Bero Land | Projects',
        ogDescription: 'Registro resumido dos projetos e da infraestrutura de comunidade do Bero.',
        twitterTitle: 'Bero Land | Projects',
        twitterDescription: 'Projetos publicos, de produto e open source do Bero.',
        texts: [
          ['.sidebar__label', 'paginas'],
          ['.status-bar span:last-child', 'project registry'],
          ['.hero .eyebrow', 'Projects'],
          ['.hero .subtitle', 'Produtos, experimentos e comunidade.'],
          ['#projects-title', 'Registry'],
          ['.footer p:first-child', 'bero.land. Todos os direitos reservados.'],
          ['.footer p:nth-child(2)', 'Curtiu o projeto? Deixe uma estrela no repo: <a href="https://github.com/meunomeebero/linktree" target="_blank" rel="noopener noreferrer">github.com/meunomeebero/linktree</a>', 'html']
        ]
      },
      en: {
        title: 'Bero Land | Projects',
        metaDescription: 'Bero projects: BeroLab, Bero Royale and Blaboard.',
        ogTitle: 'Bero Land | Projects',
        ogDescription: 'A concise registry of Bero products and open source projects.',
        twitterTitle: 'Bero Land | Projects',
        twitterDescription: 'Public, product and open source projects built by Bero.',
        texts: [
          ['.sidebar__label', 'pages'],
          ['.status-bar span:last-child', 'project registry'],
          ['.hero .eyebrow', 'Projects'],
          ['.hero h1', 'What I Build'],
          ['.hero .subtitle', 'Products, experiments and community.'],
          ['#projects-title', 'Registry'],
          ['.section .record:nth-of-type(1) p', 'A gamified private community platform focused on networking, marathons, mentoring and exclusive content.'],
          ['.section .record:nth-of-type(1) .record__meta strong:nth-of-type(1)', 'Type:'],
          ['.section .record:nth-of-type(1) .record__meta div:first-child', 'Type: product / community'],
          ['.section .record:nth-of-type(2) p', 'My own Clash Royale-inspired project, used as both a creative and technical playground and maintained as an open source build.'],
          ['.section .record:nth-of-type(2) .record__meta div:first-child', 'Type: game / experiment / open source'],
          ['.section .record:nth-of-type(2) .record__meta div:nth-child(2) strong', 'Play:'],
          ['.section .record:nth-of-type(2) .record__meta div:nth-child(3) strong', 'Repo:'],
          ['.section .record:nth-of-type(3) p', 'An open source board we are building with the community to replace Linear inside BeroLab.'],
          ['.section .record:nth-of-type(3) .record__meta div:first-child', 'Type: open source / internal product tooling'],
          ['.section .record:nth-of-type(3) .record__meta div:nth-child(2) strong', 'Repo:'],
          ['.section .record:nth-of-type(3) .record__meta div:nth-child(3)', '<strong>Contribute:</strong> to contribute, just sign up for free on <a href="https://berolab.app" target="_blank" rel="noopener noreferrer">BeroLab</a>', 'html'],
          ['.footer p:first-child', 'bero.land. All rights reserved.'],
          ['.footer p:nth-child(2)', 'Enjoyed the project? Leave a star on the repo: <a href="https://github.com/meunomeebero/linktree" target="_blank" rel="noopener noreferrer">github.com/meunomeebero/linktree</a>', 'html']
        ]
      }
    },
    'videos.html': {
      'pt-BR': {
        title: 'Bero Land | Videos',
        metaDescription: 'Videos e canais do Bero: linhas editoriais, formatos principais e pontos de distribuicao.',
        ogTitle: 'Bero Land | Videos',
        ogDescription: 'Registro dos canais e formatos de video do Bero.',
        twitterTitle: 'Bero Land | Videos',
        twitterDescription: 'Canais, formatos e linha editorial do Bero.',
        texts: [
          ['.sidebar__label', 'paginas'],
          ['.status-bar span:last-child', 'video index'],
          ['.hero .eyebrow', 'Videos'],
          ['.hero .subtitle', 'Onde o conteudo entra, em que formato e com qual tom editorial.'],
          ['#channels-title', 'Channel Registry'],
          ['#featured-title', 'Featured Videos'],
          ['.footer p:first-child', 'bero.land. Todos os direitos reservados.'],
          ['.footer p:nth-child(2)', 'Curtiu o projeto? Deixe uma estrela no repo: <a href="https://github.com/meunomeebero/linktree" target="_blank" rel="noopener noreferrer">github.com/meunomeebero/linktree</a>', 'html']
        ]
      },
      en: {
        title: 'Bero Land | Videos',
        metaDescription: 'Bero videos and channels: editorial lines, main formats and featured work.',
        ogTitle: 'Bero Land | Videos',
        ogDescription: 'A registry of Bero channels, formats and featured videos.',
        twitterTitle: 'Bero Land | Videos',
        twitterDescription: 'Channels, formats and editorial focus behind Bero content.',
        texts: [
          ['.sidebar__label', 'pages'],
          ['.status-bar span:last-child', 'video index'],
          ['.hero .eyebrow', 'Videos'],
          ['.hero h1', 'Channels / Formats'],
          ['.hero .subtitle', 'Where the content lives, which format it takes and what editorial angle it carries.'],
          ['#channels-title', 'Channel Registry'],
          ['table thead th:nth-of-type(1)', 'Channel'],
          ['table thead th:nth-of-type(2)', 'Audience'],
          ['table thead th:nth-of-type(3)', 'Editorial line'],
          ['table thead th:nth-of-type(4)', 'Format'],
          ['table tbody tr:nth-of-type(1) td:nth-of-type(3)', 'Authorial animation and short-form storytelling about technology and internet culture'],
          ['table tbody tr:nth-of-type(1) td:nth-of-type(4)', 'YouTube Shorts / animation'],
          ['table tbody tr:nth-of-type(2) td:nth-of-type(3)', 'Career, programming, investing and brutally honest takes on the tech market'],
          ['table tbody tr:nth-of-type(2) td:nth-of-type(4)', 'Long-form technical content'],
          ['table tbody tr:nth-of-type(3) td:nth-of-type(3)', 'Animation, tech and short cuts with fast internet-native pacing'],
          ['table tbody tr:nth-of-type(4) td:nth-of-type(3)', 'Animation reels, behind the scenes and support distribution'],
          ['#featured-title', 'Featured Videos'],
          ['.record:nth-of-type(1) .record__tag', 'favorite animation'],
          ['.record:nth-of-type(1) p', 'My favorite animation on the channel right now. It is a strong sample of the narrative tone and of how I turn programming into story.'],
          ['.record:nth-of-type(1) .record__meta strong', 'Link:'],
          ['.record:nth-of-type(1) .record__meta a', 'YouTube / watch'],
          ['.record:nth-of-type(2) .record__tag', 'favorite technical'],
          ['.record:nth-of-type(2) p', 'My current favorite technical long-form video. It captures the direct, opinionated and no-euphemism style of the channel.'],
          ['.record:nth-of-type(2) .record__meta strong', 'Link:'],
          ['.record:nth-of-type(2) .record__meta a', 'YouTube / watch'],
          ['.footer p:first-child', 'bero.land. All rights reserved.'],
          ['.footer p:nth-child(2)', 'Enjoyed the project? Leave a star on the repo: <a href="https://github.com/meunomeebero/linktree" target="_blank" rel="noopener noreferrer">github.com/meunomeebero/linktree</a>', 'html']
        ]
      }
    },
    'contact.html': {
      'pt-BR': {
        title: 'Bero Land | Contact',
        metaDescription: 'Contato comercial do Bero para publicidade, parcerias, projetos e campanhas especiais.',
        ogTitle: 'Bero Land | Contact',
        ogDescription: 'Contato comercial e orientacao de briefing para trabalhar com o Bero.',
        twitterTitle: 'Bero Land | Contact',
        twitterDescription: 'Como fechar publicidade ou parceria com o Bero.',
        texts: [
          ['.sidebar__label', 'paginas'],
          ['.status-bar span:last-child', 'close a deal'],
          ['.hero .eyebrow', 'Contact'],
          ['.hero .subtitle', 'Publicidade, projetos especiais e parcerias com foco atual em software e inteligencia artificial.'],
          ['#contact-title', 'Primary Contact'],
          ['#brief-title', 'Good Briefing Includes'],
          ['#speed-title', 'Fastest Route'],
          ['.footer p:first-child', 'bero.land. Todos os direitos reservados.'],
          ['.footer p:nth-child(2)', 'Curtiu o projeto? Deixe uma estrela no repo: <a href="https://github.com/meunomeebero/linktree" target="_blank" rel="noopener noreferrer">github.com/meunomeebero/linktree</a>', 'html']
        ]
      },
      en: {
        title: 'Bero Land | Contact',
        metaDescription: 'Business contact for Bero: advertising partnerships, special projects and collaboration requests.',
        ogTitle: 'Bero Land | Contact',
        ogDescription: 'Business contact and briefing guidelines for working with Bero.',
        twitterTitle: 'Bero Land | Contact',
        twitterDescription: 'How to work with Bero on partnerships and campaigns.',
        texts: [
          ['.sidebar__label', 'pages'],
          ['.status-bar span:last-child', 'close a deal'],
          ['.hero .eyebrow', 'Contact'],
          ['.hero h1', 'Work With Bero'],
          ['.hero .subtitle', 'Advertising, special projects and partnerships, with a current focus on software and artificial intelligence.'],
          ['#contact-title', 'Primary Contact'],
          ['.section:nth-of-type(1) .body-copy p:nth-of-type(2)', 'If the idea is advertising, a partnership, a special project or any initiative where brand and technical depth need to move together, this is the main contact channel.'],
          ['#brief-title', 'Good Briefing Includes'],
          ['.text-list li:nth-of-type(1)', 'Campaign objective'],
          ['.text-list li:nth-of-type(2)', 'Main product or link'],
          ['.text-list li:nth-of-type(3)', 'Publishing window'],
          ['.text-list li:nth-of-type(4)', 'Desired format'],
          ['.text-list li:nth-of-type(5)', 'Mandatory messaging'],
          ['.text-list li:nth-of-type(6)', 'Budget range'],
          ['.text-list li:nth-of-type(7)', 'Any image usage, rights or whitelisting requirements'],
          ['#speed-title', 'Fastest Route'],
          ['.note p', 'Sending context, product link, deadline and commercial expectation in the same email makes the response much faster.'],
          ['.footer p:first-child', 'bero.land. All rights reserved.'],
          ['.footer p:nth-child(2)', 'Enjoyed the project? Leave a star on the repo: <a href="https://github.com/meunomeebero/linktree" target="_blank" rel="noopener noreferrer">github.com/meunomeebero/linktree</a>', 'html']
        ]
      }
    }
  };

  function applyTranslation(locale) {
    const currentPage = pageName();
    const pageTranslations = translations[currentPage];
    if (!pageTranslations) {
      return;
    }

    const config = pageTranslations[locale] || pageTranslations['pt-BR'];
    document.documentElement.lang = locale === 'pt-BR' ? 'pt-BR' : 'en';
    document.title = config.title;
    setMeta('meta[property="og:locale"]', locale === 'pt-BR' ? 'pt_BR' : 'en_US');
    setMeta('meta[name="description"]', config.metaDescription);
    setMeta('meta[property="og:title"]', config.ogTitle);
    setMeta('meta[property="og:description"]', config.ogDescription);
    setMeta('meta[name="twitter:title"]', config.twitterTitle);
    setMeta('meta[name="twitter:description"]', config.twitterDescription);
    applyGlobalLabels(locale);

    config.texts.forEach(function(entry) {
      if (entry[2] === 'html') {
        setHTML(entry[0], entry[1]);
        return;
      }

      setText(entry[0], entry[1]);
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    applyTranslation(detectLanguage());
  });
})();
