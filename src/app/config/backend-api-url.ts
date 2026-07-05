import { environment } from '../../environments/environment';

/**
 * True when {@link url} targets the SITMUN backend REST API (`{apiUrl}/api/…`
 * or same-origin relative `/api/…`). Uses path-prefix matching so incidental
 * "api" segments (e.g. `assets/js/api-sitna/`) are not treated as backend calls.
 */
export function isSitmunBackendApiUrl(url: string): boolean {
  return (
    url.startsWith(`${environment.apiUrl}/api/`) || url.startsWith('/api/')
  );
}
