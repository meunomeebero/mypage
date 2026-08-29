(function () {
  if (window.BeroAnalytics) return;

  const POSTHOG_KEY = "phc_ATBb9rU2g9UtZzV4eBYsGehvqUcCpL7w8KFSzRubhdUL";
  const POSTHOG_HOST = "https://us.i.posthog.com";
  const TRACKED_HOSTS = new Set(["bero.land", "www.bero.land"]);
  const SESSION_KEY = "bero-land-session-started-v2";
  const VISITOR_CACHE_KEY = "bero-land-visitor-counts-v2";
  const VISITOR_CACHE_TTL = 5 * 60 * 1000;
  const ENGAGEMENT_MILESTONES = [10, 30, 60, 120, 300];
  const SCROLL_MILESTONES = [25, 50, 75, 90, 100];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const isProduction = TRACKED_HOSTS.has(window.location.hostname);

  let hasBootstrapped = false;
  let clickTrackingBound = false;
  let customTrackingBound = false;
  let errorTrackingBound = false;
  let impressionObserver;
  let pageStartedAt = performance.now();
  let routeStartedAt = 0;
  let engagedSeconds = 0;
  let maxScrollDepth = 0;
  let summaryCaptured = false;
  let scrollFrame = 0;
  let visitorCountsPromise;
  let visitorCountsCache;
  let cumulativeLayoutShift = 0;
  let largestContentfulPaint = 0;
  let interactionToNextPaint = 0;

  function getPageName(pathname) {
    const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
    if (normalizedPath === "/" || normalizedPath === "/index" || normalizedPath === "/index.html") return "home";
    if (normalizedPath === "/en" || normalizedPath === "/en/index" || normalizedPath === "/en/index.html") return "home_en";

    return normalizedPath
      .replace(/^\/en\//, "")
      .replace(/^\//, "")
      .replace(/\.html$/, "")
      .replace(/\//g, "_") || "page";
  }

  function getLocale() {
    return document.documentElement.lang || "pt-BR";
  }

  function getPageContext() {
    return {
      page_name: getPageName(window.location.pathname),
      page_path: window.location.pathname,
      locale: getLocale(),
    };
  }

  function safeSessionGet(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch (_) {
      return null;
    }
  }

  function safeSessionSet(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (_) {
      // Analytics must never interfere with navigation when storage is blocked.
    }
  }

  function sanitizeUrl(rawUrl) {
    if (!rawUrl) return "";
    try {
      const url = new URL(rawUrl, window.location.href);
      return url.origin + url.pathname;
    } catch (_) {
      return String(rawUrl).split(/[?#]/)[0].slice(0, 300);
    }
  }

  function textOf(node) {
    return (node.textContent || "").replace(/\s+/g, " ").trim().slice(0, 160);
  }

  function sectionOf(node) {
    const container = node.closest(".section, .hero, .sidebar, .footer");
    if (!container) return "";
    if (container.classList.contains("hero")) return "hero";
    if (container.classList.contains("sidebar")) return "sidebar";
    if (container.classList.contains("footer")) return "footer";
    const heading = container.querySelector("h2");
    return heading ? textOf(heading) : "section";
  }

  function capture(eventName, properties) {
    if (!isProduction || !window.posthog || typeof window.posthog.capture !== "function") return;
    window.posthog.capture(eventName, Object.assign({}, getPageContext(), properties || {}));
  }

  function loadPostHog() {
    if (window.posthog && (window.posthog.__SV || window.posthog.__loaded)) return;

    !function (documentRef, posthog) {
      window.posthog = posthog;
      posthog._i = [];
      posthog.init = function (key, config, name) {
        function stub(target, method) {
          target[method] = function () {
            target.push([method].concat(Array.prototype.slice.call(arguments, 0)));
          };
        }

        const script = documentRef.createElement("script");
        script.type = "text/javascript";
        script.crossOrigin = "anonymous";
        script.async = true;
        script.src = config.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") + "/static/array.js";
        const firstScript = documentRef.getElementsByTagName("script")[0];
        firstScript.parentNode.insertBefore(script, firstScript);

        let instance = posthog;
        if (name !== undefined) instance = posthog[name] = [];
        else name = "posthog";

        instance.people = instance.people || [];
        const methods = "capture register register_once register_for_session unregister identify reset opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_distinct_id get_session_id".split(" ");
        for (let index = 0; index < methods.length; index += 1) stub(instance, methods[index]);
        posthog._i.push([key, config, name]);
      };
      posthog.__SV = 1;
    }(document, window.posthog || []);

    window.posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      defaults: "2026-05-30",
      person_profiles: "identified_only",
      persistence: "localStorage",
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: true,
      disable_session_recording: true,
    });
    window.posthog.register(getPageContext());
  }

  function capturePageView(navigationType) {
    if (!isProduction) return;
    window.posthog.register(getPageContext());
    capture("$pageview", {
      $current_url: window.location.href,
      $pathname: window.location.pathname,
      navigation_type: navigationType,
      referrer_url: sanitizeUrl(document.referrer),
    });
  }

  function bindClickTracking() {
    if (clickTrackingBound) return;
    clickTrackingBound = true;
    document.addEventListener("click", function (event) {
      if (!(event.target instanceof Element)) return;

      const anchor = event.target.closest("a[href]");
      if (anchor) {
        const rawHref = anchor.getAttribute("href") || "";
        const resolvedHref = anchor.href || rawHref;
        const targetUrl = resolvedHref ? new URL(resolvedHref, window.location.href) : null;
        capture("link_clicked", {
          link_text: textOf(anchor),
          link_href: sanitizeUrl(resolvedHref),
          link_protocol: targetUrl ? targetUrl.protocol.replace(":", "") : "",
          link_target: anchor.getAttribute("target") || "_self",
          link_position: Array.from(document.querySelectorAll("a[href]")).indexOf(anchor) + 1,
          link_id: anchor.id || "",
          is_external: Boolean(targetUrl && targetUrl.origin !== window.location.origin),
          is_download: anchor.hasAttribute("download"),
          section: sectionOf(anchor),
        });
        return;
      }

      const button = event.target.closest("button, summary, [role='button']");
      if (!button) return;
      capture("button_clicked", {
        button_text: textOf(button),
        button_id: button.id || "",
        button_name: button.getAttribute("name") || "",
        button_pressed: button.getAttribute("aria-pressed") || "",
        section: sectionOf(button),
      });
    }, { passive: true });
  }

  function observeInteractiveElements() {
    if (!("IntersectionObserver" in window) || !isProduction) return;
    if (impressionObserver) impressionObserver.disconnect();

    impressionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
        const element = entry.target;
        impressionObserver.unobserve(element);
        if (element.matches("a[href]")) {
          capture("link_impression", {
            link_text: textOf(element),
            link_href: sanitizeUrl(element.href || element.getAttribute("href") || ""),
            link_position: Array.from(document.querySelectorAll("a[href]")).indexOf(element) + 1,
            section: sectionOf(element),
          });
          return;
        }
        capture("button_impression", {
          button_text: textOf(element),
          button_id: element.id || "",
          section: sectionOf(element),
        });
      });
    }, { threshold: 0.5 });

    document.querySelectorAll("a[href], button, summary, [role='button']").forEach(function (element) {
      impressionObserver.observe(element);
    });
  }

  function capturePageSummary(reason) {
    if (summaryCaptured) return;
    summaryCaptured = true;
    capture("page_engagement_summary", {
      active_seconds: engagedSeconds,
      elapsed_seconds: Math.round((performance.now() - pageStartedAt) / 1000),
      max_scroll_depth: maxScrollDepth,
      exit_reason: reason,
    });
    flushWebVitals(reason);
  }

  function resetPageState() {
    pageStartedAt = performance.now();
    engagedSeconds = 0;
    maxScrollDepth = 0;
    summaryCaptured = false;
    cumulativeLayoutShift = 0;
    largestContentfulPaint = 0;
    interactionToNextPaint = 0;
    SCROLL_MILESTONES.forEach(function (milestone) {
      document.documentElement.removeAttribute("data-scroll-" + milestone);
    });
  }

  function measureScrollDepth() {
    scrollFrame = 0;
    const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    const scrollableHeight = Math.max(1, documentHeight - window.innerHeight);
    const depth = documentHeight <= window.innerHeight ? 100 : Math.min(100, Math.round((window.scrollY / scrollableHeight) * 100));
    maxScrollDepth = Math.max(maxScrollDepth, depth);

    SCROLL_MILESTONES.forEach(function (milestone) {
      const attribute = "data-scroll-" + milestone;
      if (depth < milestone || document.documentElement.hasAttribute(attribute)) return;
      document.documentElement.setAttribute(attribute, "true");
      capture("scroll_depth_reached", { depth_percent: milestone });
    });
  }

  function bindEngagementTracking() {
    window.addEventListener("scroll", function () {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(measureScrollDepth);
    }, { passive: true });

    window.setInterval(function () {
      if (document.visibilityState !== "visible" || !document.hasFocus()) return;
      engagedSeconds += 1;
      if (ENGAGEMENT_MILESTONES.includes(engagedSeconds)) {
        capture("engagement_milestone_reached", { active_seconds: engagedSeconds });
      }
    }, 1000);
    window.requestAnimationFrame(measureScrollDepth);
  }

  function bindCustomTracking() {
    if (customTrackingBound) return;
    customTrackingBound = true;
    window.addEventListener("bero:track", function (event) {
      const detail = event.detail || {};
      if (detail.event) capture(detail.event, detail.properties || {});
    });
    window.addEventListener("bero:route-start", function () {
      routeStartedAt = performance.now();
    });
    window.addEventListener("bero:page-leave", function () {
      capturePageSummary("soft_navigation");
    });
    window.addEventListener("bero:page-enter", renderVisitorStats);
    window.addEventListener("bero:route-complete", function () {
      resetPageState();
      capturePageView("soft_navigation");
      capture("route_transition_completed", {
        duration_ms: routeStartedAt ? Math.round(performance.now() - routeStartedAt) : 0,
      });
      observeInteractiveElements();
      window.requestAnimationFrame(measureScrollDepth);
    });
    window.addEventListener("pagehide", function () {
      capturePageSummary("pagehide");
    });
  }

  function bindErrorTracking() {
    if (errorTrackingBound) return;
    errorTrackingBound = true;
    window.addEventListener("error", function (event) {
      const target = event.target;
      if (target instanceof HTMLElement && target !== window) {
        const source = target.getAttribute("src") || target.getAttribute("href");
        if (source) capture("resource_load_error", { resource_tag: target.tagName.toLowerCase(), resource_url: sanitizeUrl(source) });
        return;
      }
      capture("javascript_error", {
        error_message: String(event.message || "Unknown error").slice(0, 240),
        error_source: sanitizeUrl(event.filename || ""),
        error_line: event.lineno || 0,
        error_column: event.colno || 0,
      });
    }, true);
    window.addEventListener("unhandledrejection", function (event) {
      const reason = event.reason instanceof Error ? event.reason.message : String(event.reason || "Unknown rejection");
      capture("unhandled_promise_rejection", { error_message: reason.slice(0, 240) });
    });
  }

  function captureNavigationPerformance() {
    const navigation = performance.getEntriesByType("navigation")[0];
    if (!navigation) return;
    capture("navigation_performance", {
      ttfb_ms: Math.round(navigation.responseStart),
      dom_interactive_ms: Math.round(navigation.domInteractive),
      dom_content_loaded_ms: Math.round(navigation.domContentLoadedEventEnd),
      load_complete_ms: Math.round(navigation.loadEventEnd),
      transfer_size_bytes: navigation.transferSize || 0,
      encoded_body_size_bytes: navigation.encodedBodySize || 0,
      navigation_type: navigation.type || "navigate",
    });
  }

  function observeWebVitals() {
    if (!("PerformanceObserver" in window)) return;
    function observe(type, callback, options) {
      if (!PerformanceObserver.supportedEntryTypes.includes(type)) return;
      try {
        const observer = new PerformanceObserver(function (list) { callback(list.getEntries()); });
        observer.observe(Object.assign({ type: type, buffered: true }, options || {}));
      } catch (_) {
        // Older browsers may reject newer observer options.
      }
    }
    observe("largest-contentful-paint", function (entries) {
      const latest = entries[entries.length - 1];
      if (latest) largestContentfulPaint = Math.round(latest.startTime);
    });
    observe("layout-shift", function (entries) {
      entries.forEach(function (entry) {
        if (!entry.hadRecentInput) cumulativeLayoutShift += entry.value;
      });
    });
    observe("event", function (entries) {
      entries.forEach(function (entry) {
        interactionToNextPaint = Math.max(interactionToNextPaint, Math.round(entry.duration || 0));
      });
    }, { durationThreshold: 40 });
  }

  function flushWebVitals(reason) {
    if (largestContentfulPaint > 0) capture("web_vital", { metric_name: "LCP", metric_value: largestContentfulPaint, unit: "ms", flush_reason: reason });
    capture("web_vital", { metric_name: "CLS", metric_value: Number(cumulativeLayoutShift.toFixed(4)), unit: "score", flush_reason: reason });
    if (interactionToNextPaint > 0) capture("web_vital", { metric_name: "INP", metric_value: interactionToNextPaint, unit: "ms", flush_reason: reason });
  }

  function formatVisitorCount(value) {
    return new Intl.NumberFormat(getLocale()).format(value);
  }

  function animateVisitorCount(element, value) {
    if (reduceMotion.matches || value === 0) {
      element.textContent = formatVisitorCount(value);
      return;
    }
    const duration = 240;
    const startedAt = performance.now();
    function frame(now) {
      const progress = Math.min(1, (now - startedAt) / duration);
      element.textContent = formatVisitorCount(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1 && element.isConnected) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  function readCachedVisitorCounts() {
    if (visitorCountsCache && Date.now() - visitorCountsCache.cachedAt < VISITOR_CACHE_TTL) return visitorCountsCache;
    const cached = safeSessionGet(VISITOR_CACHE_KEY);
    if (!cached) return null;
    try {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.cachedAt < VISITOR_CACHE_TTL) {
        visitorCountsCache = parsed;
        return parsed;
      }
    } catch (_) {
      return null;
    }
    return null;
  }

  function fetchVisitorCounts() {
    const cached = readCachedVisitorCounts();
    if (cached) return Promise.resolve(cached);
    if (visitorCountsPromise) return visitorCountsPromise;

    visitorCountsPromise = fetch("/api/visitors", { headers: { Accept: "application/json" } })
      .then(function (response) {
        if (!response.ok) throw new Error("Visitor count unavailable");
        return response.json();
      })
      .then(function (data) {
        const normalized = {
          today: Math.max(0, Number(data.today) || 0),
          month: Math.max(0, Number(data.month) || 0),
          updatedAt: data.updatedAt || new Date().toISOString(),
          cachedAt: Date.now(),
        };
        visitorCountsCache = normalized;
        safeSessionSet(VISITOR_CACHE_KEY, JSON.stringify(normalized));
        return normalized;
      })
      .finally(function () { visitorCountsPromise = null; });
    return visitorCountsPromise;
  }

  function renderVisitorStats() {
    const root = document.querySelector("[data-visitor-stats]");
    if (!root || root.dataset.state === "loading" || root.dataset.state === "ready") return;
    const today = root.querySelector("[data-visitor-today]");
    const month = root.querySelector("[data-visitor-month]");
    if (!today || !month) return;

    root.dataset.state = "loading";
    fetchVisitorCounts().then(function (counts) {
      if (!root.isConnected) return;
      root.dataset.state = "ready";
      root.title = getLocale().startsWith("en")
        ? "Unique visitors today and this month, updated every few minutes"
        : "Visitantes únicos de hoje e deste mês, atualizados a cada poucos minutos";
      animateVisitorCount(today, counts.today);
      animateVisitorCount(month, counts.month);
    }).catch(function () {
      if (!root.isConnected) return;
      root.dataset.state = "error";
      root.title = getLocale().startsWith("en")
        ? "Visitor count temporarily unavailable"
        : "Contagem de visitantes temporariamente indisponível";
    });
  }

  function bootstrap() {
    if (hasBootstrapped) return;
    hasBootstrapped = true;
    bindClickTracking();
    bindCustomTracking();
    renderVisitorStats();
    if (!isProduction) return;

    loadPostHog();
    resetPageState();
    bindErrorTracking();
    bindEngagementTracking();
    observeWebVitals();
    observeInteractiveElements();
    capturePageView("page_load");
    if (!safeSessionGet(SESSION_KEY)) {
      safeSessionSet(SESSION_KEY, "true");
      capture("site_session_started");
    }

    if (document.readyState === "complete") window.setTimeout(captureNavigationPerformance, 0);
    else window.addEventListener("load", captureNavigationPerformance, { once: true });
  }

  window.BeroAnalytics = Object.freeze({ capture: capture, refreshVisitorStats: renderVisitorStats });
  bootstrap();
})();
