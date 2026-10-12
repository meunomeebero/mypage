import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const code = readFileSync('avatar-spin.js', 'utf8');
const markup = readFileSync('public/assets/bero-avatar.svg', 'utf8');

function events() {
  const listeners = new Map();
  return {
    addEventListener(name, fn, options = {}) {
      if (!listeners.has(name)) listeners.set(name, []);
      listeners.get(name).push({ fn, signal: options.signal });
    },
    emit(name, event = {}) {
      for (const { fn, signal } of listeners.get(name) || []) if (!signal?.aborted) fn(event);
    },
  };
}

function fixture({ reduced = false, fine = true, failed = false, deferred = false } = {}) {
  const frames = new Map();
  let frameId = 0, now = 0, fetches = 0, resolveFetch;
  const preferences = { ...events(), matches: reduced };
  const pointer = { ...events(), matches: fine };
  const eyes = { attrs: {}, setAttribute(name, value) { this.attrs[name] = value; } };
  const svg = { localName: 'svg', setAttribute() {}, removeAttribute() {}, querySelector: () => eyes };
  function element() {
    const gif = { hidden: false };
    const vector = { hidden: true, child: null,
      replaceChildren(child) { this.child = child; }, querySelector: () => eyes,
      getBoundingClientRect: () => ({ left: 300, top: 100, width: 120, height: 120 }),
    };
    const face = { style: {}, querySelector: selector => selector === 'img' ? gif : vector };
    return { ...events(), dataset: {}, attrs: {}, face, gif, vector,
      querySelector: () => face, setAttribute(name, value) { this.attrs[name] = value; },
    };
  }
  const avatar = element();
  const document = { ...events(), readyState: 'complete', hidden: false, current: avatar,
    querySelector() { return this.current; }, importNode: value => value,
  };
  const window = { ...events(), matchMedia: query => query.includes('reduced') ? preferences : pointer,
    requestAnimationFrame(fn) { frames.set(++frameId, fn); return frameId; },
    cancelAnimationFrame(id) { frames.delete(id); },
    IntersectionObserver: function (callback) {
      this.callback = callback;
      this.observe = () => {};
      this.disconnect = () => {};
      window.observer = this;
    },
  };
  vm.runInNewContext(code, {
    window, document, AbortController, performance: { now: () => now },
    DOMParser: class { parseFromString() { return { documentElement: svg }; } },
    fetch: async () => {
      fetches++;
      if (deferred) await new Promise(resolve => { resolveFetch = resolve; });
      return { ok: !failed, text: async () => markup };
    },
  });
  async function flush() { for (let i = 0; i < 12; i++) await Promise.resolve(); }
  function step(count = 1) {
    for (let i = 0; i < count; i++) {
      now += 1000 / 60;
      const batch = [...frames.values()];
      frames.clear();
      for (const fn of batch) fn(now);
    }
  }
  async function settle() {
    await flush();
    for (let i = 0; i < 600 && frames.size; i++) { step(); await flush(); }
    assert.equal(frames.size, 0, 'spin and gaze must settle without an endless animation loop');
  }
  return { avatar, eyes, document, window, preferences, pointer, frames, flush, step, settle,
    click(detail = 1) { document.current.emit('click', { detail, clientX: 360, clientY: 160 }); },
    move(x, y, pointerType = 'mouse') { window.emit('pointermove', { clientX: x, clientY: y, pointerType }); },
    get fetches() { return fetches; }, resolve() { resolveFetch(); }, element,
  };
}

const f = fixture();
await f.flush();
f.click();
assert.equal(f.avatar.dataset.avatarFace, 'gif');
assert.equal(f.avatar.dataset.avatarState, 'spinning');
f.step(20);
assert.equal(f.avatar.dataset.avatarFace, 'gif', 'the face changes only after the spin finishes');
await f.settle();
assert.equal(f.avatar.dataset.avatarFace, 'svg');
assert.equal(f.avatar.attrs['aria-pressed'], 'true');
assert.equal(f.avatar.gif.hidden, true);
f.move(1200, 80);
await f.settle();
assert.match(f.eyes.attrs.transform, /^translate\(4[0-8]\./, 'the eyes follow the pointer to the right');
f.move(0, 80);
await f.settle();
assert.match(f.eyes.attrs.transform, /^translate\(-4[0-8]\./, 'the eyes follow the pointer to the left');
f.click();
await f.settle();
assert.equal(f.avatar.dataset.avatarFace, 'gif');
assert.equal(f.avatar.vector.hidden, true);
assert.equal(f.avatar.attrs['aria-pressed'], 'false');
f.click(); f.click();
await f.settle();
assert.equal(f.avatar.dataset.avatarFace, 'gif', 'rapid clicks preserve toggle parity');
f.click(0);
await f.settle();
assert.equal(f.avatar.dataset.avatarFace, 'svg', 'keyboard activation uses the same toggle');
f.move(1200, 200);
f.window.observer.callback([{ isIntersecting: false }]);
assert.equal(f.frames.size, 0, 'offscreen gaze must stop');
f.window.observer.callback([{ isIntersecting: true }]);
await f.settle();
f.click();
f.window.emit('bero:page-leave');
assert.equal(f.frames.size, 0, 'leaving a route cancels all avatar animation');
f.document.current = f.element();
f.window.emit('bero:page-enter');
f.click(0);
await f.settle();
assert.equal(f.document.current.dataset.avatarFace, 'svg', 'soft navigation remounts the control');
assert.equal(f.fetches, 1, 'the original SVG is reused across soft routes');

for (const options of [{ reduced: true }, { fine: false }]) {
  const staticAvatar = fixture(options);
  await staticAvatar.flush();
  staticAvatar.click(0);
  await staticAvatar.settle();
  staticAvatar.move(1200, 200);
  assert.equal(staticAvatar.frames.size, 0, 'reduced motion and coarse pointers keep a static gaze');
  assert.equal(staticAvatar.eyes.attrs.transform, 'translate(0 0)');
}
const failed = fixture({ failed: true });
await failed.flush(); failed.click(0); await failed.settle();
assert.equal(failed.avatar.dataset.avatarFace, 'gif', 'load failure retains the GIF');
assert.equal(failed.avatar.dataset.avatarState, 'error');

const delayed = fixture({ deferred: true });
delayed.click(0);
delayed.window.emit('bero:page-leave');
delayed.resolve(); await delayed.flush();
assert.equal(delayed.avatar.vector.child, null, 'late SVG loading must not mutate a detached route');
console.log('avatar runtime: post-spin toggle, gaze, rapid clicks, keyboard, route cleanup, motion preferences and load failure verified');
