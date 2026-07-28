import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpErrorResponse,
  HttpHandler,
  HttpHeaders,
  HttpRequest,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { URL_API_USER_ACCOUNT } from '@api/api-config';
import { AUTH_CONFIG_DI } from '@auth/authentication.options';
import { AuthenticationInterceptor } from '@auth/services/authentication.interceptor';
import { AuthenticationService } from '@auth/services/authentication.service';
import { IndexedDbService } from '@auth/services/indexed-db.service';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

import { CustomAuthConfig } from './app.config';
import {
  ErrorHandlerInterceptor,
  setIgnoreErrors
} from './error-handler.interceptor';
import { MessageBoxService } from '../../util/message-box-service';
import { NotificationService } from '../notifications/services/NotificationService';
import { ErrorTrackingService } from '../services/error-tracking.service';

describe('ErrorHandlerInterceptor', () => {
  const backendUrl = `${environment.apiUrl}/api/configuration`;
  let interceptor: ErrorHandlerInterceptor;
  let messageBoxService: { alert: jest.Mock };
  let notificationService: { warning: jest.Mock };
  let errorTrackingService: { addError: jest.Mock };

  beforeEach(() => {
    messageBoxService = { alert: jest.fn() };
    notificationService = { warning: jest.fn() };
    errorTrackingService = { addError: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        ErrorHandlerInterceptor,
        { provide: MessageBoxService, useValue: messageBoxService },
        { provide: NotificationService, useValue: notificationService },
        { provide: ErrorTrackingService, useValue: errorTrackingService },
        {
          provide: TranslateService,
          useValue: {
            instant: jest.fn((key: string) => `translated:${key}`)
          }
        }
      ]
    });

    interceptor = new ErrorHandlerInterceptor(TestBed.inject(Injector));
  });

  const interceptError = async (
    status: number,
    error: unknown = { message: `HTTP ${status}` }
  ): Promise<HttpErrorResponse> => {
    const response = new HttpErrorResponse({
      status,
      url: backendUrl,
      error
    });
    const next: HttpHandler = {
      handle: () => throwError(() => response)
    };

    try {
      await firstValueFrom(
        interceptor.intercept(new HttpRequest('GET', backendUrl), next)
      );
      throw new Error('Expected the HTTP request to fail');
    } catch (caught) {
      return caught as HttpErrorResponse;
    }
  };

  it('suppresses the generic message box for a trusted backend 401', async () => {
    const error = await interceptError(401);

    expect(error.status).toBe(401);
    expect(messageBoxService.alert).not.toHaveBeenCalled();
    expect(notificationService.warning).not.toHaveBeenCalled();
    expect(errorTrackingService.addError).toHaveBeenCalledTimes(1);
  });

  it('preserves error propagation and emits one translated warning for a backend 403', async () => {
    const error = await interceptError(403);

    expect(error.status).toBe(403);
    expect(notificationService.warning).toHaveBeenCalledTimes(1);
    expect(notificationService.warning).toHaveBeenCalledWith(
      'translated:auth.accessDenied'
    );
    expect(messageBoxService.alert).not.toHaveBeenCalled();
    expect(errorTrackingService.addError).toHaveBeenCalledTimes(1);
  });

  it('keeps validation error presentation and tracking', async () => {
    const error = await interceptError(400, {
      message: 'VALIDATION',
      errors: {
        'update.items[0].name': 'required'
      }
    });

    expect(error.status).toBe(400);
    expect(messageBoxService.alert).toHaveBeenCalledWith(
      'An error has ocurred',
      'Please check the following errors: <ul><li>create.items[].name</li></ul>'
    );
    expect(notificationService.warning).not.toHaveBeenCalled();
    expect(errorTrackingService.addError).toHaveBeenCalledTimes(1);
  });

  it.each([404, 500])(
    'keeps generic presentation, tracking, and propagation for HTTP %s',
    async (status) => {
      const error = await interceptError(status);

      expect(error.status).toBe(status);
      expect(messageBoxService.alert).toHaveBeenCalledTimes(1);
      expect(notificationService.warning).not.toHaveBeenCalled();
      expect(errorTrackingService.addError).toHaveBeenCalledTimes(1);
    }
  );

  it('does not track or present errors outside the trusted backend API', async () => {
    const url = 'assets/js/api-sitna/config.json';
    const response = new HttpErrorResponse({ status: 500, url });
    const next: HttpHandler = {
      handle: () => throwError(() => response)
    };

    await expect(
      firstValueFrom(interceptor.intercept(new HttpRequest('GET', url), next))
    ).rejects.toBe(response);

    expect(errorTrackingService.addError).not.toHaveBeenCalled();
    expect(messageBoxService.alert).not.toHaveBeenCalled();
    expect(notificationService.warning).not.toHaveBeenCalled();
  });

  it('does not duplicate middleware 403 presentation owned by PROXY_ACCESS_DENIED', async () => {
    const url =
      'https://maps.example/middleware/proxy/1/2/WMS/3?SERVICE=WMS&REQUEST=GetMap';
    const response = new HttpErrorResponse({ status: 403, url });
    const next: HttpHandler = {
      handle: () => throwError(() => response)
    };

    await expect(
      firstValueFrom(interceptor.intercept(new HttpRequest('GET', url), next))
    ).rejects.toBe(response);

    expect(notificationService.warning).not.toHaveBeenCalled();
    expect(messageBoxService.alert).not.toHaveBeenCalled();
  });

  it('tracks errors but skips presentation when Api-Can-Fail is set', async () => {
    const response = new HttpErrorResponse({
      status: 500,
      url: backendUrl,
      error: { message: 'ignored failure' }
    });
    const request = new HttpRequest('GET', backendUrl, {
      headers: setIgnoreErrors(new HttpHeaders())
    });
    const next: HttpHandler = {
      handle: () => throwError(() => response)
    };

    await expect(
      firstValueFrom(interceptor.intercept(request, next))
    ).rejects.toBe(response);

    expect(errorTrackingService.addError).toHaveBeenCalledTimes(1);
    expect(messageBoxService.alert).not.toHaveBeenCalled();
    expect(notificationService.warning).not.toHaveBeenCalled();
  });
});

