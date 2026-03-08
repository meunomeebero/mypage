(function() {
  const STORAGE_KEY = 'bero-land-troll-mode';
  const CLICK_SOUND_SRC = '/public/audio/pru.mp3';
  const POINTER_SELECTORS = 'a, button, input, textarea, select, summary, label, [role="button"]';
  const MODEL_VIEWER_SRC = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';

  let enabled = window.localStorage.getItem(STORAGE_KEY) === 'on';
  let cursorEl = null;
  let clickAudio = null;
  let modelViewerPromise = null;

  function ensureCursor() {
    if (cursorEl) {
      return cursorEl;
    }

    cursorEl = document.createElement('div');
    cursorEl.id = 'troll-cursor';
    document.body.appendChild(cursorEl);
    return cursorEl;
  }

  function ensureAudio() {
    if (clickAudio) {
      return clickAudio;
    }

    clickAudio = new Audio(CLICK_SOUND_SRC);
    clickAudio.preload = 'auto';
    return clickAudio;
  }

  function syncButtons() {
    document.querySelectorAll('[data-troll-choice]').forEach(function(node) {
      const isActive = node.getAttribute('data-troll-choice') === (enabled ? 'on' : 'off');
      node.classList.toggle('is-active', isActive);
      node.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function ensureModelViewer() {
    if (window.customElements && window.customElements.get('model-viewer')) {
      return Promise.resolve();
    }

    if (modelViewerPromise) {
      return modelViewerPromise;
    }

    modelViewerPromise = new Promise(function(resolve, reject) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = MODEL_VIEWER_SRC;
      script.onload = function() {
        if (window.customElements && window.customElements.whenDefined) {
          window.customElements.whenDefined('model-viewer').then(resolve).catch(reject);
          return;
        }

        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return modelViewerPromise;
  }

  function restoreAvatars() {
    document.querySelectorAll('[data-troll-avatar-model]').forEach(function(node) {
      const originalHtml = node.getAttribute('data-original-html');
      if (!originalHtml) {
        return;
      }

      node.innerHTML = originalHtml;
    });
  }

  function enable3DAvatars() {
    const avatars = document.querySelectorAll('[data-troll-avatar-model]');
    if (!avatars.length) {
      return Promise.resolve();
    }

    return ensureModelViewer().then(function() {
      avatars.forEach(function(node) {
        if (!node.getAttribute('data-original-html')) {
          node.setAttribute('data-original-html', node.innerHTML);
        }

        const src = node.getAttribute('data-troll-avatar-model');
        node.innerHTML = '<div class="avatar__model-crop"><model-viewer src="' + src + '" autoplay camera-controls auto-rotate disable-zoom interaction-prompt="none" shadow-intensity="1" exposure="1.1" camera-target="0m 1.2m 0m" field-of-view="18deg"></model-viewer></div>';
      });
    }).catch(function() {
      // Keep original avatars if model-viewer fails to load.
    });
  }

  function applyMode() {
    document.documentElement.classList.toggle('troll-mode-on', enabled);
    ensureCursor();
    document.documentElement.classList.remove('is-pointer');
    restoreAvatars();
    syncButtons();
  }

  function trackModeChange() {
    window.dispatchEvent(new CustomEvent('bero:track', {
      detail: {
        event: 'troll_mode_changed',
        properties: {
          troll_mode: enabled ? 'on' : 'off'
        }
      }
    }));
  }

  function buildToggle() {
    document.querySelectorAll('.status-bar__slot--left').forEach(function(node) {
      if (node.querySelector('.troll-switch')) {
        return;
      }

      const wrapper = document.createElement('div');
      wrapper.className = 'troll-switch';

      const label = document.createElement('span');
      label.className = 'troll-switch__label';
      label.textContent = 'Troll mode:';

      const offButton = document.createElement('button');
      offButton.type = 'button';
      offButton.setAttribute('data-troll-choice', 'off');
      offButton.textContent = 'off';

      const divider = document.createElement('span');
      divider.className = 'lang-switch__sep';
      divider.textContent = '/';

      const onButton = document.createElement('button');
      onButton.type = 'button';
      onButton.setAttribute('data-troll-choice', 'on');
      onButton.textContent = 'on';

      wrapper.appendChild(label);
      wrapper.appendChild(offButton);
      wrapper.appendChild(divider);
      wrapper.appendChild(onButton);

      node.appendChild(wrapper);
    });
  }

  function bindToggle() {
    document.addEventListener('click', function(event) {
      const choice = event.target.closest('[data-troll-choice]');
      if (choice) {
        enabled = choice.getAttribute('data-troll-choice') === 'on';
        window.localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
        applyMode();
        trackModeChange();
        return;
      }

      if (!enabled) {
        return;
      }

      try {
        const audio = ensureAudio();
        audio.currentTime = 0;
        audio.play();
      } catch (error) {
        // Ignore autoplay restrictions.
      }
    }, { passive: true });

    document.addEventListener('mousemove', function(event) {
      if (!enabled) {
        return;
      }

      const cursor = ensureCursor();
      cursor.style.transform = 'translate(' + (event.clientX - 8) + 'px, ' + (event.clientY - 8) + 'px)';
      const isPointer = Boolean(event.target && event.target.closest(POINTER_SELECTORS));
      document.documentElement.classList.toggle('is-pointer', isPointer);
    }, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', function() {
    buildToggle();
    bindToggle();
    applyMode();
  });
})();
