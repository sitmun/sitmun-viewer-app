import { environment } from 'src/environments/environment';

import { isSitmunBackendApiUrl } from './backend-api-url';

describe('isSitmunBackendApiUrl', () => {
  it('matches absolute backend API URLs', () => {
    expect(
      isSitmunBackendApiUrl(`${environment.apiUrl}/api/account`)
    ).toBe(true);
  });

  it('does not trust a relative API URL outside the configured backend base', () => {
    expect(isSitmunBackendApiUrl('/api/account')).toBe(false);
  });

  it('does not match asset paths that contain "api" in a folder name', () => {
    expect(isSitmunBackendApiUrl('assets/js/api-sitna/config.json')).toBe(
      false
    );
  });

  it('does not match backend host paths outside /api/', () => {
    expect(
      isSitmunBackendApiUrl(`${environment.apiUrl}/assets/config/app-config.json`)
    ).toBe(false);
  });

  it('does not match third-party URLs that happen to include /api/', () => {
    expect(isSitmunBackendApiUrl('https://example.com/api/public/data')).toBe(
      false
    );
  });

  it('does not match a lookalike host prefixed with the backend URL', () => {
    const backend = new URL(environment.apiUrl, globalThis.location.origin);
    expect(
      isSitmunBackendApiUrl(
        `${backend.protocol}//${backend.host}.attacker.example${backend.pathname}/api/account`
      )
    ).toBe(false);
  });

  it('does not match a sibling path sharing the backend prefix', () => {
    expect(
      isSitmunBackendApiUrl(`${environment.apiUrl}-malicious/api/account`)
    ).toBe(false);
  });
});
