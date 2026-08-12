(function () {
  if (window.BeroGalleryGate) return;

  const ITEM_REVEAL_INTERVAL = 180;
  const ITEM_REVEAL_DURATION = 460;
  let revealTimers = [];

  function clearRevealTimers() {
    revealTimers.forEach(function (timer) {
      window.clearTimeout(timer);
    });
    revealTimers = [];
  }

  function initGalleryGate() {
    const portal = document.querySelector("[data-gallery-gate]");
    if (!portal || portal.dataset.galleryGateReady === "true") return;

    const gate = portal.querySelector(".gallery-gate");
    const collection = portal.querySelector(".gallery");
    if (!gate || !collection) return;

    portal.dataset.galleryGateReady = "true";
    collection.hidden = true;
    collection.inert = true;
    collection.setAttribute("aria-hidden", "true");

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const keyboardArrival = document.documentElement.dataset.inputMode === "keyboard";

    if (reduceMotion.matches || keyboardArrival) {
      portal.classList.add("is-motion-instant", "is-ready");
    } else {
      window.requestAnimationFrame(function () {
        portal.classList.add("is-ready");
      });
    }

    function revealCollection() {
      if (portal.classList.contains("is-open")) return;

      gate.setAttribute("aria-expanded", "true");
      collection.hidden = false;
      collection.setAttribute("aria-hidden", "false");
      portal.classList.remove("is-bouncing");
      portal.classList.add("is-opening");

      const items = Array.from(collection.querySelectorAll(".gallery__item"));
      const instantReveal = portal.classList.contains("is-motion-instant");

      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          portal.classList.add("is-open");

          if (instantReveal) {
            items.forEach(function (item) {
              item.classList.add("is-revealed");
            });
            collection.inert = false;
            return;
          }

          clearRevealTimers();
          items.forEach(function (item, index) {
            const timer = window.setTimeout(function () {
              if (!item.isConnected) return;

              item.classList.add("is-revealed", "is-revealing");
              item.addEventListener("animationend", function handleRevealEnd(event) {
                if (event.animationName !== "gallery-item-jelly-in") return;
                item.classList.remove("is-revealing");
              }, { once: true });

              window.dispatchEvent(new CustomEvent("bero:sound", {
                detail: { kind: "reveal", profile: "gallery-" + index },
              }));
            }, index * ITEM_REVEAL_INTERVAL);

            revealTimers.push(timer);
          });

          const completeTimer = window.setTimeout(function () {
            if (collection.isConnected) collection.inert = false;
            revealTimers = [];
          }, Math.max(0, items.length - 1) * ITEM_REVEAL_INTERVAL + ITEM_REVEAL_DURATION);

          revealTimers.push(completeTimer);
        });
      });
    }

    gate.addEventListener("click", function (event) {
      if (portal.classList.contains("is-opening") || portal.classList.contains("is-bouncing")) return;

      if (reduceMotion.matches || event.detail === 0) {
        portal.classList.add("is-motion-instant");
        revealCollection();
        return;
      }

      gate.setAttribute("aria-disabled", "true");
      portal.classList.add("is-bouncing");

      const fallbackTimer = window.setTimeout(revealCollection, 580);
      gate.addEventListener("animationend", function handleBounceEnd(event) {
        if (event.animationName !== "gallery-gate-jelly-out") return;
        window.clearTimeout(fallbackTimer);
        revealCollection();
      }, { once: true });
    });
  }

  window.BeroGalleryGate = Object.freeze({ init: initGalleryGate });
  document.addEventListener("DOMContentLoaded", initGalleryGate);
  window.addEventListener("bero:page-enter", initGalleryGate);
  window.addEventListener("bero:page-leave", clearRevealTimers);
})();
