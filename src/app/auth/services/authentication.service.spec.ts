import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';

import {
  URL_API_USER_ACCOUNT,
  URL_AUTH_LOGIN,
  URL_AUTH_LOGOUT,
  URL_AUTH_PROXY
} from '@api/api-config';
import { AUTH_CONFIG_DI } from '@auth/authentication.options';
import { CustomAuthConfig, NavigationPath } from '@config/app.config';
import { TranslateModule } from '@ngx-translate/core';
import { NEVER } from 'rxjs';
import { environment } from 'src/environments/environment';

import { SUPPRESS_AUTH_REDIRECT_ON_401 } from './auth-http-context';
import { AuthenticationService } from './authentication.service';
import { IndexedDbService } from './indexed-db.service';
import { NotificationService } from '../../notifications/services/NotificationService';

describe('AuthenticationService (FS-03)', () => {
  let service: AuthenticationService<unknown>;
  let router: { navigate: jest.Mock; navigateByUrl: jest.Mock };
  let indexedDbRemove: jest.Mock;
  let indexedDbSet: jest.Mock;
  let httpMock: HttpTestingController;
  let notificationService: NotificationService;
  let messageListener: ((event: MessageEvent) => void) | undefined;
  let serviceWorkerController: object | null;

  beforeEach(() => {
    router = {
      navigate: jest.fn().mockResolvedValue(true),
      navigateByUrl: jest.fn().mockResolvedValue(true)
    };
    indexedDbRemove = jest.fn();
    indexedDbSet = jest.fn().mockResolvedValue(undefined);
    serviceWorkerController = {};
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        get controller() {
          return serviceWorkerController;
        },
        addEventListener: jest.fn(
          (type: string, listener: (event: MessageEvent) => void) => {
            if (type === 'message') {
              messageListener = listener;
            }
          }
        )
      }
    });

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthenticationService,
        NotificationService,
        { provide: AUTH_CONFIG_DI, useValue: CustomAuthConfig },
        { provide: Router, useValue: router },
        {
          provide: IndexedDbService,
          useValue: {
            init: jest.fn().mockResolvedValue(undefined),
            remove: indexedDbRemove,
            set: indexedDbSet
          }
        }
      ]
    });

    service = TestBed.inject(AuthenticationService);
    httpMock = TestBed.inject(HttpTestingController);
    notificationService = TestBed.inject(NotificationService);
    sessionStorage.setItem(`${CustomAuthConfig.localStoragePrefix}_username`, 'tester');
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  const postWorkerMessage = (
    type: string,
    source: object | null = serviceWorkerController
  ): void => {
    messageListener?.({
      source,
      data: { type }
    } as unknown as MessageEvent);
  };

  /** BUG-050: IndexedDB cleanup must finish before login redirect. */
  it('awaits clearSession before redirecting to login', fakeAsync(() => {
    let sessionCleared = false;
    indexedDbRemove.mockReturnValue(
      new Promise<void>((resolve) => {
        setTimeout(() => {
          sessionCleared = true;
          resolve();
        }, 20);
      })
    );

    service.clearSessionAndRedirectToLogin();

    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(sessionCleared).toBe(false);

    tick(20);

    expect(sessionCleared).toBe(true);
    expect(router.navigateByUrl).toHaveBeenCalledWith(NavigationPath.Auth.Login);
  }));

  it('logout delegates to explicitLogout', () => {
    const explicitLogoutSpy = jest
      .spyOn(service, 'explicitLogout')
      .mockImplementation(() => undefined);

    service.logout();

    expect(explicitLogoutSpy).toHaveBeenCalledTimes(1);
  });

  it('explicitLogout ignores duplicate calls while logout is in flight', () => {
    jest.spyOn(service, 'clearAuthentication').mockReturnValue(NEVER);

    service.explicitLogout();
    service.explicitLogout();

    expect(service.clearAuthentication).toHaveBeenCalledTimes(1);
  });

  it('login POST sets SUPPRESS_AUTH_REDIRECT_ON_401 on the HTTP context', () => {
    service
      .login({ username: 'user', password: 'secret' })
      .subscribe({ error: () => undefined });

    const loginReq = httpMock.expectOne(
      `${environment.apiUrl}${URL_AUTH_LOGIN}`
    );
    expect(loginReq.request.context.get(SUPPRESS_AUTH_REDIRECT_ON_401)).toBe(
      true
    );

    loginReq.flush(null, { status: 401, statusText: 'Unauthorized' });
  });

  it('coalesces passive 401 validation and preserves a valid session', () => {
    service.validateSessionAfterUnauthorized();
    service.validateSessionAfterUnauthorized();

    const probe = httpMock.expectOne(
      `${environment.apiUrl}${URL_API_USER_ACCOUNT}`
    );
    expect(probe.request.context.get(SUPPRESS_AUTH_REDIRECT_ON_401)).toBe(true);
    probe.flush({ username: 'tester' });

    expect(service.isLoggedIn()).toBe(true);
    expect(indexedDbRemove).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('clears only client state when passive 401 validation confirms expiry', fakeAsync(() => {
    indexedDbRemove.mockResolvedValue(undefined);

    service.validateSessionAfterUnauthorized();
    const probe = httpMock.expectOne(
      `${environment.apiUrl}${URL_API_USER_ACCOUNT}`
    );
    probe.flush(null, { status: 401, statusText: 'Unauthorized' });
    tick();

    expect(service.isLoggedIn()).toBe(false);
    expect(indexedDbRemove).toHaveBeenCalledWith('proxy_token');
    expect(router.navigate).toHaveBeenCalledWith(
      [NavigationPath.Auth.Login],
      { queryParams: { 'session-expired': 'true' } }
    );
    httpMock.expectNone(`${environment.apiUrl}${URL_AUTH_LOGOUT}`);
  }));

  it.each([403, 503])(
    'preserves the session when passive 401 validation returns %i',
    (status) => {
      service.validateSessionAfterUnauthorized();
      const probe = httpMock.expectOne(
        `${environment.apiUrl}${URL_API_USER_ACCOUNT}`
      );
      probe.flush(null, { status, statusText: 'Probe failed' });

      expect(service.isLoggedIn()).toBe(true);
      expect(indexedDbRemove).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    }
  );

  it('preserves the session when passive 401 validation has a network error', () => {
    service.validateSessionAfterUnauthorized();
    const probe = httpMock.expectOne(
      `${environment.apiUrl}${URL_API_USER_ACCOUNT}`
    );
    probe.error(new ProgressEvent('error'));

    expect(service.isLoggedIn()).toBe(true);
    expect(indexedDbRemove).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('refreshes the proxy token for a worker authentication message', () => {
    postWorkerMessage('PROXY_AUTH_REQUIRED');

    const refresh = httpMock.expectOne(
      `${environment.apiUrl}${URL_AUTH_PROXY}`
    );
    refresh.flush({ proxy_token: 'renewed-token' });

    expect(indexedDbSet).toHaveBeenCalledWith(
      'proxy_token',
      'renewed-token'
    );
  });

  it('coalesces duplicate worker authentication messages', () => {
    postWorkerMessage('PROXY_AUTH_REQUIRED');
    postWorkerMessage('PROXY_AUTH_REQUIRED');

    const refresh = httpMock.expectOne(
      `${environment.apiUrl}${URL_AUTH_PROXY}`
    );
    refresh.flush({ proxy_token: 'renewed-token' });

    httpMock.expectNone(`${environment.apiUrl}${URL_AUTH_PROXY}`);
    expect(indexedDbSet).toHaveBeenCalledTimes(1);
  });

  it('clears client state when the proxy refresh endpoint returns 401', fakeAsync(() => {
    indexedDbRemove.mockResolvedValue(undefined);

    postWorkerMessage('PROXY_AUTH_REQUIRED');
    const refresh = httpMock.expectOne(
      `${environment.apiUrl}${URL_AUTH_PROXY}`
    );
    refresh.flush(null, { status: 401, statusText: 'Unauthorized' });
    tick();

    expect(service.isLoggedIn()).toBe(false);
    expect(indexedDbRemove).toHaveBeenCalledWith('proxy_token');
    expect(router.navigate).toHaveBeenCalledWith(
      [NavigationPath.Auth.Login],
      { queryParams: { 'session-expired': 'true' } }
    );
    httpMock.expectNone(`${environment.apiUrl}${URL_AUTH_LOGOUT}`);
  }));

  it('ignores worker messages from a source other than the controller', () => {
    postWorkerMessage('PROXY_AUTH_REQUIRED', {});

    httpMock.expectNone(`${environment.apiUrl}${URL_AUTH_PROXY}`);
  });

  it('ignores worker messages when the page has no controller', () => {
    serviceWorkerController = null;

    postWorkerMessage('PROXY_AUTH_REQUIRED', {});

    httpMock.expectNone(`${environment.apiUrl}${URL_AUTH_PROXY}`);
  });

  it('does not refresh a proxy token while explicit logout is in flight', () => {
    indexedDbRemove.mockResolvedValue(undefined);
    service.logout();
    const logout = httpMock.expectOne(
      `${environment.apiUrl}${URL_AUTH_LOGOUT}`
    );

    postWorkerMessage('PROXY_AUTH_REQUIRED');

    httpMock.expectNone(`${environment.apiUrl}${URL_AUTH_PROXY}`);
    logout.flush(null);
  });

  it('ignores a late worker authentication message after client cleanup', () => {
    sessionStorage.clear();

    postWorkerMessage('PROXY_AUTH_REQUIRED');

    httpMock.expectNone(`${environment.apiUrl}${URL_AUTH_PROXY}`);
  });

  it('warns without refreshing when the worker reports proxy denial', () => {
    const warning = jest.spyOn(notificationService, 'warning');

    postWorkerMessage('PROXY_ACCESS_DENIED');

    httpMock.expectNone(`${environment.apiUrl}${URL_AUTH_PROXY}`);
    expect(warning).toHaveBeenCalledTimes(1);
  });

  it('deduplicates repeated proxy denial warnings', () => {
    const warning = jest.spyOn(notificationService, 'warning');

    postWorkerMessage('PROXY_ACCESS_DENIED');
    postWorkerMessage('PROXY_ACCESS_DENIED');

    expect(warning).toHaveBeenCalledTimes(1);
  });
});
