// E2E environment: same-origin /backend and /middleware proxied to local stack.

export const environment = {
  production: false,
  hashLocationStrategy: false,
  hideBackgroundImage: true,
  hideDNIEAccess: true,
  apiUrl: '/backend',
  version: '1.2.8',
  environmentName: 'E2E',
  sitnaVersion: '4.8.0',
  buildTimestamp: new Date().toISOString(),
  loginBackgroundImageUrl: '',
  proxyTokenRefreshIntervalMs: 10 * 60 * 1000,
};
