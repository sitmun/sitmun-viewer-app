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
