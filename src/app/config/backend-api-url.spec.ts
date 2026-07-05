import { environment } from 'src/environments/environment';

import { isSitmunBackendApiUrl } from './backend-api-url';

describe('isSitmunBackendApiUrl', () => {
  it('matches absolute backend API URLs', () => {
    expect(
      isSitmunBackendApiUrl(`${environment.apiUrl}/api/account`)
    ).toBe(true);
  });

  it('matches same-origin relative backend API URLs', () => {
    expect(isSitmunBackendApiUrl('/api/account')).toBe(true);
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
});
