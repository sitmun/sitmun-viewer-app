import {
  HttpContext,
  HttpErrorResponse,
  HttpHandler,
  HttpRequest
, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { URL_AUTH_LOGIN, URL_AUTH_LOGOUT, URL_AUTH_PROXY, URL_API_USER_ACCOUNT } from '@api/api-config';
import { AUTH_CONFIG_DI } from '@auth/authentication.options';
import { CustomAuthConfig } from '@config/app.config';
import { TranslateModule } from '@ngx-translate/core';
import { NEVER, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

import { suppressAuthRedirectContext } from './auth-http-context';
import {
  AuthenticationInterceptor
} from './authentication.interceptor';
import { AuthenticationService } from './authentication.service';
import { IndexedDbService } from './indexed-db.service';
import { NotificationService } from '../../notifications/services/NotificationService';

describe('AuthenticationInterceptor (FS-03)', () => {
  let interceptor: AuthenticationInterceptor;
  let authService: AuthenticationService<unknown>;
  let clearAuthenticationSpy: jest.SpyInstance;
  let clearSessionAndRedirectToLoginSpy: jest.SpyInstance;
  let handleUnauthorizedSessionSpy: jest.SpyInstance;

  const apiUrl = (path: string) => `${environment.apiUrl}${path}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthenticationService,
        AuthenticationInterceptor,
        NotificationService,
        { provide: AUTH_CONFIG_DI, useValue: CustomAuthConfig },
        {
          provide: Router,
          useValue: { navigateByUrl: jest.fn().mockResolvedValue(true) }
        },
        {
          provide: IndexedDbService,
          useValue: {
            init: jest.fn().mockResolvedValue(undefined),
            remove: jest.fn().mockResolvedValue(undefined)
          }
        }
      ]
    });

    authService = TestBed.inject(AuthenticationService);
    interceptor = TestBed.inject(AuthenticationInterceptor);
    clearAuthenticationSpy = jest
      .spyOn(authService, 'clearAuthentication')
      .mockReturnValue(of(undefined));
    clearSessionAndRedirectToLoginSpy = jest.spyOn(
      authService,
      'clearSessionAndRedirectToLogin'
    );
    handleUnauthorizedSessionSpy = jest.spyOn(
      authService,
      'handleUnauthorizedSession'
    );
  });

  const intercept401 = (url: string, context = new HttpContext()): Promise<void> =>
    new Promise((resolve) => {
      const req = new HttpRequest('GET', url, { context });
      const next: HttpHandler = {
        handle: () =>
          throwError(() => new HttpErrorResponse({ status: 401, url }))
      };
      interceptor.intercept(req, next).subscribe({
        error: () => resolve()
      });
    });

  /** BUG-027: failed login must not trigger global logout. */
  it('does not call logout when login POST returns 401', async () => {
    await intercept401(apiUrl(URL_AUTH_LOGIN));

    expect(clearAuthenticationSpy).not.toHaveBeenCalled();
    expect(clearSessionAndRedirectToLoginSpy).not.toHaveBeenCalled();
  });

  it('calls handleUnauthorizedSession for a protected backend 401', async () => {
    await intercept401(apiUrl(URL_API_USER_ACCOUNT));

    expect(handleUnauthorizedSessionSpy).toHaveBeenCalledTimes(1);
  });

  /** BUG-051: concurrent 401s must not spawn parallel logout storms. */
  it('calls logout at most once when multiple protected requests return 401', async () => {
    clearAuthenticationSpy.mockReturnValue(NEVER);
    const accountUrl = apiUrl(URL_API_USER_ACCOUNT);

    await Promise.all([intercept401(accountUrl), intercept401(accountUrl)]);

    expect(clearAuthenticationSpy).toHaveBeenCalledTimes(1);
  });

  it('still clears session locally when logout endpoint returns 401', async () => {
    await intercept401(apiUrl(URL_AUTH_LOGOUT));

    expect(clearSessionAndRedirectToLoginSpy).toHaveBeenCalledTimes(1);
    expect(clearAuthenticationSpy).not.toHaveBeenCalled();
  });

  it('does not logout when a non-backend URL containing "api" returns 401', async () => {
    await intercept401('assets/js/api-sitna/config.json');

    expect(clearAuthenticationSpy).not.toHaveBeenCalled();
    expect(clearSessionAndRedirectToLoginSpy).not.toHaveBeenCalled();
    expect(handleUnauthorizedSessionSpy).not.toHaveBeenCalled();
  });

  it('does not logout when proxy refresh returns 401', async () => {
    await intercept401(apiUrl(URL_AUTH_PROXY));

    expect(handleUnauthorizedSessionSpy).not.toHaveBeenCalled();
    expect(clearAuthenticationSpy).not.toHaveBeenCalled();
    expect(clearSessionAndRedirectToLoginSpy).not.toHaveBeenCalled();
  });

  it('does not logout when SUPPRESS_AUTH_REDIRECT_ON_401 is set on the request', async () => {
    await intercept401(
      apiUrl(URL_API_USER_ACCOUNT),
      suppressAuthRedirectContext()
    );

    expect(handleUnauthorizedSessionSpy).not.toHaveBeenCalled();
    expect(clearAuthenticationSpy).not.toHaveBeenCalled();
  });
});
