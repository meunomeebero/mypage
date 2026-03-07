(function() {
  const STORAGE_KEY = 'bero-land-locale';
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
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'pt-BR' || saved === 'en') {
      return saved;
    }

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

  function setJsonLd(selector, value) {
    const node = document.querySelector(selector);
    if (node) {
      node.textContent = JSON.stringify(value);
    }
  }

  function pageName() {
    const pathname = window.location.pathname;
    const last = pathname.split('/').pop();
    return last && last.length ? last : 'index.html';
  }

  function applyGlobalLabels(locale) {
    const navLabels = locale === 'pt-BR'
      ? ['00. links', '00.1 minilab', '01. sobre', '02. media kit', '03. projetos', '04. videos', '05. contato']
      : ['00. links', '00.1 minilab', '01. about', '02. media kit', '03. projects', '04. videos', '05. contact'];

    setAttr('.sidebar', 'aria-label', locale === 'pt-BR' ? 'Paginas' : 'Pages');
    document.querySelectorAll('.lang-switch').forEach(function(node) {
      node.setAttribute('aria-label', locale === 'pt-BR' ? 'Alternar idioma' : 'Switch language');
    });

    document.querySelectorAll('.sidebar__nav a').forEach(function(node, index) {
      if (navLabels[index]) {
        node.textContent = navLabels[index];
      }
    });
  }

  function syncLanguageSwitch(locale) {
    document.querySelectorAll('[data-lang-choice]').forEach(function(node) {
      const isActive = node.getAttribute('data-lang-choice') === locale;
      node.classList.toggle('is-active', isActive);
      node.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      node.setAttribute('aria-label', node.getAttribute('data-lang-choice') === 'pt-BR'
        ? (locale === 'pt-BR' ? 'Português selecionado' : 'Mudar para português')
        : (locale === 'en' ? 'English selected' : 'Switch to English'));
    });
  }

  const profileJsonLd = {
    'pt-BR': {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      dateModified: '2026-03-06',
      mainEntity: {
        '@type': 'Person',
        name: 'Bero',
        url: 'https://bero.land/',
        description: 'Bero e criador de conteudo e programador. Publica conteudo sobre programacao, apps, SaaS, IA, jogos, animacao, carreira, indie hacking e publicidade.',
        email: 'mailto:mail@bero.land',
        jobTitle: [
          'Criador de Conteudo',
          'Programador'
        ],
        sameAs: [
          'https://x.com/meunomeebero',
          'https://www.instagram.com/meunomeebero',
          'https://www.youtube.com/@meunomeebero',
          'https://github.com/meunomeebero',
          'https://www.linkedin.com/in/robertojrcdc/',
          'https://discord.com/servers/mansao-dev-1132161173484224642',
          'https://www.tiktok.com/@meunomeebero',
          'https://www.youtube.com/@beroodev'
        ]
      }
    },
    en: {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      dateModified: '2026-03-06',
      mainEntity: {
        '@type': 'Person',
        name: 'Bero',
        url: 'https://bero.land/',
        description: 'Bero is a content creator and software engineer publishing about programming, apps, SaaS, AI, games, animation, career and advertising.',
        email: 'mailto:mail@bero.land',
        jobTitle: [
          'Content Creator',
          'Programmer'
        ],
        sameAs: [
          'https://x.com/meunomeebero',
          'https://www.instagram.com/meunomeebero',
          'https://www.youtube.com/@meunomeebero',
          'https://github.com/meunomeebero',
          'https://www.linkedin.com/in/robertojrcdc/',
          'https://discord.com/servers/mansao-dev-1132161173484224642',
          'https://www.tiktok.com/@meunomeebero',
          'https://www.youtube.com/@beroodev'
        ]
      }
    }
  };

  function bindLanguageSwitch() {
    document.querySelectorAll('[data-lang-choice]').forEach(function(node) {
      node.addEventListener('click', function() {
        const nextLocale = node.getAttribute('data-lang-choice');
        if (!nextLocale) {
          return;
        }

        window.localStorage.setItem(STORAGE_KEY, nextLocale);
        applyTranslation(nextLocale);
      });
    });
  }

  const translations = {
    'index.html': {
      'pt-BR': {
        title: 'Bero Land | Links',
        metaDescription: 'Links oficiais do Bero. Home estatica com acesso rapido para canais, projetos, comunidade e contato comercial.',
        ogTitle: 'Bero Land | Links',
        ogDescription: 'Links oficiais do Bero em uma home estatica, com sidebar para about, media kit, projects, videos e contact.',
        ogImageAlt: 'Banner da Bero Land',
        twitterTitle: 'Bero Land | Links',
        twitterDescription: 'Home com links oficiais do Bero e acesso lateral para o restante do perfil.',
        twitterImageAlt: 'Banner da Bero Land',
        texts: [
          ['.sidebar__label', 'paginas'],
          ['.status-bar span:last-child', 'static html / links first'],
          ['.hero .eyebrow', 'Creator / Programmer / Brand Partnerships'],
          ['.hero .lede', 'Desenvolvedor brasileiro baseado em Sao Jose dos Campos. 6+ anos programando, 10+ anos criando conteudo e + de 360 mil seguidores e inscritos somados nas plataformas.'],
          ['#primary-links-title', 'Links principais'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(1) .link-row__meta', 'canal'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(2) .link-row__meta', 'canal'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(3) .link-row__meta', 'codigo'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(4) .link-row__meta', 'posts'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(5) .link-row__meta', 'perfil'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(6) .link-row__meta', 'curtas'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(7) .link-row__meta', 'trabalho'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(8) .link-row__meta', 'comunidade'],
          ['.link-list[aria-label="Links principais"] a:nth-of-type(9) .link-row__meta', 'email'],
          ['#secret-trigger span:first-child', 'Conteudo secreto'],
          ['#secret-trigger .link-row__meta', 'descubra'],
          ['#routing-title', 'Cursos e comunidades'],
          ['.featured-link:nth-of-type(1) .link-row__meta', 'comunidade'],
          ['.featured-link:nth-of-type(1) .featured-link__text', 'Comunidade fechada para networking, compartilhamento de conhecimento, eventos ao vivo e acompanhamento em grupo, com planos a partir de R$ 0.'],
          ['.featured-link:nth-of-type(1) .featured-link__note', 'Iniciativas: clube do livro tecnico, clube do ingles tech, maratona de SaaS e BeroLab Open Source.'],
          ['.featured-link:nth-of-type(2) .link-row__meta', 'curso'],
          ['.featured-link:nth-of-type(2) .featured-link__text', 'Uma hora e meia de conteudo, saindo do zero em JavaScript ate a criacao de um bot de WhatsApp integrado com GPT, por R$ 37.'],
          ['#secondary-links-title', 'Outros links'],
          ['.link-list[aria-label="Links sociais"] a:nth-of-type(1) .link-row__meta', 'curriculo'],
          ['.link-list[aria-label="Links sociais"] a:nth-of-type(2) .link-row__meta', 'jogar'],
          ['.footer p:first-child', 'bero.land. Todos os direitos reservados.'],
          ['.footer p:nth-child(2)', 'Curtiu o projeto? Deixe uma estrela no repo: <a href="https://github.com/meunomeebero/linktree" target="_blank" rel="noopener noreferrer">github.com/meunomeebero/linktree</a>', 'html']
        ]
      },
      en: {
        title: 'Bero Land | Links',
        metaDescription: 'Official Bero links. Static home with quick access to channels, projects, community and business contact.',
        ogTitle: 'Bero Land | Links',
        ogDescription: 'Official Bero links in a static home, with a sidebar for about, media kit, projects, videos and contact.',
        ogImageAlt: 'Bero Land banner',
        twitterTitle: 'Bero Land | Links',
        twitterDescription: 'Home with Bero official links and sidebar access to the rest of the profile.',
        twitterImageAlt: 'Bero Land banner',
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
        title: 'Bero Land | Sobre',
        metaDescription: 'Sobre o Bero: identidade de marca, areas de atuacao e posicionamento como criador de conteudo e programador.',
        ogTitle: 'Bero Land | Sobre',
        ogDescription: 'Quem e Bero, como a marca opera e quais assuntos atravessam o conteudo e os projetos.',
        ogImageAlt: 'Banner da Bero Land',
        twitterTitle: 'Bero Land | Sobre',
        twitterDescription: 'Identidade, posicionamento e areas de atuacao do Bero.',
        twitterImageAlt: 'Banner da Bero Land',
        texts: [
          ['.sidebar__label', 'paginas'],
          ['.status-bar span:last-child', 'identidade'],
          ['.hero .eyebrow', 'Sobre'],
          ['.hero .subtitle', 'Bero e meu nome artistico. Profissionalmente, eu tambem assino como Roberto Junior.'],
          ['#about-title', 'Quem sou eu'],
          ['.section:nth-of-type(1) .body-copy p:nth-of-type(1)', 'Eu sou o Roberto Junior, conhecido na internet como Bero. Sou um desenvolvedor brasileiro baseado em Sao Jose dos Campos, programo ha mais de 6 anos e atualmente trabalho na Ask.com como Software Engineer com foco em Golang e Python.'],
          ['.section:nth-of-type(1) .body-copy p:nth-of-type(2)', 'Hoje minha stack principal e Node.js com TypeScript, Golang e Next.js. No conteudo, misturo animacao, carreira, programacao, mercado tech, mundo corporativo sem eufemismos e dicas de investimento para jovens da geracao milenial e Z que ainda estao se encontrando na carreira.'],
          ['#identity-title', 'Panorama rapido'],
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
          ['.info-grid .fact:nth-of-type(3) dd', 'Atual: Ask.com / Software Engineer / Golang e Python'],
          ['.info-grid .fact:nth-of-type(10) dd', 'Continuar crescendo como dev, desenvolver meus projetos pessoais e construir a melhor comunidade de devs do Brasil'],
          ['#cta-title', 'Disponivel para'],
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
        ogImageAlt: 'Bero Land banner',
        twitterTitle: 'Bero Land | About',
        twitterDescription: 'Identity, positioning and focus areas behind Bero.',
        twitterImageAlt: 'Bero Land banner',
        texts: [
          ['.sidebar__label', 'pages'],
          ['.status-bar span:last-child', 'brand identity'],
          ['.hero .eyebrow', 'About'],
          ['.hero .subtitle', 'Bero is my stage name. Professionally, I also sign as Roberto Junior.'],
          ['#about-title', 'Positioning'],
          ['.section:nth-of-type(1) .body-copy p:nth-of-type(1)', 'I am Roberto Junior, better known online as Bero. I am a Brazilian developer based in Sao Jose dos Campos, I have been coding for over 6 years, and I currently work at Ask.com as a Software Engineer focused on Golang and Python.'],
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
        ogImageAlt: 'Banner da Bero Land',
        twitterTitle: 'Bero Land | Media Kit',
        twitterDescription: 'Fit de marca, formatos e fluxo comercial do Bero.',
        twitterImageAlt: 'Banner da Bero Land',
        texts: [
          ['.sidebar__label', 'paginas'],
          ['.status-bar span:last-child', 'visao comercial'],
          ['.hero .eyebrow', 'Media Kit'],
          ['.hero h1', 'Visao comercial'],
          ['.hero .subtitle', 'Publicidade com linguagem nativa de internet, software e inteligencia artificial.'],
          ['#audience-title', 'Alcance'],
          ['#fit-title', 'Fit de marca'],
          ['.section:nth-of-type(2) .text-list li:nth-of-type(1)', 'Meu foco atual esta especialmente em empresas de inteligencia artificial.'],
          ['.section:nth-of-type(2) .text-list li:nth-of-type(2)', 'No dia a dia eu uso ChatGPT, Claude, Codex e Openclaw, entao tenho repertorio real para falar de ferramentas e fluxo de uso.'],
          ['.section:nth-of-type(2) .text-list li:nth-of-type(3)', 'As campanhas funcionam melhor quando a marca quer ser entendida por uma audiencia tech-native, nao apenas aparecer nela.'],
          ['#formats-title', 'Formatos'],
          ['.section:nth-of-type(3) .record:nth-of-type(1) h3', 'Video Dedicado (YouTube)'],
          ['.section:nth-of-type(3) .record:nth-of-type(2) h3', 'Video Insert / Integracao (YouTube)'],
          ['.section:nth-of-type(3) .record:nth-of-type(3) h3', 'Animacao Publicitaria (Instagram / Shorts / TikTok)'],
          ['.section:nth-of-type(3) .record:nth-of-type(4) h3', 'Pacotes Multiplataforma'],
          ['.section:nth-of-type(3) .record:nth-of-type(1) .record__tag', 'disponivel'],
          ['.section:nth-of-type(3) .record:nth-of-type(2) .record__tag', 'disponivel'],
          ['.section:nth-of-type(3) .record:nth-of-type(3) .record__tag', 'disponivel'],
          ['.section:nth-of-type(3) .record:nth-of-type(4) .record__tag', 'sob medida'],
          ['#campaigns-title', 'Cases'],
          ['#flow-title', 'Como funciona'],
          ['.footer p:first-child', 'bero.land. Todos os direitos reservados.'],
          ['.footer p:nth-child(2)', 'Curtiu o projeto? Deixe uma estrela no repo: <a href="https://github.com/meunomeebero/linktree" target="_blank" rel="noopener noreferrer">github.com/meunomeebero/linktree</a>', 'html']
        ]
      },
      en: {
        title: 'Bero Land | Media Kit',
        metaDescription: 'Bero media kit: brand fit, formats, campaign examples and business flow for partnerships.',
        ogTitle: 'Bero Land | Media Kit',
        ogDescription: 'Brand fit, formats and a commercial overview for working with Bero.',
        ogImageAlt: 'Bero Land banner',
        twitterTitle: 'Bero Land | Media Kit',
        twitterDescription: 'Brand fit, formats and commercial flow behind Bero partnerships.',
        twitterImageAlt: 'Bero Land banner',
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
        title: 'Bero Land | Projetos',
        metaDescription: 'Projetos do Bero: BeroLab, Bero Royale e Blaboard.',
        ogTitle: 'Bero Land | Projetos',
        ogDescription: 'Registro resumido dos projetos e da infraestrutura de comunidade do Bero.',
        ogImageAlt: 'Banner da Bero Land',
        twitterTitle: 'Bero Land | Projetos',
        twitterDescription: 'Projetos publicos, de produto e open source do Bero.',
        twitterImageAlt: 'Banner da Bero Land',
        texts: [
          ['.sidebar__label', 'paginas'],
          ['.status-bar span:last-child', 'projetos'],
          ['.hero .eyebrow', 'Projetos'],
          ['.hero h1', 'O que eu construo'],
          ['.hero .subtitle', 'Produtos, experimentos e comunidade.'],
          ['#projects-title', 'Projetos'],
          ['.section .record:nth-of-type(1) .record__tag', 'ativo'],
          ['.section .record:nth-of-type(1) .record__meta div:first-child', '<strong>Tipo:</strong> produto / comunidade', 'html'],
          ['.section .record:nth-of-type(2) .record__meta div:first-child', '<strong>Tipo:</strong> game / experimento / open source', 'html'],
          ['.section .record:nth-of-type(2) .record__meta div:nth-child(2)', '<strong>Jogar:</strong> <a href="https://bero-royale.shardweb.app" target="_blank" rel="noopener noreferrer">bero-royale.shardweb.app</a>', 'html'],
          ['.section .record:nth-of-type(3) .record__meta div:first-child', '<strong>Tipo:</strong> open source / ferramenta interna de produto', 'html'],
          ['.section .record:nth-of-type(3) .record__meta div:nth-child(3)', '<strong>Contribuir:</strong> para contribuir, basta se cadastrar gratuitamente na <a href="https://berolab.app" target="_blank" rel="noopener noreferrer">BeroLab</a>', 'html'],
          ['.footer p:first-child', 'bero.land. Todos os direitos reservados.'],
          ['.footer p:nth-child(2)', 'Curtiu o projeto? Deixe uma estrela no repo: <a href="https://github.com/meunomeebero/linktree" target="_blank" rel="noopener noreferrer">github.com/meunomeebero/linktree</a>', 'html']
        ]
      },
      en: {
        title: 'Bero Land | Projects',
        metaDescription: 'Bero projects: BeroLab, Bero Royale and Blaboard.',
        ogTitle: 'Bero Land | Projects',
        ogDescription: 'A concise registry of Bero products and open source projects.',
        ogImageAlt: 'Bero Land banner',
        twitterTitle: 'Bero Land | Projects',
        twitterDescription: 'Public, product and open source projects built by Bero.',
        twitterImageAlt: 'Bero Land banner',
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
        ogImageAlt: 'Banner da Bero Land',
        twitterTitle: 'Bero Land | Videos',
        twitterDescription: 'Canais, formatos e linha editorial do Bero.',
        twitterImageAlt: 'Banner da Bero Land',
        texts: [
          ['.sidebar__label', 'paginas'],
          ['.status-bar span:last-child', 'videos'],
          ['.hero .eyebrow', 'Videos'],
          ['.hero h1', 'Canais e formatos'],
          ['.hero .subtitle', 'Onde o conteudo entra, em que formato e com qual tom editorial.'],
          ['#channels-title', 'Canais'],
          ['table thead th:nth-of-type(1)', 'Canal'],
          ['table thead th:nth-of-type(2)', 'Audiencia'],
          ['table thead th:nth-of-type(3)', 'Linha editorial'],
          ['table thead th:nth-of-type(4)', 'Formato'],
          ['table tbody tr:nth-of-type(2) td:nth-of-type(4)', 'Video longo tecnico'],
          ['table tbody tr:nth-of-type(3) td:nth-of-type(4)', 'Video curto vertical'],
          ['table tbody tr:nth-of-type(4) td:nth-of-type(4)', 'Video curto / distribuicao'],
          ['#featured-title', 'Videos em destaque'],
          ['.record:nth-of-type(1) .record__tag', 'animacao favorita'],
          ['.record:nth-of-type(2) .record__tag', 'tecnico favorito'],
          ['.footer p:first-child', 'bero.land. Todos os direitos reservados.'],
          ['.footer p:nth-child(2)', 'Curtiu o projeto? Deixe uma estrela no repo: <a href="https://github.com/meunomeebero/linktree" target="_blank" rel="noopener noreferrer">github.com/meunomeebero/linktree</a>', 'html']
        ]
      },
      en: {
        title: 'Bero Land | Videos',
        metaDescription: 'Bero videos and channels: editorial lines, main formats and featured work.',
        ogTitle: 'Bero Land | Videos',
        ogDescription: 'A registry of Bero channels, formats and featured videos.',
        ogImageAlt: 'Bero Land banner',
        twitterTitle: 'Bero Land | Videos',
        twitterDescription: 'Channels, formats and editorial focus behind Bero content.',
        twitterImageAlt: 'Bero Land banner',
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
          ['.record:nth-of-type(2) .record__tag', 'favorite technical'],
          ['.record:nth-of-type(2) p', 'My current favorite technical long-form video. It captures the direct, opinionated and no-euphemism style of the channel.'],
          ['.footer p:first-child', 'bero.land. All rights reserved.'],
          ['.footer p:nth-child(2)', 'Enjoyed the project? Leave a star on the repo: <a href="https://github.com/meunomeebero/linktree" target="_blank" rel="noopener noreferrer">github.com/meunomeebero/linktree</a>', 'html']
        ]
      }
    },
    'contact.html': {
      'pt-BR': {
        title: 'Bero Land | Contato',
        metaDescription: 'Contato comercial do Bero para publicidade, parcerias, projetos e campanhas especiais.',
        ogTitle: 'Bero Land | Contato',
        ogDescription: 'Contato comercial e orientacao de briefing para trabalhar com o Bero.',
        ogImageAlt: 'Banner da Bero Land',
        twitterTitle: 'Bero Land | Contato',
        twitterDescription: 'Como fechar publicidade ou parceria com o Bero.',
        twitterImageAlt: 'Banner da Bero Land',
        texts: [
          ['.sidebar__label', 'paginas'],
          ['.status-bar span:last-child', 'contato'],
          ['.hero .eyebrow', 'Contato'],
          ['.hero h1', 'Vamos trabalhar juntos'],
          ['.hero .subtitle', 'Publicidade, projetos especiais e parcerias com foco atual em software e inteligencia artificial.'],
          ['#contact-title', 'Contato principal'],
          ['#brief-title', 'Um bom briefing tem'],
          ['.text-list li:nth-of-type(6)', 'Faixa de budget'],
          ['.text-list li:nth-of-type(7)', 'Necessidade de uso de imagem, direitos ou whitelisting'],
          ['#speed-title', 'Forma mais rapida'],
          ['.footer p:first-child', 'bero.land. Todos os direitos reservados.'],
          ['.footer p:nth-child(2)', 'Curtiu o projeto? Deixe uma estrela no repo: <a href="https://github.com/meunomeebero/linktree" target="_blank" rel="noopener noreferrer">github.com/meunomeebero/linktree</a>', 'html']
        ]
      },
      en: {
        title: 'Bero Land | Contact',
        metaDescription: 'Business contact for Bero: advertising partnerships, special projects and collaboration requests.',
        ogTitle: 'Bero Land | Contact',
        ogDescription: 'Business contact and briefing guidelines for working with Bero.',
        ogImageAlt: 'Bero Land banner',
        twitterTitle: 'Bero Land | Contact',
        twitterDescription: 'How to work with Bero on partnerships and campaigns.',
        twitterImageAlt: 'Bero Land banner',
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
    },
    'minilab.html': {
      'pt-BR': {
        title: 'MiniLab JavaScript | Bero',
        metaDescription: 'Aprenda JavaScript do zero ate a construcao de um bot de WhatsApp integrado com IA em 1h30, com acesso ao MiniLab do Bero.',
        ogTitle: 'MiniLab JavaScript | Bero',
        ogDescription: 'JavaScript do zero ate um bot de WhatsApp com IA em 1h30, no MiniLab do Bero.',
        ogImageAlt: 'Banner do MiniLab JavaScript do Bero',
        twitterTitle: 'MiniLab JavaScript | Bero',
        twitterDescription: 'JavaScript do zero ate um bot de WhatsApp com IA em 1h30, no MiniLab do Bero.',
        twitterImageAlt: 'Banner do MiniLab JavaScript do Bero',
        texts: [
          ['.sidebar__label', 'paginas'],
          ['.hero .eyebrow', 'MiniLab JavaScript'],
          ['.hero h1', 'Do zero a um bot de WhatsApp com IA'],
          ['.hero .lede', 'Uma aula direta, em 1h30, para entender a base de programacao e sair com um projeto pratico rodando.'],
          ['#video-title', 'Preview'],
          ['#learn-title', 'O que entra'],
          ['#offer-title', 'Oferta'],
          ['.pricing-block__old', 'de R$197'],
          ['.pricing-block__current', 'por R$37'],
          ['.cta-button', 'Garantir promocao'],
          ['.cta-caption', 'Pagamento e acesso pela Hotmart.'],
          ['#route-title', 'Para quem faz sentido'],
          ['.section:nth-of-type(4) .body-copy p:nth-of-type(1)', 'Para quem quer destravar JavaScript sem enrolacao, entender como um projeto real nasce e sair da teoria mais rapido.'],
          ['.section:nth-of-type(4) .body-copy p:nth-of-type(2)', 'Se quiser ver o resto do ecossistema do Bero antes de comprar, volte para os <a href="./index.html">links principais</a>.', 'html'],
          ['.footer p:first-child', 'bero.land. Todos os direitos reservados.'],
          ['.footer p:nth-child(2)', 'Curtiu o projeto? Deixe uma estrela no repo: <a href="https://github.com/meunomeebero/linktree" target="_blank" rel="noopener noreferrer">github.com/meunomeebero/linktree</a>', 'html']
        ]
      },
      en: {
        title: 'MiniLab JavaScript | Bero',
        metaDescription: 'Learn JavaScript from zero to building a WhatsApp bot with AI in 90 minutes, inside Bero MiniLab.',
        ogTitle: 'MiniLab JavaScript | Bero',
        ogDescription: 'From zero JavaScript to a WhatsApp bot with AI in 90 minutes, inside Bero MiniLab.',
        ogImageAlt: 'Bero MiniLab JavaScript banner',
        twitterTitle: 'MiniLab JavaScript | Bero',
        twitterDescription: 'Learn JavaScript from zero to a WhatsApp bot with AI in 90 minutes, inside Bero MiniLab.',
        twitterImageAlt: 'Bero MiniLab JavaScript banner',
        texts: [
          ['.sidebar__label', 'pages'],
          ['.hero .eyebrow', 'MiniLab JavaScript'],
          ['.hero h1', 'From zero to an AI WhatsApp bot'],
          ['.hero .lede', 'A direct 90-minute class to understand the basics of programming and leave with a practical project running.'],
          ['#video-title', 'Preview'],
          ['#learn-title', 'What is inside'],
          ['#offer-title', 'Offer'],
          ['.pricing-block__old', 'from R$197'],
          ['.pricing-block__current', 'for R$37'],
          ['.cta-button', 'Get the promo'],
          ['.cta-caption', 'Checkout and delivery through Hotmart.'],
          ['#route-title', 'Who this is for'],
          ['.section:nth-of-type(4) .body-copy p:nth-of-type(1)', 'For anyone who wants to unlock JavaScript without fluff, understand how a real project comes together, and move past theory faster.'],
          ['.section:nth-of-type(4) .body-copy p:nth-of-type(2)', 'If you want to see the rest of the Bero ecosystem before buying, go back to the <a href="./index.html">main links</a>.', 'html'],
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
    setMeta('meta[property="og:image:alt"]', config.ogImageAlt);
    setMeta('meta[name="twitter:title"]', config.twitterTitle);
    setMeta('meta[name="twitter:description"]', config.twitterDescription);
    setMeta('meta[name="twitter:image:alt"]', config.twitterImageAlt);
    applyGlobalLabels(locale);
    syncLanguageSwitch(locale);
    if (currentPage === 'index.html') {
      setJsonLd('#profile-jsonld', profileJsonLd[locale] || profileJsonLd['pt-BR']);
    }

    config.texts.forEach(function(entry) {
      if (entry[2] === 'html') {
        setHTML(entry[0], entry[1]);
        return;
      }

      setText(entry[0], entry[1]);
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    bindLanguageSwitch();
    applyTranslation(detectLanguage());
  });
})();
