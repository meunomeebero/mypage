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
    window.dispatchEvent(new CustomEvent('bero:track', {
      detail: {
        event: 'secret_content_unlocked',
        properties: {
          trigger_id: 'secret-trigger'
        }
      }
    }));

    const script = document.createElement('script');
    script.src = '/chaos-mode.js';
    script.async = true;
    document.body.appendChild(script);
  });
})();