describe('authentication and error presentation interceptor order', () => {
  const protectedUrl = `${environment.apiUrl}/api/configuration`;
  const accountUrl = `${environment.apiUrl}${URL_API_USER_ACCOUNT}`;
  let http: HttpClient;
  let httpTestingController: HttpTestingController;
  let messageBoxService: { alert: jest.Mock };

  beforeEach(() => {
    sessionStorage.setItem('sitmun_viewer_app_username', 'viewer');
    messageBoxService = { alert: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        AuthenticationService,
        NotificationService,
        ErrorTrackingService,
        { provide: AUTH_CONFIG_DI, useValue: CustomAuthConfig },
        {
          provide: Router,
          useValue: {
            navigate: jest.fn().mockResolvedValue(true),
            navigateByUrl: jest.fn().mockResolvedValue(true)
          }
        },
        {
          provide: IndexedDbService,
          useValue: {
            remove: jest.fn().mockResolvedValue(undefined),
            set: jest.fn().mockResolvedValue(undefined)
          }
        },
        {
          provide: TranslateService,
          useValue: {
            instant: jest.fn((key: string) => key),
            get: jest.fn((key: string) => throwError(() => key))
          }
        },
        { provide: MessageBoxService, useValue: messageBoxService },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthenticationInterceptor,
          multi: true
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ErrorHandlerInterceptor,
          multi: true
        }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    sessionStorage.clear();
    httpTestingController.verify();
  });

  it('keeps one coalesced account probe active while suppressing 401 presentation', () => {
    http.get(protectedUrl).subscribe({ error: () => undefined });
    http.get(protectedUrl).subscribe({ error: () => undefined });

    const protectedRequests = httpTestingController.match(protectedUrl);
    expect(protectedRequests).toHaveLength(2);

    protectedRequests[0].flush(null, {
      status: 401,
      statusText: 'Unauthorized'
    });
    protectedRequests[1].flush(null, {
      status: 401,
      statusText: 'Unauthorized'
    });

    const accountProbe = httpTestingController.expectOne(accountUrl);
    accountProbe.flush({ username: 'viewer' });

    expect(messageBoxService.alert).not.toHaveBeenCalled();
  });

  it('preserves the authenticated session when the backend returns 403', () => {
    http.get(protectedUrl).subscribe({ error: () => undefined });

    httpTestingController.expectOne(protectedUrl).flush(null, {
      status: 403,
      statusText: 'Forbidden'
    });

    expect(sessionStorage.getItem('sitmun_viewer_app_username')).toBe('viewer');
    expect(messageBoxService.alert).not.toHaveBeenCalled();
  });
});
