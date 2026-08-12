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

  function detectPreferredLocale() {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'pt-BR' || saved === 'en') {
      return saved;
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const locale = (navigator.language || '').toLowerCase();
    const isBrazil = BRAZIL_TIMEZONES.has(timezone) || locale.endsWith('-br');
    return isBrazil ? 'pt-BR' : 'en';
  }

  function currentLocale() {
    return document.documentElement.lang === 'pt-BR' ? 'pt-BR' : 'en';
  }

  function syncButtons(locale) {
    document.querySelectorAll('[data-lang-choice]').forEach(function(node) {
      const isActive = node.getAttribute('data-lang-choice') === locale;
      node.classList.toggle('is-active', isActive);
      node.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function targetFor(locale) {
    return document.querySelector('[data-lang-choice="' + locale + '"][data-lang-target]');
  }

  function maybeRedirect(locale) {
    const button = targetFor(locale);
    if (!button) {
      return;
    }

    const target = button.getAttribute('data-lang-target');
    if (!target) {
      return;
    }

    const nextUrl = new URL(target, window.location.href);
    const samePath = nextUrl.pathname === window.location.pathname;
    const sameSearch = nextUrl.search === window.location.search;
    const sameHash = nextUrl.hash === window.location.hash;

    if (samePath && sameSearch && sameHash) {
      return;
    }

    window.location.replace(nextUrl.href);
  }

  function bindLanguageSwitch() {
    document.addEventListener('click', function(event) {
      if (!(event.target instanceof Element)) {
        return;
      }

      const button = event.target.closest('[data-lang-choice]');
      if (!button) {
        return;
      }

      const nextLocale = button.getAttribute('data-lang-choice');
      const target = button.getAttribute('data-lang-target');
      if (!nextLocale) {
        return;
      }

      window.localStorage.setItem(STORAGE_KEY, nextLocale);
      syncButtons(nextLocale);

      if (!target) {
        return;
      }

      const nextUrl = new URL(target, window.location.href);
      if (nextUrl.href !== window.location.href) {
        if (window.BeroRouter) {
          window.BeroRouter.navigate(nextUrl.href, { animate: event.detail > 0 });
        } else {
          window.location.assign(nextUrl.href);
        }
      }
    });
  }

  function setupIndexSubnavigation() {
    document.querySelectorAll('.sidebar__nav').forEach(function(nav, navIndex) {
      if (nav.querySelector(':scope > .sidebar__index-group')) {
        return;
      }

      const subitems = Array.from(nav.querySelectorAll('.nav-subitem'));
      const indexLink = subitems.length ? subitems[0].previousElementSibling : null;

      if (!indexLink || indexLink.tagName !== 'A') {
        return;
      }

      const locale = currentLocale();
      const itemCount = subitems.length;
      const group = document.createElement('div');
      const subnav = document.createElement('div');
      const toggle = document.createElement('button');
      const subnavId = 'index-subnav-' + navIndex;
      const hasActiveSubitem = subitems.some(function(item) {
        return item.classList.contains('is-active');
      });
      let isExpanded = hasActiveSubitem;
      let hideTimer;

      group.className = 'sidebar__index-group';
      group.classList.toggle('is-route-active', hasActiveSubitem);
      subnav.className = 'sidebar__subnav';
      subnav.id = subnavId;
      toggle.className = 'sidebar__subnav-toggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-controls', subnavId);
      toggle.setAttribute(
        'aria-label',
        locale === 'pt-BR'
          ? 'Mostrar ' + itemCount + ' links do indice'
          : 'Show ' + itemCount + ' index links'
      );

      nav.insertBefore(group, indexLink);
      group.appendChild(indexLink);
      group.appendChild(toggle);
      group.appendChild(subnav);
      subitems.forEach(function(item) {
        subnav.appendChild(item);
      });

      function setExpanded(nextExpanded, shouldAnimate) {
        window.clearTimeout(hideTimer);
        isExpanded = nextExpanded;
        toggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
        toggle.setAttribute(
          'aria-label',
          locale === 'pt-BR'
            ? (isExpanded ? 'Ocultar ' : 'Mostrar ') + itemCount + ' links do indice'
            : (isExpanded ? 'Hide ' : 'Show ') + itemCount + ' index links'
        );
        toggle.textContent = (isExpanded ? '- ' : '+ ') + itemCount + ' links';
        subnav.setAttribute('aria-hidden', isExpanded ? 'false' : 'true');
        subnav.inert = !isExpanded;

        if (!shouldAnimate) {
          subnav.classList.add('is-motion-instant');
          subnav.classList.toggle('is-expanded', isExpanded);
          subnav.hidden = !isExpanded;
          window.requestAnimationFrame(function() {
            subnav.classList.remove('is-motion-instant');
          });
          return;
        }

        if (isExpanded) {
          subnav.hidden = false;
          window.requestAnimationFrame(function() {
            subnav.classList.add('is-expanded');
          });
          return;
        }

        subnav.classList.remove('is-expanded');
        hideTimer = window.setTimeout(function() {
          if (!isExpanded) {
            subnav.hidden = true;
          }
        }, 160);
      }

      toggle.addEventListener('click', function(event) {
        const nextExpanded = !isExpanded;
        setExpanded(nextExpanded, event.detail > 0);
        window.dispatchEvent(new CustomEvent('bero:sound', {
          detail: { kind: nextExpanded ? 'expand' : 'collapse', profile: 'navigation' }
        }));
      });

      setExpanded(hasActiveSubitem, false);
    });
  }

  function initPage(options) {
    const locale = currentLocale();
    const preferredLocale = detectPreferredLocale();

    syncButtons(locale);
    setupIndexSubnavigation();

    if (options && options.allowRedirect && preferredLocale !== locale) {
      maybeRedirect(preferredLocale);
    }
  }

  bindLanguageSwitch();
  document.addEventListener('DOMContentLoaded', function() {
    initPage({ allowRedirect: true });
  });
  window.addEventListener('bero:page-enter', function() {
    initPage({ allowRedirect: false });
  });
})();
