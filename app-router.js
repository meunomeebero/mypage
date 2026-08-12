(function () {
  if (window.BeroRouter) return;

  const HEAD_SELECTORS = [
    'meta[name="description"]',
    'meta[name="robots"]',
    'meta[name="theme-color"]',
    'meta[property^="og:"]',
    'meta[name^="twitter:"]',
    'link[rel="canonical"]',
    'link[rel="alternate"]',
    'script[type="application/ld+json"]',
  ];
  const ROUTE_EVENT_OPTIONS = { bubbles: false, cancelable: false };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const EXIT_DURATION = 90;
  let navigationController;
  let navigationId = 0;
  let scrollStateFrame = 0;

  document.documentElement.dataset.routerState = "ready";
  document.documentElement.dataset.routerRuntime = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  document.documentElement.dataset.routeCount = "0";
  history.scrollRestoration = "manual";
  history.replaceState(Object.assign({}, history.state, {
    beroScrollX: window.scrollX,
    beroScrollY: window.scrollY,
  }), "", window.location.href);

  function routeEvent(name, detail) {
    window.dispatchEvent(new CustomEvent(name, {
      detail: detail || {},
      ...ROUTE_EVENT_OPTIONS,
    }));
  }

  function saveScrollPosition() {
    const state = Object.assign({}, history.state, {
      beroScrollX: window.scrollX,
      beroScrollY: window.scrollY,
    });
    history.replaceState(state, "", window.location.href);
  }

  function isSameDocumentHash(url) {
    return url.origin === window.location.origin
      && url.pathname === window.location.pathname
      && url.search === window.location.search
      && Boolean(url.hash);
  }

  function shouldHandleLink(anchor, event) {
    if (!anchor || event.defaultPrevented || event.button !== 0) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (anchor.hasAttribute("download") || anchor.getAttribute("target") === "_blank") return false;
    if (anchor.dataset.router === "off") return false;

    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;

    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin || isSameDocumentHash(url)) return false;

    return true;
  }

  function syncHead(nextDocument) {
    document.title = nextDocument.title;
    document.documentElement.lang = nextDocument.documentElement.lang;

    HEAD_SELECTORS.forEach(function (selector) {
      document.head.querySelectorAll(selector).forEach(function (node) {
        node.remove();
      });
      nextDocument.head.querySelectorAll(selector).forEach(function (node) {
        document.head.appendChild(node.cloneNode(true));
      });
    });
  }

  function replacePage(nextDocument, url) {
    const nextBody = nextDocument.body;
    nextBody.querySelectorAll("script").forEach(function (script) {
      script.remove();
    });

    routeEvent("bero:page-leave", { from: window.location.href, to: url.href });
    syncHead(nextDocument);
    document.body.replaceWith(nextBody);
    routeEvent("bero:page-enter", { url: url.href });
  }

  function scrollAfterNavigation(url, options) {
    if (options.restoreScroll) {
      window.scrollTo(options.restoreScroll.x, options.restoreScroll.y);
      return;
    }

    if (url.hash) {
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (target) {
        target.scrollIntoView();
        return;
      }
    }

    window.scrollTo(0, 0);
  }

  async function fetchDocument(url, signal) {
    const response = await fetch(url.href, {
      headers: { "X-Bero-Navigation": "true" },
      signal: signal,
    });
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok || !contentType.includes("text/html")) {
      throw new Error("Navigation response is not HTML");
    }

    const html = await response.text();
    return new DOMParser().parseFromString(html, "text/html");
  }

  function wait(milliseconds) {
    if (milliseconds <= 0) return Promise.resolve();
    return new Promise(function (resolve) {
      window.setTimeout(resolve, milliseconds);
    });
  }

  function beginEntrance(shouldAnimate) {
    if (!shouldAnimate) {
      document.documentElement.classList.remove("is-route-loading", "is-route-leaving", "is-route-entering");
      return Promise.resolve();
    }

    document.documentElement.classList.remove("is-route-leaving");
    document.documentElement.classList.add("is-route-entering");
    void document.body.offsetWidth;

    return new Promise(function (resolve) {
      window.requestAnimationFrame(function () {
        document.documentElement.classList.remove("is-route-loading", "is-route-entering");
        resolve();
      });
    });
  }

  async function navigate(rawUrl, options) {
    const settings = Object.assign({ history: "push", restoreScroll: null, saveCurrent: true, animate: true }, options);
    const url = new URL(rawUrl, window.location.href);
    const currentNavigationId = ++navigationId;
    const navigationStartedAt = performance.now();
    const shouldAnimate = settings.animate !== false;

    if (url.href === window.location.href && settings.history !== "none") {
      window.scrollTo({ top: 0, left: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
      return;
    }

    if (navigationController) navigationController.abort();
    navigationController = new AbortController();
    if (settings.saveCurrent) saveScrollPosition();

    document.documentElement.classList.add("is-route-loading");
    if (shouldAnimate) document.documentElement.classList.add("is-route-leaving");
    document.documentElement.dataset.routerState = "loading";
    routeEvent("bero:route-start", { from: window.location.href, to: url.href });
    window.BeroSound?.play("navigate-out", "navigation");

    try {
      const nextDocument = await fetchDocument(url, navigationController.signal);
      if (currentNavigationId !== navigationId) return;
      await wait(shouldAnimate ? EXIT_DURATION - (performance.now() - navigationStartedAt) : 0);
      if (currentNavigationId !== navigationId) return;

      const update = function () {
        replacePage(nextDocument, url);
        if (settings.history === "push") {
          history.pushState({ beroScrollX: 0, beroScrollY: 0 }, "", url.href);
        } else if (settings.history === "replace") {
          history.replaceState({ beroScrollX: 0, beroScrollY: 0 }, "", url.href);
        }
        scrollAfterNavigation(url, settings);
      };

      update();
      await beginEntrance(shouldAnimate);

      document.documentElement.dataset.routerState = "ready";
      document.documentElement.dataset.routeCount = String(Number(document.documentElement.dataset.routeCount || 0) + 1);
      routeEvent("bero:route-complete", { url: url.href });
      window.BeroSound?.play("navigate-in", "navigation");
    } catch (error) {
      if (error.name === "AbortError") return;
      document.documentElement.classList.remove("is-route-loading", "is-route-leaving", "is-route-entering");
      document.documentElement.dataset.routerState = "fallback";
      window.location.assign(url.href);
    }
  }

  document.addEventListener("click", function (event) {
    if (!(event.target instanceof Element)) return;
    const anchor = event.target.closest("a[href]");
    if (!shouldHandleLink(anchor, event)) return;

    event.preventDefault();
    navigate(anchor.href, { animate: event.detail > 0 });
  });

  window.addEventListener("popstate", function (event) {
    navigate(window.location.href, {
      history: "none",
      restoreScroll: {
        x: event.state?.beroScrollX || 0,
        y: event.state?.beroScrollY || 0,
      },
      saveCurrent: false,
      animate: false,
    });
  });

  window.addEventListener("scroll", function () {
    if (scrollStateFrame) return;
    scrollStateFrame = window.requestAnimationFrame(function () {
      scrollStateFrame = 0;
      saveScrollPosition();
    });
  }, { passive: true });

  window.BeroRouter = Object.freeze({ navigate: navigate });
})();
