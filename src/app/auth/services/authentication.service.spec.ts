import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController
} from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';

import { URL_AUTH_LOGOUT, URL_AUTH_PROXY } from '@api/api-config';
import { AUTH_CONFIG_DI } from '@auth/authentication.options';
import { CustomAuthConfig } from '@config/app.config';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AuthenticationService } from './authentication.service';
import { IndexedDbService } from './indexed-db.service';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../notifications/services/NotificationService';

const PROXY_URL = environment.apiUrl + URL_AUTH_PROXY;
const LOGOUT_URL = environment.apiUrl + URL_AUTH_LOGOUT;
const USERNAME_KEY = 'sitmun_viewer_app_username';

describe('AuthenticationService', () => {
  let service: AuthenticationService<unknown>;
  let httpMock: HttpTestingController;
  let mockIndexedDb: jest.Mocked<IndexedDbService>;
  let mockRouter: { navigateByUrl: jest.Mock; navigate: jest.Mock };
  let mockSWContainer: { addEventListener: jest.Mock };
  let mockNotification: jest.Mocked<Pick<NotificationService, 'warning' | 'error'>>;
  let mockTranslate: { get: jest.Mock };

  beforeEach(() => {
    jest.spyOn(console, 'debug').mockImplementation(() => {});

    mockIndexedDb = {
      init: jest.fn().mockResolvedValue(undefined),
      set: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined),
      setConfig: jest.fn().mockResolvedValue(undefined)
    } as Partial<jest.Mocked<IndexedDbService>> as jest.Mocked<IndexedDbService>;

    mockRouter = {
      navigateByUrl: jest.fn().mockResolvedValue(true),
      navigate: jest.fn().mockResolvedValue(true)
    };

    mockNotification = {
      warning: jest.fn(),
      error: jest.fn()
    };

    mockTranslate = {
      get: jest.fn().mockImplementation((key: string) => of(key))
    };

    mockSWContainer = { addEventListener: jest.fn() };

    Object.defineProperty(navigator, 'serviceWorker', {
      value: mockSWContainer,
      configurable: true,
      writable: true
    });

    TestBed.configureTestingModule({
            providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthenticationService,
        { provide: Router, useValue: mockRouter },
        { provide: IndexedDbService, useValue: mockIndexedDb },
        { provide: NotificationService, useValue: mockNotification },
        { provide: TranslateService, useValue: mockTranslate },
        { provide: AUTH_CONFIG_DI, useValue: CustomAuthConfig }
      ]
    });

    service = TestBed.inject(AuthenticationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setupServiceWorkerListener', () => {
    it('registers a message listener on navigator.serviceWorker', () => {
      expect(mockSWContainer.addEventListener).toHaveBeenCalledWith(
        'message',
        expect.any(Function)
      );
    });

    it('does not throw when serviceWorker is null (e.g. private browsing)', () => {
      // Simulate navigator.serviceWorker present as property but null at runtime
      Object.defineProperty(navigator, 'serviceWorker', {
        value: null,
        configurable: true,
        writable: true
      });

      expect(() => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
                    providers: [
            provideHttpClient(),
            provideHttpClientTesting(),
            AuthenticationService,
            { provide: Router, useValue: { navigateByUrl: jest.fn(), navigate: jest.fn() } },
            { provide: IndexedDbService, useValue: mockIndexedDb },
            { provide: NotificationService, useValue: mockNotification },
            { provide: TranslateService, useValue: mockTranslate },
            { provide: AUTH_CONFIG_DI, useValue: CustomAuthConfig }
          ]
        });
        TestBed.inject(AuthenticationService);
      }).not.toThrow();

      // Restore for subsequent tests
      Object.defineProperty(navigator, 'serviceWorker', {
        value: mockSWContainer,
        configurable: true,
        writable: true
      });
    });
  });

  describe('AUTH_ERROR → refreshProxyToken', () => {
    function getSwMessageHandler(): (event: MessageEvent) => void {
      const call = mockSWContainer.addEventListener.mock.calls.find(
        ([event]) => event === 'message'
      );
      return call![1] as (event: MessageEvent) => void;
    }

    function dispatchAuthError(): void {
      const handler = getSwMessageHandler();
      handler({ data: { type: 'AUTH_ERROR', timestamp: Date.now() } } as MessageEvent);
    }

    it('calls URL_AUTH_PROXY once when AUTH_ERROR is received', fakeAsync(() => {
      dispatchAuthError();
      tick();

      const req = httpMock.expectOne(PROXY_URL);
      expect(req.request.method).toBe('POST');
      req.flush({ proxy_token: 'new-token' });
      tick();
    }));

    it('persists the new proxy_token via IndexedDbService.set on success', fakeAsync(() => {
      dispatchAuthError();
      tick();

      const req = httpMock.expectOne(PROXY_URL);
      req.flush({ proxy_token: 'refreshed-token' });
      tick();

      expect(mockIndexedDb.set).toHaveBeenCalledWith('proxy_token', 'refreshed-token');
    }));

    it('does not make a second HTTP request when refresh is already in flight', fakeAsync(() => {
      dispatchAuthError();
      tick();
      // First request is in flight — second AUTH_ERROR should be a no-op
      dispatchAuthError();
      tick();

      const requests = httpMock.match(PROXY_URL);
      expect(requests.length).toBe(1);
      requests[0].flush({ proxy_token: 'token' });
      tick();
    }));

    it('clears the in-flight flag after a successful refresh so a later AUTH_ERROR can retry', fakeAsync(() => {
      dispatchAuthError();
      tick();
      httpMock.expectOne(PROXY_URL).flush({ proxy_token: 'token-1' });
      tick();

      // Flag is now cleared — a new AUTH_ERROR should trigger a fresh request
      dispatchAuthError();
      tick();
      const req = httpMock.expectOne(PROXY_URL);
      req.flush({ proxy_token: 'token-2' });
      tick();

      expect(mockIndexedDb.set).toHaveBeenLastCalledWith('proxy_token', 'token-2');
    }));

    it('clears the in-flight flag after a failed refresh so a later AUTH_ERROR can retry', fakeAsync(() => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

      dispatchAuthError();
      tick();
      httpMock.expectOne(PROXY_URL).error(new ProgressEvent('network'));
      tick();

      expect(warn).toHaveBeenCalledWith(
        '[Auth] Error refreshing proxy token:',
        expect.any(Object)
      );

      // Flag should be cleared after error — next AUTH_ERROR should produce a new request
      dispatchAuthError();
      tick();
      const req = httpMock.expectOne(PROXY_URL);
      req.flush({ proxy_token: 'token-after-error' });
      tick();

      expect(mockIndexedDb.set).toHaveBeenCalledWith('proxy_token', 'token-after-error');
    }));

    it('does not persist a token when response has no proxy_token field', fakeAsync(() => {
      dispatchAuthError();
      tick();
      httpMock.expectOne(PROXY_URL).flush({});
      tick();

      expect(mockIndexedDb.set).not.toHaveBeenCalled();
    }));

    it('clears the in-flight flag when IndexedDbService.set rejects', fakeAsync(() => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      mockIndexedDb.set.mockRejectedValue(new Error('IDB write failed'));

      dispatchAuthError();
      tick();
      httpMock.expectOne(PROXY_URL).flush({ proxy_token: 'token' });
      tick();

      expect(warn).toHaveBeenCalledWith(
        '[Auth] Error refreshing proxy token:',
        expect.objectContaining({ message: 'IDB write failed' })
      );

      // Flag must be cleared so a later AUTH_ERROR can retry
      dispatchAuthError();
      tick();
      const req = httpMock.expectOne(PROXY_URL);
      req.flush({ proxy_token: 'token-2' });
      tick();

      expect(mockIndexedDb.set).toHaveBeenLastCalledWith('proxy_token', 'token-2');
    }));
  });

  describe('refreshProxyToken - status-specific error handling', () => {
    function getSwMessageHandler(): (event: MessageEvent) => void {
      const call = mockSWContainer.addEventListener.mock.calls.find(
        ([event]) => event === 'message'
      );
      return call![1] as (event: MessageEvent) => void;
    }

    function dispatchAuthError(): void {
      const handler = getSwMessageHandler();
      handler({ data: { type: 'AUTH_ERROR', timestamp: Date.now() } } as MessageEvent);
    }

    beforeEach(() => {
      sessionStorage.setItem(USERNAME_KEY, 'testuser');
    });

    afterEach(() => {
      sessionStorage.removeItem(USERNAME_KEY);
    });

    it('clears session and redirects to login with session-expired when proxy refresh returns 401', fakeAsync(() => {
      dispatchAuthError();
      tick();

      httpMock
        .expectOne(PROXY_URL)
        .flush({}, { status: 401, statusText: 'Unauthorized' });
      tick();

      expect(sessionStorage.getItem(USERNAME_KEY)).toBeNull();
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [CustomAuthConfig.routes.loginPath],
        { queryParams: { 'session-expired': 'true' } }
      );
    }));

    it('does not clear session when proxy refresh returns 403', fakeAsync(() => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});

      dispatchAuthError();
      tick();

      httpMock
        .expectOne(PROXY_URL)
        .flush({}, { status: 403, statusText: 'Forbidden' });
      tick();

      expect(sessionStorage.getItem(USERNAME_KEY)).toBe('testuser');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    }));

    it('does not clear session when proxy refresh returns 5xx', fakeAsync(() => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      dispatchAuthError();
      tick();

      httpMock
        .expectOne(PROXY_URL)
        .flush({}, { status: 500, statusText: 'Internal Server Error' });
      tick();

      expect(sessionStorage.getItem(USERNAME_KEY)).toBe('testuser');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    }));

    it('does not clear session on network error', fakeAsync(() => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      dispatchAuthError();
      tick();

      httpMock.expectOne(PROXY_URL).error(new ProgressEvent('network'));
      tick();

      expect(sessionStorage.getItem(USERNAME_KEY)).toBe('testuser');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    }));

    it('shows a warning notification on 403', fakeAsync(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});

      dispatchAuthError();
      tick();

      httpMock
        .expectOne(PROXY_URL)
        .flush({}, { status: 403, statusText: 'Forbidden' });
      tick();

      expect(mockNotification.warning).toHaveBeenCalledWith(
        'auth.proxyForbidden',
        8000
      );
    }));

    it('shows the 403 notification only once across multiple 403 responses', fakeAsync(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});

      for (let i = 0; i < 3; i++) {
        dispatchAuthError();
        tick();
        httpMock
          .expectOne(PROXY_URL)
          .flush({}, { status: 403, statusText: 'Forbidden' });
        tick();
      }

      expect(mockNotification.warning).toHaveBeenCalledTimes(1);
    }));

    it('shows a warning notification after 3 consecutive non-401 errors', fakeAsync(() => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      for (let i = 0; i < 3; i++) {
        dispatchAuthError();
        tick();
        httpMock.expectOne(PROXY_URL).error(new ProgressEvent('network'));
        tick();
      }

      expect(mockNotification.warning).toHaveBeenCalledWith(
        'auth.proxyUnavailable',
        8000
      );
      expect(mockNotification.warning).toHaveBeenCalledTimes(1);
    }));

    it('does not show a warning notification before the 3rd consecutive error', fakeAsync(() => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      for (let i = 0; i < 2; i++) {
        dispatchAuthError();
        tick();
        httpMock.expectOne(PROXY_URL).error(new ProgressEvent('network'));
        tick();
      }

      expect(mockNotification.warning).not.toHaveBeenCalled();
    }));

    it('resets the consecutive error counter on a successful refresh', fakeAsync(() => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      // Two failures
      for (let i = 0; i < 2; i++) {
        dispatchAuthError();
        tick();
        httpMock.expectOne(PROXY_URL).error(new ProgressEvent('network'));
        tick();
      }

      // Recovery
      dispatchAuthError();
      tick();
      httpMock.expectOne(PROXY_URL).flush({ proxy_token: 'ok' });
      tick();

      // Two more failures — counter reset so notification should not fire yet
      for (let i = 0; i < 2; i++) {
        dispatchAuthError();
        tick();
        httpMock.expectOne(PROXY_URL).error(new ProgressEvent('network'));
        tick();
      }

      expect(mockNotification.warning).not.toHaveBeenCalled();
    }));
  });

  describe('clearAuthentication', () => {
    beforeEach(() => {
      sessionStorage.setItem(USERNAME_KEY, 'testuser');
    });

    afterEach(() => {
      sessionStorage.removeItem(USERNAME_KEY);
    });

    it('sends POST to the logout URL', fakeAsync(() => {
      let completed = false;
      service.clearAuthentication().subscribe({ complete: () => { completed = true; } });
      tick();

      const req = httpMock.expectOne(LOGOUT_URL);
      expect(req.request.method).toBe('POST');
      req.flush(null);
      tick();

      expect(completed).toBe(true);
    }));

    it('clears sessionStorage username after successful logout', fakeAsync(() => {
      service.clearAuthentication().subscribe();
      tick();
      httpMock.expectOne(LOGOUT_URL).flush(null);
      tick();

      expect(sessionStorage.getItem(USERNAME_KEY)).toBeNull();
    }));

    it('removes proxy_token from IndexedDbService after successful logout', fakeAsync(() => {
      service.clearAuthentication().subscribe();
      tick();
      httpMock.expectOne(LOGOUT_URL).flush(null);
      tick();

      expect(mockIndexedDb.remove).toHaveBeenCalledWith('proxy_token');
    }));

    it('does not navigate to login after successful logout', fakeAsync(() => {
      service.clearAuthentication().subscribe();
      tick();
      httpMock.expectOne(LOGOUT_URL).flush(null);
      tick();

      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    }));

    it('still clears local state when backend logout returns 4xx', fakeAsync(() => {
      let capturedError: unknown;
      service.clearAuthentication().subscribe({
        error: (err: unknown) => { capturedError = err; }
      });
      tick();
      httpMock.expectOne(LOGOUT_URL).flush(null, { status: 403, statusText: 'Forbidden' });
      tick();

      expect(sessionStorage.getItem(USERNAME_KEY)).toBeNull();
      expect(mockIndexedDb.remove).toHaveBeenCalledWith('proxy_token');
      expect(capturedError).toBeDefined();
    }));

    it('still clears local state when backend logout returns 5xx', fakeAsync(() => {
      let capturedError: unknown;
      service.clearAuthentication().subscribe({
        error: (err: unknown) => { capturedError = err; }
      });
      tick();
      httpMock.expectOne(LOGOUT_URL).flush(null, { status: 500, statusText: 'Internal Server Error' });
      tick();

      expect(sessionStorage.getItem(USERNAME_KEY)).toBeNull();
      expect(mockIndexedDb.remove).toHaveBeenCalledWith('proxy_token');
      expect(capturedError).toBeDefined();
    }));

    it('still clears local state on network error and emits the error', fakeAsync(() => {
      let capturedError: unknown;
      service.clearAuthentication().subscribe({
        error: (err: unknown) => { capturedError = err; }
      });
      tick();
      httpMock.expectOne(LOGOUT_URL).error(new ProgressEvent('network'));
      tick();

      expect(sessionStorage.getItem(USERNAME_KEY)).toBeNull();
      expect(mockIndexedDb.remove).toHaveBeenCalledWith('proxy_token');
      expect(capturedError).toBeDefined();
    }));

    it('completes only after IndexedDB proxy_token removal has resolved', fakeAsync(() => {
      let removeResolve!: () => void;
      mockIndexedDb.remove.mockReturnValue(new Promise<void>(res => { removeResolve = res; }));

      let completed = false;
      service.clearAuthentication().subscribe({ complete: () => { completed = true; } });
      tick();
      httpMock.expectOne(LOGOUT_URL).flush(null);
      tick();

      expect(completed).toBe(false);

      removeResolve();
      tick();

      expect(completed).toBe(true);
    }));
  });

  describe('logout', () => {
    beforeEach(() => {
      sessionStorage.setItem(USERNAME_KEY, 'testuser');
    });

    afterEach(() => {
      sessionStorage.removeItem(USERNAME_KEY);
    });

    it('sends POST to the logout URL', fakeAsync(() => {
      service.logout();
      tick();

      const req = httpMock.expectOne(LOGOUT_URL);
      expect(req.request.method).toBe('POST');
      req.flush(null);
      tick();
    }));

    it('navigates to loginPath after successful logout', fakeAsync(() => {
      service.logout();
      tick();
      httpMock.expectOne(LOGOUT_URL).flush(null);
      tick();

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(
        CustomAuthConfig.routes.loginPath
      );
    }));

    it('clears sessionStorage on successful logout', fakeAsync(() => {
      service.logout();
      tick();
      httpMock.expectOne(LOGOUT_URL).flush(null);
      tick();

      expect(sessionStorage.getItem(USERNAME_KEY)).toBeNull();
    }));

    it('shows error notification and does not navigate when clearAuthentication fails', fakeAsync(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      service.logout();
      tick();
      httpMock.expectOne(LOGOUT_URL).flush(null, { status: 500, statusText: 'Internal Server Error' });
      tick();

      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
      expect(mockNotification.error).toHaveBeenCalled();
    }));
  });
});
