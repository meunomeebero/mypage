(function() {
  function createIframe(button) {
    const videoId = button.getAttribute('data-video-id');
    const title = button.getAttribute('data-video-title') || 'Video';
    const start = parseInt(button.getAttribute('data-video-start') || '0', 10);
    const params = new URLSearchParams({
      autoplay: '1',
      rel: '0'
    });

    if (start > 0) {
      params.set('start', String(start));
    }

    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(videoId) + '?' + params.toString();
    iframe.title = title;
    iframe.loading = 'eager';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    return iframe;
  }

  document.addEventListener('click', function(event) {
    const button = event.target.closest('[data-lite-embed]');
    if (!button) {
      return;
    }

    const iframe = createIframe(button);
    const videoId = button.getAttribute('data-video-id') || '';
    const title = button.getAttribute('data-video-title') || 'Video';
    button.replaceWith(iframe);

    window.dispatchEvent(new CustomEvent('bero:track', {
      detail: {
        event: 'video_embed_loaded',
        properties: {
          video_id: videoId,
          video_title: title
        }
      }
    }));
  }, { passive: true });
})();
