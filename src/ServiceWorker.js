const MIDDLEWARE_URL_KEY = 'MIDDLEWARE_URL';
const AUTH_TOKEN_KEY = 'AUTH_TOKEN';

let authToken = undefined;
let middlewareUrl = undefined;

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('message', (event) => {
  const eventData = event.data;
  if (eventData.type === AUTH_TOKEN_KEY) {
    authToken = eventData.token;
    return;
  }

  if (eventData.type === MIDDLEWARE_URL_KEY) {
    middlewareUrl = eventData.url;

  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Filter requests to only include middleware requests
  if (!middlewareUrl || !url.toString().startsWith(middlewareUrl)) {
    return;
  }

  // Check if we have an auth token to add to the request. If not, omit
  if (authToken) {
    const modifiedRequest = new Request(request, {
      headers: new Headers({
        ...request.headers,
        Authorization: `Bearer ${authToken}`
      }),
      credentials: 'omit',
      mode: 'cors'
    });

    event.respondWith(fetch(modifiedRequest));
  } else {
    event.respondWith(fetch(request));
  }
});
