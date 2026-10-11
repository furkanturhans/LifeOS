// A clock scoped to one sandboxed game frame. Pausing preserves pending delays.
export function createGameClock(native, time) {
  let sequence = 0, paused = true, pausedAt = time(), offset = 0;
  const timers = new Map();
  const now = () => (paused ? pausedAt : time()) - offset;
  function arm(id, record) {
    record.started = now();
    record.handle = native.setTimeout(() => {
      if (!timers.has(id) || paused) return;
      if (!record.repeat) timers.delete(id);
      else record.remaining = record.delay;
      record.callback(...record.args);
      if (record.repeat && timers.has(id) && !paused) arm(id, record);
    }, record.remaining);
  }
  function schedule(callback, delay, repeat, args) {
    if (typeof callback !== 'function') throw new TypeError('Game timers require functions');
    const id = ++sequence;
    const duration = Math.max(1, Number(delay) || 0);
    const record = { callback, delay: duration, remaining: duration, repeat, args, started: now(), handle: null };
    timers.set(id, record);
    if (!paused) arm(id, record);
    return id;
  }
  function clear(id) {
    const record = timers.get(id);
    if (record) native.clearTimeout(record.handle);
    timers.delete(id);
  }
  return {
    now,
    setTimeout: (callback, delay, ...args) => schedule(callback, delay, false, args),
    setInterval: (callback, delay, ...args) => schedule(callback, delay, true, args),
    clearTimeout: clear,
    clearInterval: clear,
    pause() {
      if (paused) return;
      pausedAt = time();
      for (const record of timers.values()) {
        native.clearTimeout(record.handle);
        record.remaining = Math.max(1, record.remaining - (now() - record.started));
      }
      paused = true;
    },
    resume() {
      if (!paused) return;
      offset += time() - pausedAt;
      paused = false;
      for (const [id, record] of timers) arm(id, record);
    },
    dispose() {
      for (const id of timers.keys()) clear(id);
      paused = true;
    },
  };
}
