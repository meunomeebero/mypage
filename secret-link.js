(function() {
  const trigger = document.getElementById('secret-trigger');

  if (!trigger) {
    return;
  }

  let loaded = false;

  trigger.addEventListener('click', function() {
    if (loaded) {
      return;
    }

    loaded = true;

    const script = document.createElement('script');
    script.src = './chaos-mode.js';
    script.async = true;
    document.body.appendChild(script);
  });
})();
