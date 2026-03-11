// Production environment configuration (static fallback).
// For Docker builds, use the environment.prod.ts.template with envsubst.

export const environment = {
  production: true,
  hashLocationStrategy: true,
  hideBackgroundImage: false,
  hideDNIEAccess: false,
  apiUrl: '/backend', // Change this when there is a real production environment
  version: '1.2.5',
  environmentName: 'Production',
  sitnaVersion: '4.8.0',
  buildTimestamp: new Date().toISOString(),
  loginBackgroundImageUrl: '/assets/logos/barcelona_background.jpg'
};
