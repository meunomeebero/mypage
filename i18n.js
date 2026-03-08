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
        window.location.assign(nextUrl.href);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    const locale = currentLocale();
    const preferredLocale = detectPreferredLocale();

    bindLanguageSwitch();
    syncButtons(locale);

    if (preferredLocale !== locale) {
      maybeRedirect(preferredLocale);
    }
  });
})();
