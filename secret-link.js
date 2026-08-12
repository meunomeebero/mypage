(function() {
  let loaded = false;

  document.addEventListener('click', function(event) {
    if (!(event.target instanceof Element)) {
      return;
    }

    const trigger = event.target.closest('#secret-trigger');
    if (!trigger) {
      return;
    }

    if (loaded) {
      return;
    }

    loaded = true;
    window.dispatchEvent(new CustomEvent('bero:sound', {
      detail: { kind: 'success', profile: 'secret' }
    }));
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
    document.head.appendChild(script);
  });
})();
