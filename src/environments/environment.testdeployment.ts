export const environment = {
  production: false,
  hashLocationStrategy: false, // true would solve page refresh issues in GitHub pages,
  // but currently it interferes with SITNA map state management:
  // Map.js puts state changes in a hash fragment in the URL, but currently it
  // erases any other hash in that URL (a bug?)
  hideBackgroundImage: false,
  hideDNIEAccess: false,
  apiUrl: 'https://sitmun-backend-core.herokuapp.com',
  version: '1.1.0',
  environmentName: 'Test Deployment',
  sitnaVersion: '4.8.0',
  buildTimestamp: new Date().toISOString(),
  loginBackgroundImageUrl: '/assets/logos/barcelona_background.jpg'
};
