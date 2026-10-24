import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import vm from "node:vm";
import { allPages } from "./config.mjs";

const code = readFileSync("site-motion.js", "utf8");
function fixture({ reduced = false, missing = false, fail = false } = {}) {
  const listeners = {};
  const frames = [];
  const timers = new Map();
  const animations = [];
  const sounds = [];
  const makeElement = (top, playful = false) => ({
    style: { opacity: "", transform: "", transformOrigin: "" }, isConnected: true,
    parentElement: { closest: () => null }, closest: () => null,
    getClientRects: () => [{}], getBoundingClientRect: () => ({ top, bottom: top + 40, left: 0 }),
    matches: () => playful, contains(other) { return this === other; },
  });
  const elements = Array.from({length: 10}, (_, i) => makeElement(20 + i * 42, i === 3));
  const belowFold = makeElement(1200, true);
  elements.push(belowFold);
  const media = { matches: reduced, addEventListener(_, fn) { this.change = fn; } };
  const observer = { observed: [], observe(e) { this.observed.push(e); }, unobserve() {}, disconnect() { this.disconnected = true; } };
  const document = { readyState: "complete", hidden: false,
    addEventListener(name, fn) { listeners[name] = fn; },
    querySelectorAll(selector) { return selector.startsWith(".main") ? elements : []; },
  };
  const window = { document, innerHeight: 800, matchMedia: () => media,
    addEventListener(name, fn) { listeners[name] = fn; },
    requestAnimationFrame(fn) { frames.push(fn); },
    IntersectionObserver: function (fn) { observer.callback = fn; return observer; },
    Motion: missing ? undefined : { animate(element, keyframes, options) {
      if (fail) throw Error("unsupported");
      element.style.opacity = "0";
      element.style.transform = keyframes.transform[0];
      const animation = { element, keyframes, options, cancelled: false,
        cancel() { this.cancelled = true; }, then(callback) { this.finish = callback; } };
      animations.push(animation);
      return animation;
    } },
    BeroSound: { play(kind, profile) { sounds.push([kind, profile]); } },
  };
  vm.runInNewContext(code, { window, document, IntersectionObserver: window.IntersectionObserver,
    setTimeout(fn, delay) { const id = timers.size + 1; timers.set(id, { fn, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
  });
  return { window, document, elements, belowFold, media, observer, listeners, animations, timers, frames, sounds };
}

const f = fixture();
assert.equal(f.animations.length, 10, "only in-view elements animate initially");
assert.deepEqual(f.observer.observed, [f.belowFold]);
assert.equal(f.belowFold.style.opacity, "", "below-fold content must stay visible if observation fails");
assert.equal(f.animations[1].options.delay, 0.075);
assert.ok(f.animations.every(a => a.options.delay <= 0.45), "stagger must never lock a long page behind a long delay");
assert.match(f.animations[3].keyframes.transform[0], /scale\(0.95, 1.035\)/);
assert.equal(f.animations[3].options.type, "spring");
for (const { fn } of f.timers.values()) fn();
assert.equal(f.sounds.length, 10, "arrival cues use the same scheduled start as the motion");
f.observer.callback([{isIntersecting: true, target: f.belowFold}]);
assert.equal(f.animations.length, 11);
f.listeners.focusin({target: f.elements[3]});
assert.equal(f.elements[3].style.opacity, "", "focus must immediately reveal an animating control");
f.listeners["bero:page-leave"]();
assert.ok(f.animations.every(a=>a.cancelled));
assert.equal(f.timers.size, 0, "route leave must cancel pending sound cues");
assert.ok(f.elements.every(e=>e.style.opacity === ""));
assert.ok(f.observer.disconnected);
const count = f.animations.length;
f.listeners["bero:route-complete"]({detail:{animate:false}});
assert.equal(f.animations.length, count, "keyboard/back navigation must not restart choreography");
f.listeners["bero:route-complete"]({detail:{animate:true}});
assert.equal(f.animations.length, count + 10, "soft navigation must remount choreography");
f.document.hidden = true;
f.listeners.visibilitychange();
assert.equal(f.timers.size, 0, "background tabs must not retain queued sounds");
f.document.hidden = false;
f.listeners.visibilitychange();
assert.equal(f.animations.length, count + 10, "returning to a tab must not replay the visible scene");
assert.ok(f.observer.observed.includes(f.belowFold), "below-fold reveals must resume after tab visibility changes");
f.media.matches = true;
f.media.change();
assert.ok(f.elements.every(e=>e.style.opacity === ""), "changing motion preference must release every element");
assert.equal(f.timers.size, 0);
assert.equal(fixture({ reduced:true }).animations.length, 0);
assert.equal(fixture({ missing:true }).animations.length, 0);
assert.ok(fixture({ fail:true }).elements.every(e=>e.style.opacity === ""));

for (const { path, slug } of allPages) {
  const html = readFileSync(path, "utf8");
  assert.match(html, /public\/vendor\/motion\.js[^>]*defer/);
  assert.ok(html.indexOf("public/vendor/motion.js") < html.indexOf("site-motion.js"));
  if (!["index", "projects"].includes(slug)) continue;
  for (const [, asset] of html.matchAll(/src="(\/public\/projects\/[^\"]+)"/g)) {
    assert.ok(existsSync(asset.slice(1)), `${path}: missing project preview ${asset}`);
  }
}
console.log("motion runtime: viewport stagger, spring transforms, audio timing, route cleanup, keyboard and reduced-motion fallbacks verified");
