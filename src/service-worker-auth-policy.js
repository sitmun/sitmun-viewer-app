(function (root) {
  const retryableMethods = new Set(['GET', 'HEAD']);

  function createAuthFetchOrchestrator({
    readInitialToken,
    readToken,
    notify,
    sleep,
    onRetryError = () => {},
    refreshAttempts = 10
  }) {
    const refreshWaits = new Map();

    const waitForNewToken = (previousToken) => {
      const key = previousToken ?? '';
      if (!refreshWaits.has(key)) {
        const wait = (async () => {
          for (let attempt = 0; attempt < refreshAttempts; attempt++) {
            await sleep();
            const token = await readToken();
            if (token && token !== previousToken) return token;
          }
          return null;
        })().finally(() => refreshWaits.delete(key));
        refreshWaits.set(key, wait);
      }
      return refreshWaits.get(key);
    };

    return Object.freeze({
      async handle({ clientId, method, execute }) {
        const previousToken = await readInitialToken();
        const response = await execute(previousToken);
        const messageType =
          response.status === 401
            ? 'PROXY_AUTH_REQUIRED'
            : response.status === 403
              ? 'PROXY_ACCESS_DENIED'
              : null;
        if (!messageType) return response;

        await notify(clientId, { type: messageType });
        if (
          response.status !== 401 ||
          !retryableMethods.has(String(method).toUpperCase())
        ) {
          return response;
        }

        const refreshedToken = await waitForNewToken(previousToken);
        if (!refreshedToken || (await readToken()) !== refreshedToken) {
          return response;
        }
        try {
          return await execute(refreshedToken);
        } catch (error) {
          onRetryError(error);
          return response;
        }
      }
    });
  }

  root.SitmunProxyAuthPolicy = Object.freeze({
    createAuthFetchOrchestrator,

    getMessageType(status) {
      if (status === 401) return 'PROXY_AUTH_REQUIRED';
      if (status === 403) return 'PROXY_ACCESS_DENIED';
      return null;
    },

    isMiddlewareRequest(requestUrl, middlewareUrl) {
      try {
        const baseOrigin = root.location?.origin;
        const request = new URL(requestUrl, baseOrigin);
        const middleware = new URL(middlewareUrl, baseOrigin);
        const middlewarePath = middleware.pathname.replace(/\/+$/, '');
        return (
          request.origin === middleware.origin &&
          (request.pathname === middlewarePath ||
            request.pathname.startsWith(`${middlewarePath}/`))
        );
      } catch {
        return false;
      }
    },

    isRetryableMethod(method) {
      return retryableMethods.has(String(method).toUpperCase());
    },

    shouldRetry(status, method, retryCount) {
      return (
        status === 401 &&
        retryCount === 0 &&
        retryableMethods.has(String(method).toUpperCase())
      );
    }
  });
})(typeof self === 'undefined' ? globalThis : self);
