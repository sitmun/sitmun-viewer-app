// Development environment configuration.
// Uses the local docker-compose stack backend URL.

export const environment = {
  production: false,
  hashLocationStrategy: false,
  hideBackgroundImage: false,
  hideDNIEAccess: true,
  apiUrl: 'http://localhost:9000/backend',
  version: '1.2.8-SNAPSHOT',
  environmentName: 'Development',
  sitnaVersion: '4.8.0',
  buildTimestamp: new Date().toISOString(),
  loginBackgroundImageUrl: 'assets/logos/barcelona_background.jpg',
  proxyTokenRefreshIntervalMs: 2 * 60 * 1000
};
