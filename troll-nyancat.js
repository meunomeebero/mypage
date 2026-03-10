(function() {
  const GIF_SRC = '/public/troll/nyan-cat.gif';
  const STYLE_ID = 'troll-nyancat-styles';
  const CLASS_NAME = 'troll-nyan-cat';
  const TRACK_EVENT = 'nyan_cat_spawned';
  const Z_INDEX = 9990;
  const TRAJECTORIES = [
    'left-right',
    'right-left',
    'diag-tl-br',
    'diag-bl-tr',
    'diag-tr-bl',
    'diag-br-tl'
  ];

  let enabled = false;
  let assetFailed = false;
  let spawnTimer = null;
  let activeEl = null;
  let cleanupTimer = null;

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function isMobile() {
    return window.matchMedia('(max-width: 640px)').matches;
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function randomInt(min, max) {
    return Math.round(randomBetween(min, max));
  }

  function chooseTrajectory() {
    return TRAJECTORIES[randomInt(0, TRAJECTORIES.length - 1)];
  }

  function clearTimers() {
    if (spawnTimer) {
      window.clearTimeout(spawnTimer);
      spawnTimer = null;
    }

    if (cleanupTimer) {
      window.clearTimeout(cleanupTimer);
      cleanupTimer = null;
    }
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.' + CLASS_NAME + ' {',
      '  position: fixed;',
      '  left: 0;',
      '  top: 0;',
      '  height: auto;',
      '  pointer-events: none;',
      '  user-select: none;',
      '  z-index: ' + Z_INDEX + ';',
      '  will-change: transform;',
      '  image-rendering: -webkit-optimize-contrast;',
      '  image-rendering: crisp-edges;',
      '}'
    ].join('\n');

    document.head.appendChild(style);
  }

  function buildRoute(size) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const margin = size * 1.35;
    const upperBand = randomBetween(-size, height * 0.18);
    const lowerBand = randomBetween(height * 0.65, height + size);
    const midY = randomBetween(height * 0.08, height * 0.78);
    const drift = randomBetween(-28, 28);
    const mode = chooseTrajectory();

    if (mode === 'left-right') {
      return {
        name: mode,
        flip: false,
        startX: -margin,
        startY: midY,
        endX: width + margin,
        endY: midY + drift
      };
    }

    if (mode === 'right-left') {
      return {
        name: mode,
        flip: true,
        startX: width + margin,
        startY: midY,
        endX: -margin,
        endY: midY + drift
      };
    }

    if (mode === 'diag-tl-br') {
      return {
        name: mode,
        flip: false,
        startX: -margin,
        startY: upperBand,
        endX: width + margin,
        endY: lowerBand
      };
    }

    if (mode === 'diag-bl-tr') {
      return {
        name: mode,
        flip: false,
        startX: -margin,
        startY: lowerBand,
        endX: width + margin,
        endY: upperBand
      };
    }

    if (mode === 'diag-tr-bl') {
      return {
        name: mode,
        flip: true,
        startX: width + margin,
        startY: upperBand,
        endX: -margin,
        endY: lowerBand
      };
    }

    return {
      name: 'diag-br-tl',
      flip: true,
      startX: width + margin,
      startY: lowerBand,
      endX: -margin,
      endY: upperBand
    };
  }

  function transformFor(route, scale, atEnd) {
    const x = atEnd ? route.endX : route.startX;
    const y = atEnd ? route.endY : route.startY;
    const flip = route.flip ? ' scaleX(-1)' : '';
    return 'translate3d(' + x + 'px, ' + y + 'px, 0)' + flip + ' scale(' + scale + ')';
  }

  function removeActive() {
    clearTimers();

    if (!activeEl) {
      return;
    }

    activeEl.remove();
    activeEl = null;
  }

  function trackSpawn(route, size, duration) {
    window.dispatchEvent(new CustomEvent('bero:track', {
      detail: {
        event: TRACK_EVENT,
        properties: {
          trajectory: route.name,
          mirrored: route.flip,
          size: size,
          duration_ms: duration
        }
      }
    }));
  }

  function scheduleNext() {
    clearTimers();

    if (!enabled || prefersReducedMotion() || assetFailed || activeEl) {
      return;
    }

    const delay = randomInt(3500, 7000);
    spawnTimer = window.setTimeout(spawnCat, delay);
  }

  function handleBrokenAsset() {
    assetFailed = true;
    removeActive();
  }

  function spawnCat() {
    spawnTimer = null;

    if (!enabled || prefersReducedMotion() || assetFailed || activeEl) {
      return;
    }

    const size = isMobile() ? randomInt(288, 384) : randomInt(288, 384);
    const duration = randomInt(5000, 8000);
    const scale = Number(randomBetween(0.94, 1.08).toFixed(3));
    const route = buildRoute(size);
    const cat = document.createElement('img');

    activeEl = cat;
    cat.className = CLASS_NAME;
    cat.src = GIF_SRC;
    cat.alt = '';
    cat.setAttribute('aria-hidden', 'true');
    cat.draggable = false;
    cat.decoding = 'async';
    cat.style.width = size + 'px';
    cat.style.transform = transformFor(route, scale, false);

    cat.addEventListener('error', handleBrokenAsset, { once: true });
    cat.addEventListener('load', function() {
      if (!activeEl || activeEl !== cat || !enabled) {
        return;
      }

      trackSpawn(route, size, duration);

      window.requestAnimationFrame(function() {
        window.requestAnimationFrame(function() {
          if (!activeEl || activeEl !== cat || !enabled) {
            return;
          }

          cat.style.transition = 'transform ' + duration + 'ms linear';
          cat.style.transform = transformFor(route, scale, true);
        });
      });

      cleanupTimer = window.setTimeout(function() {
        if (activeEl === cat) {
          activeEl = null;
          cat.remove();
        }
        scheduleNext();
      }, duration + 200);
    }, { once: true });

    document.body.appendChild(cat);
  }

  function handleMode(enabledNext) {
    enabled = Boolean(enabledNext);

    if (!enabled || prefersReducedMotion()) {
      removeActive();
      return;
    }

    scheduleNext();
  }

  function bindModeChanges() {
    window.addEventListener('bero:troll-mode-change', function(event) {
      handleMode(Boolean(event.detail && event.detail.enabled));
    });
  }

  function bindMotionPreference() {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', function() {
        if (prefersReducedMotion()) {
          removeActive();
          return;
        }

        handleMode(enabled);
      });
      return;
    }

    if (typeof media.addListener === 'function') {
      media.addListener(function() {
        if (prefersReducedMotion()) {
          removeActive();
          return;
        }

        handleMode(enabled);
      });
    }
  }

  function bootstrap() {
    injectStyles();
    bindModeChanges();
    bindMotionPreference();

    if (document.documentElement.classList.contains('troll-mode-on')) {
      handleMode(true);
    }
  }

  bootstrap();
})();
