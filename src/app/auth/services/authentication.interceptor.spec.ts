import {
  HttpContext,
  HttpErrorResponse,
  HttpHandler,
  HttpRequest
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { URL_AUTH_LOGOUT, URL_AUTH_PROXY } from '@api/api-config';
import { throwError } from 'rxjs';

import { AuthenticationInterceptor , SUPPRESS_AUTH_REDIRECT_ON_401 } from './authentication.interceptor';
import { AuthenticationService } from './authentication.service';

describe('AuthenticationInterceptor', () => {
  let interceptor: AuthenticationInterceptor;
  let authService: {
    clearSessionAndRedirectToLogin: jest.Mock;
    logout: jest.Mock;
  };

  beforeEach(() => {
    authService = {
      clearSessionAndRedirectToLogin: jest.fn(),
      logout: jest.fn()
    };
    TestBed.configureTestingModule({
      providers: [
        AuthenticationInterceptor,
        { provide: AuthenticationService, useValue: authService }
      ]
    });
    interceptor = TestBed.inject(AuthenticationInterceptor);
  });

  it('calls clearSessionAndRedirectToLogin on 401 when request URL includes logout path', (done) => {
    const next: HttpHandler = {
      handle: () =>
        throwError(
          () =>
            new HttpErrorResponse({
              status: 401,
              url: `https://example.test${URL_AUTH_LOGOUT}`
            })
        )
    };
    const req = new HttpRequest('GET', URL_AUTH_LOGOUT);
    interceptor.intercept(req, next).subscribe({
      error: () => {
        expect(authService.clearSessionAndRedirectToLogin).toHaveBeenCalled();
        expect(authService.logout).not.toHaveBeenCalled();
        done();
      }
    });
  });

  it('calls logout on 401 for requests that are not logout', (done) => {
    const next: HttpHandler = {
      handle: () =>
        throwError(
          () =>
            new HttpErrorResponse({
              status: 401,
              url: '/api/other'
            })
        )
    };
    const req = new HttpRequest('GET', '/api/other');
    interceptor.intercept(req, next).subscribe({
      error: () => {
        expect(authService.logout).toHaveBeenCalled();
        expect(authService.clearSessionAndRedirectToLogin).not.toHaveBeenCalled();
        done();
      }
    });
  });

  it('does not invoke session helpers on non-401 errors', (done) => {
    const next: HttpHandler = {
      handle: () =>
        throwError(
          () =>
            new HttpErrorResponse({
              status: 500,
              url: '/api/x'
            })
        )
    };
    const req = new HttpRequest('GET', '/api/x');
    interceptor.intercept(req, next).subscribe({
      error: () => {
        expect(authService.logout).not.toHaveBeenCalled();
        expect(authService.clearSessionAndRedirectToLogin).not.toHaveBeenCalled();
        done();
      }
    });
  });

  it('does not invoke session helpers on 401 from proxy refresh URL', (done) => {
    const next: HttpHandler = {
      handle: () =>
        throwError(
          () =>
            new HttpErrorResponse({
              status: 401,
              url: `https://example.test${URL_AUTH_PROXY}`
            })
        )
    };
    const req = new HttpRequest('GET', URL_AUTH_PROXY);
    interceptor.intercept(req, next).subscribe({
      error: () => {
        expect(authService.logout).not.toHaveBeenCalled();
        expect(authService.clearSessionAndRedirectToLogin).not.toHaveBeenCalled();
        done();
      }
    });
  });

  describe('SUPPRESS_AUTH_REDIRECT_ON_401 context token', () => {
    it('does not call clearSessionAndRedirectToLogin on logout 401 when context suppresses redirect', (done) => {
      const context = new HttpContext().set(SUPPRESS_AUTH_REDIRECT_ON_401, true);
      const next: HttpHandler = {
        handle: () =>
          throwError(
            () =>
              new HttpErrorResponse({
                status: 401,
                url: `https://example.test${URL_AUTH_LOGOUT}`
              })
          )
      };
      const req = new HttpRequest('POST', URL_AUTH_LOGOUT, null, { context });
      interceptor.intercept(req, next).subscribe({
        error: () => {
          expect(authService.clearSessionAndRedirectToLogin).not.toHaveBeenCalled();
          expect(authService.logout).not.toHaveBeenCalled();
          done();
        }
      });
    });

    it('does not call logout on non-logout 401 when context suppresses redirect', (done) => {
      const context = new HttpContext().set(SUPPRESS_AUTH_REDIRECT_ON_401, true);
      const next: HttpHandler = {
        handle: () =>
          throwError(
            () =>
              new HttpErrorResponse({
                status: 401,
                url: '/api/config'
              })
          )
      };
      const req = new HttpRequest('GET', '/api/config', null, { context });
      interceptor.intercept(req, next).subscribe({
        error: () => {
          expect(authService.logout).not.toHaveBeenCalled();
          expect(authService.clearSessionAndRedirectToLogin).not.toHaveBeenCalled();
          done();
        }
      });
    });

    it('still propagates the error when context suppresses redirect', (done) => {
      const context = new HttpContext().set(SUPPRESS_AUTH_REDIRECT_ON_401, true);
      const next: HttpHandler = {
        handle: () =>
          throwError(
            () =>
              new HttpErrorResponse({ status: 401, url: `https://example.test${URL_AUTH_LOGOUT}` })
          )
      };
      const req = new HttpRequest('POST', URL_AUTH_LOGOUT, null, { context });
      interceptor.intercept(req, next).subscribe({
        error: (err: unknown) => {
          expect(err).toBeInstanceOf(HttpErrorResponse);
          done();
        }
      });
    });
  });
});
