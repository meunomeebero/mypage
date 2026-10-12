// The coin settles before changing faces; the vector's gaze eases toward the pointer.
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const KICK = 760;
  const MAX_SPEED = 3600;
  const FRICTION = 0.86;
  let avatar, face, gif, vector, eyes, controller, observer;
  let svgTemplate, svgPromise;
  let targetFace = 'gif';
  let pointer = null;
  let visible = true;
  let angle = 0, speed = 0, rafId = 0, lastTime = 0;
  let eyeFrame = 0, eyeTime = 0, eyeX = 0, eyeY = 0;

  function prepareSvg() {
    if (svgTemplate) return Promise.resolve(svgTemplate);
    if (svgPromise) return svgPromise;
    svgPromise = fetch('/public/assets/bero-avatar.svg?v=20261012-1')
      .then(function (response) {
        if (!response.ok) throw new Error('Avatar unavailable');
        return response.text();
      })
      .then(function (markup) {
        const svg = new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement;
        if (svg.localName !== 'svg' || !svg.querySelector('[data-part="eyes"]')) throw new Error('Invalid avatar');
        svg.setAttribute('aria-hidden', 'true');
        svg.removeAttribute('role');
        svg.removeAttribute('aria-labelledby');
        svgTemplate = svg;
        return svg;
      })
      .finally(function () { svgPromise = null; });
    return svgPromise;
  }

  function stopEyes(reset) {
    if (eyeFrame) window.cancelAnimationFrame(eyeFrame);
    eyeFrame = 0;
    eyeTime = 0;
    if (reset) {
      eyeX = eyeY = 0;
      eyes?.setAttribute('transform', 'translate(0 0)');
    }
  }

  function canFollow() {
    return eyes && avatar?.dataset.avatarFace === 'svg' && visible && !document.hidden &&
      !reduceMotion.matches && finePointer.matches && !rafId;
  }

  function follow(now) {
    eyeFrame = 0;
    if (!canFollow()) return stopEyes(false);
    const bounds = vector.getBoundingClientRect();
    const centerX = bounds.left + bounds.width * (213 / 368);
    const centerY = bounds.top + bounds.height * (217 / 368);
    // The travel limits come from the original artwork's eye animation.
    const x = pointer ? Math.tanh((pointer.x - centerX) / Math.max(bounds.width * 0.7, 120)) * 48 : 0;
    const y = pointer ? Math.max(-6, Math.min(1, Math.tanh((pointer.y - centerY) / Math.max(bounds.height, 150)) * 7)) : 0;
    const dt = eyeTime ? Math.min((now - eyeTime) / 1000, 0.05) : 1 / 60;
    eyeTime = now;
    const blend = -Math.expm1(-12 * dt);
    eyeX += (x - eyeX) * blend;
    eyeY += (y - eyeY) * blend;
    const settled = Math.abs(x - eyeX) < 0.02 && Math.abs(y - eyeY) < 0.02;
    if (settled) { eyeX = x; eyeY = y; }
    eyes.setAttribute('transform', 'translate(' + eyeX.toFixed(4) + ' ' + eyeY.toFixed(4) + ')');
    if (!settled) eyeFrame = window.requestAnimationFrame(follow);
    else eyeTime = 0;
  }

  function queueEyes() {
    if (canFollow() && !eyeFrame) eyeFrame = window.requestAnimationFrame(follow);
  }

  function displayFace(kind) {
    gif.hidden = kind === 'svg';
    vector.hidden = kind !== 'svg';
    avatar.dataset.avatarFace = kind;
    avatar.dataset.avatarState = 'idle';
    avatar.setAttribute('aria-pressed', String(kind === 'svg'));
    stopEyes(true);
    queueEyes();
  }

  async function applyFace() {
    if (!avatar) return;
    if (targetFace === 'gif') return displayFace('gif');
    const currentAvatar = avatar;
    const signal = controller.signal;
    try {
      if (!eyes) {
        avatar.dataset.avatarState = 'loading';
        const svg = await prepareSvg();
        if (signal.aborted || currentAvatar !== avatar) return;
        vector.replaceChildren(document.importNode(svg, true));
        eyes = vector.querySelector('[data-part="eyes"]');
      }
      if (!rafId) displayFace(targetFace);
    } catch (_) {
      if (!signal.aborted && currentAvatar === avatar && !rafId) {
        targetFace = 'gif';
        displayFace('gif');
        avatar.dataset.avatarState = 'error';
      }
    }
  }

  function render() {
    face.style.transform = 'perspective(600px) rotateY(' + angle + 'deg)';
    const blur = Math.min(Math.abs(speed) / 1800, 1.8);
    face.style.filter = blur > 0.12 ? 'blur(' + blur.toFixed(2) + 'px)' : '';
  }

  function stopSpin() {
    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = 0;
    angle = speed = 0;
    if (face) {
      face.style.willChange = '';
      face.style.transform = '';
      face.style.filter = '';
    }
  }

  function finishSpin() {
    stopSpin();
    applyFace();
  }

  function tick(now) {
    if (!face) return stopSpin();
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    angle += speed * dt;
    speed *= Math.pow(FRICTION, dt * 10);
    if (Math.abs(speed) < 210) {
      const target = Math.round(angle / 360) * 360;
      const diff = target - angle;
      if (Math.abs(diff) < 0.35 && Math.abs(speed) < 14) return finishSpin();
      speed += diff * 7.2 * dt * 10;
      speed *= Math.pow(0.54, dt * 10);
    }
    render();
    rafId = window.requestAnimationFrame(tick);
  }

  function cleanup() {
    stopSpin();
    stopEyes(false);
    controller?.abort();
    observer?.disconnect();
    controller = observer = avatar = face = gif = vector = eyes = null;
    targetFace = 'gif';
    pointer = null;
    visible = true;
  }

  function init() {
    cleanup();
    avatar = document.querySelector('.avatar');
    if (!avatar) return;
    face = avatar.querySelector('.avatar__face');
    gif = face?.querySelector('img');
    vector = face?.querySelector('.avatar__vector');
    if (!face || !gif || !vector) return cleanup();
    controller = new AbortController();
    const options = { signal: controller.signal };
    displayFace('gif');
    prepareSvg().catch(function () { /* Keep the GIF usable if the SVG cannot load. */ });
    avatar.addEventListener('click', function (event) {
      targetFace = targetFace === 'gif' ? 'svg' : 'gif';
      if (event.detail && Number.isFinite(event.clientX)) pointer = { x: event.clientX, y: event.clientY };
      stopEyes(false);
      if (reduceMotion.matches || event.detail === 0) return finishSpin();
      avatar.dataset.avatarState = 'spinning';
      speed = Math.min(speed + KICK, MAX_SPEED);
      if (!rafId) {
        face.style.willChange = 'transform, filter';
        lastTime = performance.now();
        rafId = window.requestAnimationFrame(tick);
      }
    }, options);
    window.addEventListener('pointermove', function (event) {
      if (event.pointerType === 'touch') return;
      pointer = { x: event.clientX, y: event.clientY };
      queueEyes();
    }, { ...options, passive: true });
    function centerEyes() { pointer = null; queueEyes(); }
    window.addEventListener('pointerout', function (event) {
      if (!event.relatedTarget) centerEyes();
    }, options);
    window.addEventListener('blur', centerEyes, options);
    window.addEventListener('scroll', queueEyes, { ...options, passive: true });
    window.addEventListener('resize', queueEyes, options);
    if (window.IntersectionObserver) {
      observer = new window.IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (!visible) {
          stopEyes(false);
          if (rafId) finishSpin();
        } else queueEyes();
      });
      observer.observe(avatar);
    }
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stopEyes(false);
      if (rafId) finishSpin();
    } else queueEyes();
  });
  reduceMotion.addEventListener('change', function () {
    if (reduceMotion.matches) {
      stopEyes(true);
      if (rafId) finishSpin();
    } else queueEyes();
  });
  finePointer.addEventListener('change', function () {
    if (!finePointer.matches) stopEyes(true);
    else queueEyes();
  });
  window.addEventListener('bero:page-leave', cleanup);
  window.addEventListener('bero:page-enter', init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
