// Coin-spin do avatar: cada clique adiciona velocidade angular (rotateY),
// desacelera por atrito e assenta no múltiplo de 360° mais próximo.
(function () {
  const avatar = document.querySelector('.avatar');
  if (!avatar) return;

  avatar.style.cursor = 'pointer';
  avatar.style.willChange = 'transform, filter';

  const KICK = 900;          // graus/s adicionados por clique
  const MAX_SPEED = 5400;    // teto de velocidade
  const FRICTION = 0.9;      // decaimento exponencial por segundo
  const SETTLE_SPEED = 240;  // abaixo disso, começa a assentar
  const BLUR_FACTOR = 1 / 700;

  let angle = 0;
  let speed = 0;
  let rafId = null;
  let lastTime = 0;

  function render() {
    avatar.style.transform = 'perspective(600px) rotateY(' + angle + 'deg)';
    const blur = Math.min(Math.abs(speed) * BLUR_FACTOR, 8);
    avatar.style.filter = blur > 0.15 ? 'blur(' + blur.toFixed(2) + 'px)' : '';
  }

  function tick(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    angle += speed * dt;
    speed *= Math.pow(FRICTION, dt * 10);

    if (Math.abs(speed) < SETTLE_SPEED) {
      // Assenta suavemente na face frontal (múltiplo de 360°) mais próxima.
      const target = Math.round(angle / 360) * 360;
      const diff = target - angle;
      if (Math.abs(diff) < 0.5 && Math.abs(speed) < 20) {
        angle = target;
        speed = 0;
        render();
        rafId = null;
        return;
      }
      speed += diff * 6 * dt * 10;
      speed *= Math.pow(0.6, dt * 10);
    }

    render();
    rafId = requestAnimationFrame(tick);
  }

  avatar.addEventListener('click', function () {
    speed = Math.min(speed + KICK, MAX_SPEED);
    if (rafId === null) {
      lastTime = performance.now();
      rafId = requestAnimationFrame(tick);
    }
  });
})();
