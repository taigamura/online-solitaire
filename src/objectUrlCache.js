// Browser-only helper (uses URL.createObjectURL) — kept out of src/game/, which
// must stay browser-global-free. Card images were previously re-created on every
// render with `URL.createObjectURL(file)`, allocating a fresh blob URL each time
// and never revoking it. This caches one URL per File, so a card reuses the same
// URL across renders instead of leaking a new one.
//
// Keyed by the File object with a WeakMap: when the File is garbage-collected the
// cache entry goes with it. The blob URLs themselves are released by the browser
// on page unload; for this client-only playtester that is sufficient.

const cache = new WeakMap();

export function objectUrlFor(file) {
  if (!file) {
    return '';
  }
  let url = cache.get(file);
  if (!url) {
    url = URL.createObjectURL(file);
    cache.set(file, url);
  }
  return url;
}
