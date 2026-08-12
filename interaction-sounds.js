(function () {
  if (window.BeroSound) return;

  const STORAGE_KEY = "bero-sound-enabled";
  const INTERACTION_RULES = [
    {
      selector: ".link-row, .cta-button, .gallery__frame, .sidebar__nav a, a[href]",
      profile: "link",
    },
    {
      selector: ".avatar, .video-embed, button:not([disabled]), summary, [role='button']",
      profile: "control",
    },
    {
      selector: "input:not([type='hidden']):not([disabled]), textarea:not([disabled]), select:not([disabled]), label",
      profile: "field",
    },
  ];
  const TARGET_SELECTOR = INTERACTION_RULES.map(function (rule) {
    return rule.selector;
  }).join(",");
  const KEYBOARD_KEYS = new Set(["Enter", " "]);
  const SCROLL_KEYS = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "]);
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const cueCooldowns = {
    hover: 90,
    press: 90,
    focus: 110,
    scroll: 240,
    "navigate-out": 120,
    "navigate-in": 160,
    expand: 120,
    collapse: 120,
    media: 180,
    reveal: 150,
    success: 180,
  };
  const lastCueAt = {};
  let audioContext;
  let masterGain;
  let unlockPromise;
  let enabled = readPreference();
  let inputMode = "pointer";
  let scrollIntentUntil = 0;
  let scrollFrame = 0;
  let scrollBucket = getScrollBucket();

  document.documentElement.dataset.inputMode = inputMode;

  function readPreference() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) !== "false";
    } catch (error) {
      return true;
    }
  }

  function writePreference() {
    try {
      window.localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
    } catch (error) {
      // The in-memory preference still works when storage is unavailable.
    }
  }

  function setState(state) {
    document.documentElement.dataset.soundState = state;
    syncControls();
  }

  function getTarget(node) {
    if (!(node instanceof Element)) return null;

    const element = node.closest(TARGET_SELECTOR);
    if (!element || element.closest("[data-sound='off']")) return null;
    if (element.matches(":disabled") || element.getAttribute("aria-disabled") === "true") return null;

    const explicitProfile = element.getAttribute("data-sound");
    const rule = INTERACTION_RULES.find(function (candidate) {
      return element.matches(candidate.selector);
    });

    return rule ? { element: element, profile: explicitProfile || rule.profile } : null;
  }

  function getAudioContext() {
    if (audioContext) return audioContext;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      setState("unsupported");
      return null;
    }

    audioContext = new AudioContext();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.72;
    masterGain.connect(audioContext.destination);
    audioContext.addEventListener("statechange", function () {
      if (!enabled) return setState("muted");
      setState(audioContext.state === "running" ? "ready" : "locked");
    });
    return audioContext;
  }

  function unlock() {
    const context = getAudioContext();
    if (!context) return Promise.resolve(null);
    if (!enabled) {
      setState("muted");
      return Promise.resolve(context);
    }
    if (context.state === "running") {
      setState("ready");
      return Promise.resolve(context);
    }

    if (!unlockPromise) {
      setState("unlocking");
      unlockPromise = context.resume().then(function () {
        setState(enabled ? (context.state === "running" ? "ready" : "locked") : "muted");
        return context;
      }).catch(function () {
        setState("locked");
        return null;
      }).finally(function () {
        unlockPromise = null;
      });
    }

    return unlockPromise;
  }

  function voice(context, options) {
    const start = context.currentTime + (options.delay || 0);
    const end = start + options.duration;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = options.type;
    oscillator.frequency.setValueAtTime(options.from, start);
    oscillator.frequency.exponentialRampToValueAtTime(options.to, end);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(options.volume, start + Math.min(0.012, options.duration / 3));
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(gain);
    gain.connect(masterGain);
    oscillator.start(start);
    oscillator.stop(end + 0.01);
  }

  function play(kind, profile) {
    const now = performance.now();
    if (!enabled || document.hidden || !audioContext || audioContext.state !== "running") return false;
    if (now - (lastCueAt[kind] || 0) < (cueCooldowns[kind] || 100)) return false;

    lastCueAt[kind] = now;
    document.documentElement.dataset.soundEvent = kind + ":" + (profile || "default");

    if (kind === "hover" || kind === "focus") {
      const frequencies = profile === "field" ? [490, 570] : profile === "control" ? [520, 625] : [550, 660];
      voice(audioContext, {
        type: "sine",
        from: frequencies[0],
        to: frequencies[1],
        duration: kind === "focus" ? 0.07 : 0.052,
        volume: kind === "focus" ? 0.011 : 0.013,
      });
      return true;
    }

    if (kind === "scroll") {
      voice(audioContext, {
        type: "sine",
        from: 310,
        to: 350,
        duration: 0.045,
        volume: 0.008,
      });
      return true;
    }

    if (kind === "navigate-out" || kind === "navigate-in") {
      const entering = kind === "navigate-in";
      voice(audioContext, {
        type: "sine",
        from: entering ? 360 : 460,
        to: entering ? 540 : 330,
        duration: entering ? 0.12 : 0.085,
        volume: 0.014,
      });
      return true;
    }

    if (kind === "reveal") {
      const stepMatch = /gallery-(\d+)/.exec(profile || "");
      const step = stepMatch ? Math.min(Number(stepMatch[1]), 5) : 0;
      const base = 360 + step * 26;

      voice(audioContext, {
        type: "sine",
        from: base,
        to: base + 112,
        duration: 0.105,
        volume: 0.014,
      });
      voice(audioContext, {
        type: "triangle",
        from: base + 180,
        to: base + 230,
        delay: 0.018,
        duration: 0.065,
        volume: 0.006,
      });
      return true;
    }

    if (kind === "expand" || kind === "collapse" || kind === "success" || kind === "media") {
      const rising = kind === "expand" || kind === "success" || kind === "media";
      const base = kind === "media" ? 300 : kind === "success" ? 420 : 340;
      voice(audioContext, {
        type: "sine",
        from: rising ? base : base + 110,
        to: rising ? base + 120 : base,
        duration: 0.095,
        volume: 0.016,
      });
      return true;
    }

    const base = profile === "field" ? 235 : profile === "control" ? 255 : 275;
    voice(audioContext, {
      type: "triangle",
      from: base,
      to: base - 48,
      duration: 0.08,
      volume: 0.022,
    });
    voice(audioContext, {
      type: "sine",
      from: base + 330,
      to: base + 440,
      delay: 0.012,
      duration: 0.06,
      volume: 0.009,
    });
    return true;
  }

  function setEnabled(nextEnabled) {
    enabled = Boolean(nextEnabled);
    writePreference();

    if (!enabled) {
      setState("muted");
      return Promise.resolve(false);
    }

    return unlock().then(function (context) {
      if (context?.state === "running") play("success", "sound");
      return Boolean(context && context.state === "running");
    });
  }

  function syncControls() {
    const locale = document.documentElement.lang === "pt-BR" ? "pt-BR" : "en";
    const state = document.documentElement.dataset.soundState;
    document.querySelectorAll("[data-sound-toggle]").forEach(function (button) {
      button.textContent = locale === "pt-BR" ? "SOM" : "SOUND";
      button.setAttribute("aria-pressed", enabled ? "true" : "false");
      button.setAttribute("aria-label", locale === "pt-BR"
        ? (enabled ? "Desativar efeitos sonoros" : "Ativar efeitos sonoros")
        : (enabled ? "Disable sound effects" : "Enable sound effects"));
      button.dataset.state = state || (enabled ? "locked" : "muted");
    });
  }

  function mountControls() {
    document.querySelectorAll(".status-bar__slot--right").forEach(function (slot) {
      if (slot.querySelector("[data-sound-toggle]")) return;

      const separator = document.createElement("span");
      const button = document.createElement("button");
      separator.className = "status-bar__separator sound-control__separator";
      separator.setAttribute("aria-hidden", "true");
      separator.textContent = "/";
      button.type = "button";
      button.className = "sound-control";
      button.setAttribute("data-sound-toggle", "");
      button.setAttribute("data-sound", "control");
      slot.append(separator, button);
    });
    syncControls();
  }

  function getScrollBucket() {
    return Math.floor(window.scrollY / Math.max(window.innerHeight * 0.72, 480));
  }

  function markScrollIntent() {
    scrollIntentUntil = performance.now() + 520;
  }

  function handleScroll() {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(function () {
      scrollFrame = 0;
      const nextBucket = getScrollBucket();
      if (nextBucket !== scrollBucket && performance.now() < scrollIntentUntil) {
        scrollBucket = nextBucket;
        play("scroll", "page");
      } else {
        scrollBucket = nextBucket;
      }
    });
  }

  document.addEventListener("pointerover", function (event) {
    if (!finePointer.matches) return;

    const target = getTarget(event.target);
    const previousTarget = getTarget(event.relatedTarget);
    if (!target || (previousTarget && previousTarget.element === target.element)) return;
    play("hover", target.profile);
  }, true);

  document.addEventListener("pointerdown", function (event) {
    inputMode = "pointer";
    document.documentElement.dataset.inputMode = inputMode;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const target = getTarget(event.target);
    unlock().then(function (context) {
      if (context?.state === "running" && target) play("press", target.profile);
    });
  }, true);

  document.addEventListener("keydown", function (event) {
    inputMode = "keyboard";
    document.documentElement.dataset.inputMode = inputMode;
    if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
    if (SCROLL_KEYS.has(event.key)) markScrollIntent();

    const target = getTarget(event.target);
    unlock().then(function (context) {
      if (!context || !target || !KEYBOARD_KEYS.has(event.key)) return;
      if (event.key === " " && target.element.matches("a[href]")) return;
      play("press", target.profile);
    });
  }, true);

  document.addEventListener("focusin", function (event) {
    if (inputMode !== "keyboard") return;
    const target = getTarget(event.target);
    if (target) play("focus", target.profile);
  }, true);

  document.addEventListener("click", function (event) {
    const toggle = event.target.closest("[data-sound-toggle]");
    if (!toggle) return;
    setEnabled(!enabled);
  });

  window.addEventListener("wheel", markScrollIntent, { passive: true });
  window.addEventListener("touchstart", markScrollIntent, { passive: true });
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("bero:sound", function (event) {
    const detail = event.detail || {};
    play(detail.kind || "press", detail.profile || "default");
  });
  window.addEventListener("bero:page-enter", function () {
    scrollBucket = getScrollBucket();
    mountControls();
  });
  window.addEventListener("bero:route-start", function () {
    scrollIntentUntil = 0;
  });

  window.BeroSound = Object.freeze({
    isEnabled: function () { return enabled; },
    mountControls: mountControls,
    play: play,
    setEnabled: setEnabled,
    unlock: unlock,
  });

  setState(enabled ? "locked" : "muted");
  mountControls();
})();
