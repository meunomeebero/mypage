(function() {
  const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);
  const ROUTE_MAP = new Map([
    ['/', '/index.html'],
    ['/about', '/about.html'],
    ['/media-kit', '/media-kit.html'],
    ['/projects', '/projects.html'],
    ['/videos', '/videos.html'],
    ['/contact', '/contact.html'],
    ['/minilab', '/minilab.html'],
    ['/berolab', '/berolab.html'],
    ['/setup', '/setup.html'],
    ['/site', '/site.html'],
    ['/en', '/en/index.html'],
    ['/en/about', '/en/about.html'],
    ['/en/media-kit', '/en/media-kit.html'],
    ['/en/projects', '/en/projects.html'],
    ['/en/videos', '/en/videos.html'],
    ['/en/contact', '/en/contact.html'],
    ['/en/minilab', '/en/minilab.html'],
    ['/en/berolab', '/en/berolab.html'],
    ['/en/setup', '/en/setup.html'],
    ['/en/site', '/en/site.html']
  ]);

  function isLocalEnvironment() {
    return LOCAL_HOSTS.has(window.location.hostname) || window.location.protocol === 'file:';
  }

  function localTargetFor(rawTarget) {
    if (!rawTarget) {
      return rawTarget;
    }

    let url;
    try {
      url = new URL(rawTarget, window.location.href);
    } catch (error) {
      return rawTarget;
    }

    if (window.location.protocol !== 'file:' && url.origin !== window.location.origin) {
      return rawTarget;
    }

    const normalizedPath = url.pathname !== '/' ? url.pathname.replace(/\/+$/, '') : '/';
    const mappedPath = ROUTE_MAP.get(normalizedPath);

    if (!mappedPath) {
      return rawTarget;
    }

    return mappedPath + url.search + url.hash;
  }

  function rewriteAttribute(node, attribute) {
    const currentValue = node.getAttribute(attribute);
    const rewrittenValue = localTargetFor(currentValue);

    if (rewrittenValue && rewrittenValue !== currentValue) {
      node.setAttribute(attribute, rewrittenValue);
    }
  }

  function rewriteLocalNavigation() {
    document.querySelectorAll('a[href]').forEach(function(node) {
      rewriteAttribute(node, 'href');
    });

    document.querySelectorAll('[data-lang-target]').forEach(function(node) {
      rewriteAttribute(node, 'data-lang-target');
    });
  }

  if (!isLocalEnvironment()) {
    return;
  }

  rewriteLocalNavigation();
})();
