(function() {
  const POSTHOG_KEY = 'phc_j0R4f80F53ctkaYdSz9VEc0Vz1wFrs7V34jQszuSdN7';
  const POSTHOG_HOST = 'https://analytics.bero.land';
  const STORAGE_KEY = 'bero-land-posthog-init';

  function getPageName(pathname) {
    const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');

    if (normalizedPath === '/' || normalizedPath === '/index' || normalizedPath === '/index.html') {
      return 'home';
    }

    if (normalizedPath === '/en' || normalizedPath === '/en/index' || normalizedPath === '/en/index.html') {
      return 'home_en';
    }

    return normalizedPath
      .replace(/^\/en\//, '')
      .replace(/^\//, '')
      .replace(/\.html$/, '')
      .replace(/\//g, '_') || 'page';
  }

  function getLocale() {
    return document.documentElement.lang || 'pt-BR';
  }

  function getPageContext() {
    return {
      page_name: getPageName(window.location.pathname),
      page_path: window.location.pathname,
      locale: getLocale()
    };
  }

  function loadPostHog() {
    if (window.posthog && window.posthog.__SV) {
      return;
    }

    !function(t, e) {
      var o, n, p, r;
      if (!e.__SV) {
        window.posthog = e;
        e._i = [];
        e.init = function(i, s, a) {
          function g(t2, e2) {
            var o2 = e2.split('.');
            if (o2.length === 2) {
              t2 = t2[o2[0]];
              e2 = o2[1];
            }
            t2[e2] = function() {
              t2.push([e2].concat(Array.prototype.slice.call(arguments, 0)));
            };
          }
          p = t.createElement('script');
          p.type = 'text/javascript';
          p.async = true;
          p.src = s.api_host.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js';
          r = t.getElementsByTagName('script')[0];
          r.parentNode.insertBefore(p, r);
          var u = e;
          if (a !== undefined) {
            u = e[a] = [];
          } else {
            a = 'posthog';
          }
          u.people = u.people || [];
          u.toString = function(t2) {
            var e2 = 'posthog';
            if (a !== 'posthog') {
              e2 += '.' + a;
            }
            if (!t2) {
              e2 += ' (stub)';
            }
            return e2;
          };
          u.people.toString = function() {
            return u.toString(1) + '.people (stub)';
          };
          o = 'init capture register register_once register_for_session unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group identify setPersonProperties setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags resetGroups onFeatureFlags addFeatureFlagsHandler onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep'.split(' ');
          for (n = 0; n < o.length; n += 1) {
            g(u, o[n]);
          }
          e._i.push([i, s, a]);
        };
        e.__SV = 1;
      }
    }(document, window.posthog || []);

    window.posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      defaults: '2026-01-30',
      capture_pageview: true,
      capture_pageleave: true,
      persistence: 'localStorage',
      autocapture: true
    });
  }

  function textOf(node) {
    return (node.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function sectionOf(node) {
    const container = node.closest('.section, .hero, .sidebar, .footer');
    if (!container) {
      return '';
    }

    if (container.classList.contains('hero')) {
      return 'hero';
    }

    if (container.classList.contains('sidebar')) {
      return 'sidebar';
    }

    if (container.classList.contains('footer')) {
      return 'footer';
    }

    const heading = container.querySelector('h2');
    return heading ? textOf(heading) : 'section';
  }

  function capture(eventName, properties) {
    if (!window.posthog || typeof window.posthog.capture !== 'function') {
      return;
    }

    window.posthog.capture(eventName, Object.assign({}, getPageContext(), properties || {}));
  }

  function bindClickTracking() {
    document.addEventListener('click', function(event) {
      const anchor = event.target.closest('a');
      if (anchor) {
        const href = anchor.getAttribute('href') || '';
        capture('link_click', {
          link_text: textOf(anchor),
          link_href: href,
          link_target: anchor.getAttribute('target') || '_self',
          is_external: /^https?:\/\//.test(href) && !href.includes(window.location.host),
          section: sectionOf(anchor)
        });
        return;
      }

      const button = event.target.closest('button');
      if (!button) {
        return;
      }

      capture('button_click', {
        button_text: textOf(button),
        button_id: button.id || '',
        button_name: button.getAttribute('name') || '',
        section: sectionOf(button)
      });
    }, { passive: true });
  }

  function bindCustomTracking() {
    window.addEventListener('bero:track', function(event) {
      const detail = event.detail || {};
      if (!detail.event) {
        return;
      }

      capture(detail.event, detail.properties || {});
    });
  }

  function bootstrap() {
    loadPostHog();

    if (!window.sessionStorage.getItem(STORAGE_KEY)) {
      window.sessionStorage.setItem(STORAGE_KEY, 'true');
      capture('site_session_started');
    }

    bindClickTracking();
    bindCustomTracking();
  }

  bootstrap();
})();
