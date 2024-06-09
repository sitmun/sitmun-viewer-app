
const MIDDLEWARE_URL_KEY = "MIDDLEWARE_URL";
const AUTH_TOKEN_KEY = "AUTH_TOKEN";

var authToken = undefined;
var middlewareUrl = undefined;

self.addEventListener("install", (event) => {
  console.log("Service worker installed");
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  console.log("Service worker activated");
});

self.addEventListener("message", (event) => {
  const eventData = event.data;
  if (eventData.type === AUTH_TOKEN_KEY) {
    authToken = eventData.token;
    console.log("Access token received");
    return;
  }

  if (eventData.type === MIDDLEWARE_URL_KEY) {
    middlewareUrl = eventData.url;
    console.log("Middleware URL received:", middlewareUrl);
    return;
  }

  console.log("Unknown message received:", eventData);
});

self.addEventListener("fetch", (event) => {
  var request = event.request;
  var url = new URL(request.url);

  // Filter requests to only include middleware requests
  if (!middlewareUrl || !url.toString().startsWith(middlewareUrl)) {
    return;
  }

  // Check if we have an auth token to add to the request. If not, omit
  if (authToken) {
    const modifiedRequest = new Request(request, {
      headers: new Headers({
        ...request.headers,
        "Authorization": `Bearer ${authToken}`
      }),
      credentials: "omit",
      mode: "cors"
    });

    console.log("Sending modified request to", modifiedRequest.url);
    event.respondWith(fetch(modifiedRequest));
  } else {
    console.log("No auth token found, sending original request");
    event.respondWith(fetch(request))
  }
});
