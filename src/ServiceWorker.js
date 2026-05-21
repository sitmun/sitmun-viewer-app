const MIDDLEWARE_URL_KEY = 'MIDDLEWARE_URL';
const DB_NAME = 'sitmun-sw-db';
const TOKENS_STORE_NAME = 'tokens';
const CONFIG_STORE_NAME = 'config';
const READONLY = 'readonly';
const ID = 'id';

/** Enables verbose URL logging. Kept off in production to avoid leaking proxy endpoint paths. */
const DEBUG = self.location.hostname === 'localhost';

let middlewareUrl;
let middlewareUrlLoadPromise = null; // single-flight guard — see loadMiddlewareUrlFromDB()

self.addEventListener('install', (event) => {
  event.waitUntil(
    loadMiddlewareUrlFromDB()
      .catch(() => {})     // IDB failure must not block installation
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', () => {
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  const eventData = event.data;
  if (eventData.type === MIDDLEWARE_URL_KEY) {
    middlewareUrl = eventData.url;
    if (DEBUG) console.debug('[SW] Middleware URL updated:', middlewareUrl);

    // CRITICAL for hard refresh - force claim clients so the SW regains control
    self.clients.claim()
      .then(() => console.debug('[SW] Re-claimed clients after message'))
      .catch((err) => console.warn('[SW] Failed to re-claim clients:', err));
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Fast path: known middleware URL and request does not match — zero SW overhead
  if (middlewareUrl && !url.href.startsWith(middlewareUrl)) {
    return;
  }

  event.respondWith((async () => {

    // Restore state from DB if SW woke up from idle (middlewareUrl was lost).
    // If IDB is unavailable, fall through to the plain fetch below.
    if (!middlewareUrl) await loadMiddlewareUrlFromDB().catch(() => {});

    // Not a proxy request (or URL still unknown after failed DB restore)
    if (!middlewareUrl || !url.href.startsWith(middlewareUrl)) return fetch(request);

    try {
      const token = await getTokenWithRetry('proxy_token');

      const headers = new Headers(request.headers);

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
        if (DEBUG) console.debug(`[SW] Requested ${url} with Authorization header`);
      } else {
        console.warn(`[SW] Token not found!`);
      }

      const modifiedRequest = new Request(request, { headers });
      const response = await fetch(modifiedRequest);

      // If we get an auth error, notify the main thread to refresh the token
      if (response.status === 401 || response.status === 403) {
        console.warn(`[SW] Auth error (${response.status}) for ${url}. Notifying app...`);
        notifyAppOfAuthError();
      }

      return response;
    } catch (error) {
      console.error('[SW] Error handling middleware request', error);
      return fetch(request);
    }
  })());
});

function notifyAppOfAuthError() {
  self.clients.matchAll()
    .then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'AUTH_ERROR',
          timestamp: Date.now()
        });
      });
    })
    .catch((err) => console.warn('[SW] Failed to notify app of auth error:', err));
}

/**
 * Loads the middleware URL from IndexedDB into the in-memory `middlewareUrl`
 * variable. Uses a single-flight guard (`middlewareUrlLoadPromise`) so that
 * concurrent fetch events arriving while the SW is idle share one IDB read
 * instead of each opening their own connection (IDB storm prevention).
 */
function loadMiddlewareUrlFromDB() {
  if (!middlewareUrlLoadPromise) {
    middlewareUrlLoadPromise = readMiddlewareUrlFromDB()
      .finally(() => { middlewareUrlLoadPromise = null; });
  }
  return middlewareUrlLoadPromise;
}

async function readMiddlewareUrlFromDB() {
  let db = null;
  try {
    db = await openDB();
    middlewareUrl = await getConfigFromDB(db, 'middleware_url');
    if (middlewareUrl) {
      if (DEBUG) console.debug('[SW] Middleware URL loaded from DB', middlewareUrl);
    }
  } catch (error) {
    console.warn('[SW] Error loading middleware URL from DB', error);
    throw error;
  } finally {
    if (db) db.close();
  }
}

/**
 * Reads a token from IDB, retrying once after a short delay.
 * The delay handles the initial load race condition where the Angular app
 * has not yet written the token to IDB by the time the first proxy request
 * arrives.
 */
async function getTokenWithRetry(name, retryDelayMs = 500) {
  const token = await getToken(name);
  if (token) return token;
  await new Promise(resolve => setTimeout(resolve, retryDelayMs));
  return getToken(name);
}

async function getToken(tokenName) {
  let db = null;
  try {
    db = await openDB();
    return await getTokenFromDB(db, tokenName);
  } catch (error) {
    console.warn('[IDB] Error retrieving proxy token', error);
    return null;
  } finally {
    if (db) db.close();
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(TOKENS_STORE_NAME)) {
        db.createObjectStore(TOKENS_STORE_NAME, { keyPath: ID });
      }
      if (!db.objectStoreNames.contains(CONFIG_STORE_NAME)) {
        db.createObjectStore(CONFIG_STORE_NAME, { keyPath: ID });
      }
    };
  });
}

function getTokenFromDB(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([TOKENS_STORE_NAME], READONLY);
    const store = transaction.objectStore(TOKENS_STORE_NAME);
    const request = store.get(id);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result.token : null);
    };
  });
}

function getConfigFromDB(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CONFIG_STORE_NAME], READONLY);
    const store = transaction.objectStore(CONFIG_STORE_NAME);
    const request = store.get(id);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result.value : null);
    };
  });
}
