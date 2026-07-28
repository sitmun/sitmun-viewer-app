import { environment } from '../../environments/environment';

/**
 * True when {@link url} targets the configured SITMUN backend REST API.
 * Origin and API path are parsed so lookalike hosts and sibling paths are not
 * treated as authentication boundaries.
 */
export function isSitmunBackendApiUrl(url: string): boolean {
  try {
    const currentOrigin = globalThis.location.origin;
    const currentUrl = new URL(url, currentOrigin);
    const configuredBase = new URL(environment.apiUrl || '/', currentOrigin);
    const configuredApiPath = `${configuredBase.pathname.replace(
      /\/+$/,
      ''
    )}/api/`;

    return (
      currentUrl.origin === configuredBase.origin &&
      currentUrl.pathname.startsWith(configuredApiPath)
    );
  } catch {
    return false;
  }
}
