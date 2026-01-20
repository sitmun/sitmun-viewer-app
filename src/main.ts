import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

async function bootstrap(): Promise<void> {
  // Define SITNA_BASE_URL before importing the API (required by SITNA documentation)
  // See: https://sitna.navarra.es/api/doc/index.html
  // Use window explicitly to ensure it's accessible in the module context
  (window as { SITNA_BASE_URL?: string }).SITNA_BASE_URL =
    '/assets/js/api-sitna/';
  // Also set on globalThis for compatibility
  (globalThis as { SITNA_BASE_URL?: string }).SITNA_BASE_URL =
    '/assets/js/api-sitna/';

  // Ensure d3 v3 global is available for c3 charts (SITNA ResultsPanel elevation charts)
  // c3 expects window.d3 with d3.scale.category10() for color generation
  const d3 = (window as { d3?: unknown }).d3;
  if (d3) {
    (globalThis as { d3?: unknown }).d3 = d3;
  } else {
    // Use console directly here as this is bootstrap code before Angular services are available
    // eslint-disable-next-line no-console
    console.warn('d3 global is missing; charts may not work');
  }

  try {
    await import('api-sitna');
  } catch (error: unknown) {
    // Use console directly here as this is bootstrap code before Angular services are available
    // eslint-disable-next-line no-console
    console.error('Failed to load SITNA library', error);
    throw error;
  }

  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err: unknown) => {
      // Use console directly here as this is bootstrap code before Angular services are available
      // eslint-disable-next-line no-console
      console.error('Angular bootstrap failed', err);
    });
}

bootstrap().catch((err: unknown) => {
  // Use console directly here as this is bootstrap code before Angular services are available
  // eslint-disable-next-line no-console
  console.error('Angular bootstrap failed', err);
});
