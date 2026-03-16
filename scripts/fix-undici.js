// Fix for Undici / TypeError: Illegal constructor issues on Windows with Node 20+
try {
  const undici = require('undici');
  
  // Only shim if necessary
  if (typeof global.Request === 'undefined' || global.Request.name !== 'Request') {
    global.Request = undici.Request;
    global.Response = undici.Response;
    global.Headers = undici.Headers;
    global.fetch = undici.fetch;
  }

  // The Illegal constructor error often happens during CacheStorage initialization
  // Shimming caches can bypass the problematic creation of a real CacheStorage
  if (typeof global.caches === 'undefined') {
    global.caches = {
      open: () => Promise.resolve({}),
      keys: () => Promise.resolve([]),
      has: () => Promise.resolve(false),
      delete: () => Promise.resolve(false),
      match: () => Promise.resolve(undefined)
    };
  }
} catch (e) {
  // Ignore errors if undici is not available
}
