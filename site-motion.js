(function () {
  if (window.BeroMotion) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const targets = [
    ".status-bar", ".hero > *", ".section-head", ".link-list > *",
    ".featured-link", ".project-card", ".record", ".body-copy > *",
    ".fact", ".text-list > li", ".checklist > li", ".table-wrap", ".section > .note",
    ".section > .video-embed", ".embed-frame", ".cta-stack", ".pricing-block",
    ".gallery-gate-stage", ".project-index-link", ".project-contribute", ".footer",
  ].join(",");
  const active = new Map();
  let observer;
  let beat = 0;
  let generation = 0;

  function restore(element) {
    const entry = active.get(element);
    if (!entry) return;
    clearTimeout(entry.timer);
    entry.controls?.cancel();
    element.style.opacity = entry.opacity;
    element.style.transform = entry.transform;
    element.style.transformOrigin = entry.origin;
    active.delete(element);
    // Motion may flush its final transform in the next render frame. Release it
    // afterward too, so hover previews never inherit a permanent stacking context.
    window.requestAnimationFrame(function () {
      if (element.isConnected && !active.has(element)) element.style.transform = entry.transform;
    });
  }

  function stop() {
    generation += 1;
    observer?.disconnect();
    active.forEach(function (_, element) { restore(element); });
  }

  function enter(element, delay, audible) {
    if (!element.isConnected || active.has(element)) return;
    const entry = {
      opacity: element.style.opacity,
      transform: element.style.transform,
      origin: element.style.transformOrigin,
    };
    active.set(element, entry);
    const playful = element.matches(".project-card, .avatar, .gallery-gate-stage");
    element.style.transformOrigin = "50% 75%";
    try {
      entry.controls = window.Motion.animate(element, {
        opacity: [0, 1],
        transform: [playful ? "translateY(28px) scale(0.95, 1.035)" : "translateY(12px) scale(0.99, 1.01)", "translateY(0px) scale(1, 1)"],
      }, {
        type: "spring", bounce: playful ? 0.38 : 0.18,
        duration: playful ? 0.56 : 0.28, delay: delay / 1000,
        opacity: { type: "tween", duration: 0.18, ease: "easeOut", delay: delay / 1000 },
      });
      const currentGeneration = generation;
      entry.timer = setTimeout(function () {
        if (currentGeneration !== generation || document.hidden || !element.isConnected) return;
        const bounds = element.getBoundingClientRect();
        if (audible && bounds.bottom > 0 && bounds.top < window.innerHeight) {
          window.BeroSound?.play("arrival", "page-" + beat++);
        }
      }, delay);
      entry.controls.then(function () {
        if (active.get(element) === entry) restore(element);
      });
    } catch (_) {
      // Missing animation support must never hide or block the document.
      restore(element);
    }
  }

  function batch(elements, audible) {
    elements.sort(function (a, b) {
      const first = a.getBoundingClientRect();
      const second = b.getBoundingClientRect();
      return Math.abs(first.top - second.top) < 12 ? first.left - second.left : first.top - second.top;
    });
    elements.forEach(function (element, index) {
      // Bound the whole phrase so a long document never becomes a waiting room.
      enter(element, Math.min(index * 75, 450), audible);
    });
  }

  function start(event) {
    stop();
    beat = 0;
    if (event?.detail?.animate === false || reducedMotion.matches || document.hidden || !window.Motion?.animate || !window.IntersectionObserver) return;
    const elements = Array.from(document.querySelectorAll(".main " + targets.split(",").join(", .main ")))
      .filter(function (element) {
        return !element.closest("[hidden], [inert]") && element.getClientRects().length &&
          !element.parentElement.closest(targets);
      });
    const visible = [];
    observer = new IntersectionObserver(function (entries) {
      const arriving = [];
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        arriving.push(entry.target);
      });
      batch(arriving, true);
    }, { threshold: 0, rootMargin: "0px 0px -20px 0px" });
    elements.forEach(function (element) {
      const bounds = element.getBoundingClientRect();
      if (bounds.top < window.innerHeight && bounds.bottom > 0) visible.push(element);
      else if (bounds.top >= window.innerHeight) observer.observe(element);
    });
    if (!event?.detail?.resume || !window.BeroMotion.hasEntered) batch(visible, true);
    // Navigation stays stable between routes; only its first appearance is animated.
    if (!window.BeroMotion.hasEntered) {
      batch(Array.from(document.querySelectorAll(".sidebar__top, .sidebar__nav > *")), false);
      window.BeroMotion.hasEntered = true;
    }
  }

  function revealFocused(event) {
    active.forEach(function (_, element) {
      if (element.contains(event.target)) restore(element);
    });
  }

  document.addEventListener("focusin", revealFocused);
  document.addEventListener("pointerdown", revealFocused);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else start({ detail: { resume: true } });
  });
  reducedMotion.addEventListener("change", function () {
    if (reducedMotion.matches) stop();
    else start({ detail: { resume: true } });
  });
  window.addEventListener("bero:page-leave", stop);
  window.addEventListener("bero:route-complete", start);
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) start({ detail: { resume: true } });
  });
  window.BeroMotion = { start: start, stop: stop, hasEntered: false };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
