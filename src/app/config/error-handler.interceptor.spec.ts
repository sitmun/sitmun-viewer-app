import {
  HttpErrorResponse,
  HttpHandler,
  HttpHeaders,
  HttpRequest
} from '@angular/common/http';
import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { URL_API_USER_ACCOUNT } from '@api/api-config';
import { throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

import {
  ErrorHandlerInterceptor,
  setIgnoreErrors
} from './error-handler.interceptor';
import { MessageBoxService } from '../../util/message-box-service';
import { ErrorTrackingService } from '../services/error-tracking.service';

describe('ErrorHandlerInterceptor (FS-03)', () => {
  let interceptor: ErrorHandlerInterceptor;
  let addError: jest.Mock;
  let alert: jest.Mock;

  const apiUrl = `${environment.apiUrl}${URL_API_USER_ACCOUNT}`;

  beforeEach(() => {
    addError = jest.fn();
    alert = jest.fn().mockReturnValue({ subscribe: jest.fn() });

    TestBed.configureTestingModule({
      providers: [
        ErrorHandlerInterceptor,
        {
          provide: Injector,
          useValue: {
            get: (token: unknown) => {
              if (token === ErrorTrackingService) {
                return { addError };
              }
              if (token === MessageBoxService) {
                return { alert };
              }
              throw new Error(`Unexpected token: ${String(token)}`);
            }
          }
        }
      ]
    });

    interceptor = TestBed.inject(ErrorHandlerInterceptor);
  });

  const intercept500 = (): Promise<void> =>
    new Promise((resolve) => {
      const req = new HttpRequest('GET', apiUrl);
      const next: HttpHandler = {
        handle: () =>
          throwError(
            () =>
              new HttpErrorResponse({
                status: 500,
                url: apiUrl,
                error: { message: 'internal error' }
              })
          )
      };

      interceptor.intercept(req, next).subscribe({
        error: () => resolve()
      });
    });

  /** BUG-019: absolute backend API URLs must be handled, not skipped. */
  it('tracks errors for absolute backend API URLs', async () => {
    await intercept500();

    expect(addError).toHaveBeenCalledWith(
      'internal error',
      'http',
      expect.objectContaining({
        httpStatus: 500,
        url: apiUrl
      })
    );
    expect(alert).toHaveBeenCalled();
  });

  it('does not track asset requests', async () => {
    await new Promise<void>((resolve) => {
      const req = new HttpRequest('GET', '/assets/i18n/en.json');
      const next: HttpHandler = {
        handle: () =>
          throwError(
            () => new HttpErrorResponse({ status: 404, url: req.url })
          )
      };

      interceptor.intercept(req, next).subscribe({
        error: () => resolve()
      });
    });

    expect(addError).not.toHaveBeenCalled();
  });

  it('does not track paths that contain "api" outside the backend prefix', async () => {
    await new Promise<void>((resolve) => {
      const req = new HttpRequest('GET', 'assets/js/api-sitna/config.json');
      const next: HttpHandler = {
        handle: () =>
          throwError(
            () => new HttpErrorResponse({ status: 500, url: req.url })
          )
      };

      interceptor.intercept(req, next).subscribe({
        error: () => resolve()
      });
    });

    expect(addError).not.toHaveBeenCalled();
  });

  it('shows a validation alert for VALIDATION error responses', async () => {
    await new Promise<void>((resolve) => {
      const req = new HttpRequest('GET', apiUrl);
      const next: HttpHandler = {
        handle: () =>
          throwError(
            () =>
              new HttpErrorResponse({
                status: 400,
                url: apiUrl,
                error: {
                  message: 'VALIDATION',
                  errors: { 'create.name': 'must not be blank' }
                }
              })
          )
      };

      interceptor.intercept(req, next).subscribe({
        error: () => resolve()
      });
    });

    expect(addError).toHaveBeenCalled();
    expect(alert).toHaveBeenCalledWith(
      'An error has ocurred',
      expect.stringContaining('create.name')
    );
  });

  it('tracks errors but skips the alert when Api-Can-Fail is set', async () => {
    await new Promise<void>((resolve) => {
      const req = new HttpRequest('GET', apiUrl, {
        headers: setIgnoreErrors(new HttpHeaders())
      });
      const next: HttpHandler = {
        handle: () =>
          throwError(
            () =>
              new HttpErrorResponse({
                status: 500,
                url: apiUrl,
                error: { message: 'ignored failure' }
              })
          )
      };

      interceptor.intercept(req, next).subscribe({
        error: () => resolve()
      });
    });

    expect(addError).toHaveBeenCalledWith(
      'ignored failure',
      'http',
      expect.objectContaining({ httpStatus: 500, url: apiUrl })
    );
    expect(alert).not.toHaveBeenCalled();
  });
});
