// Coin-spin do avatar: impulsos acumulam velocidade e a face assenta com mola suave.
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const KICK = 760;
  const MAX_SPEED = 3600;
  const FRICTION = 0.86;
  const SETTLE_SPEED = 210;
  const BLUR_FACTOR = 1 / 1800;
  let avatar;
  let controller;
  let angle = 0;
  let speed = 0;
  let rafId = 0;
  let lastTime = 0;

  function render() {
    if (!avatar) return;
    avatar.style.transform = 'perspective(600px) rotateY(' + angle + 'deg)';
    const blur = Math.min(Math.abs(speed) * BLUR_FACTOR, 1.8);
    avatar.style.filter = blur > 0.12 ? 'blur(' + blur.toFixed(2) + 'px)' : '';
  }

  function stop() {
    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = 0;
    if (!avatar) return;
    avatar.style.willChange = '';
    avatar.style.filter = '';
  }

  function tick(now) {
    if (!avatar) return stop();

    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    angle += speed * dt;
    speed *= Math.pow(FRICTION, dt * 10);

    if (Math.abs(speed) < SETTLE_SPEED) {
      const target = Math.round(angle / 360) * 360;
      const diff = target - angle;
      if (Math.abs(diff) < 0.35 && Math.abs(speed) < 14) {
        angle = target;
        speed = 0;
        render();
        stop();
        return;
      }
      speed += diff * 7.2 * dt * 10;
      speed *= Math.pow(0.54, dt * 10);
    }

    render();
    rafId = window.requestAnimationFrame(tick);
  }

  function cleanup() {
    stop();
    controller?.abort();
    controller = null;
    avatar = null;
    angle = 0;
    speed = 0;
  }

  function init() {
    cleanup();
    avatar = document.querySelector('.avatar');
    if (!avatar) return;

    controller = new AbortController();
    avatar.style.cursor = 'pointer';
    avatar.addEventListener('click', function () {
      if (reduceMotion.matches) return;
      speed = Math.min(speed + KICK, MAX_SPEED);
      if (!rafId) {
        avatar.style.willChange = 'transform, filter';
        lastTime = performance.now();
        rafId = window.requestAnimationFrame(tick);
      }
    }, { signal: controller.signal });
  }

  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('bero:page-leave', cleanup);
  window.addEventListener('bero:page-enter', init);
})();
