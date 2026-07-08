import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';

import {
  URL_AUTH_LOGIN
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
  let router: { navigateByUrl: jest.Mock };
  let indexedDbRemove: jest.Mock;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    router = { navigateByUrl: jest.fn().mockResolvedValue(true) };
    indexedDbRemove = jest.fn();

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
            remove: indexedDbRemove
          }
        }
      ]
    });

    service = TestBed.inject(AuthenticationService);
    httpMock = TestBed.inject(HttpTestingController);
    sessionStorage.setItem(`${CustomAuthConfig.localStoragePrefix}_username`, 'tester');
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

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

  it('logout delegates to handleUnauthorizedSession', () => {
    const handleUnauthorizedSessionSpy = jest
      .spyOn(service, 'handleUnauthorizedSession')
      .mockImplementation(() => undefined);

    service.logout();

    expect(handleUnauthorizedSessionSpy).toHaveBeenCalledTimes(1);
  });

  it('handleUnauthorizedSession ignores duplicate calls while logout is in flight', () => {
    jest.spyOn(service, 'clearAuthentication').mockReturnValue(NEVER);

    service.handleUnauthorizedSession();
    service.handleUnauthorizedSession();

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
});
