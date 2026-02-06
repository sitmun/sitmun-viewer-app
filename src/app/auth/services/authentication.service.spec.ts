import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import {
  URL_AUTH_LOGIN,
  URL_AUTH_METHODS,
  URL_OIDC_AUTH
} from '@api/api-config';
import {
  AUTH_CONFIG_DI,
  AUTH_TOKEN_MESSAGE_TYPE,
  OIDC_CLIENT_TYPE_QUERY_PARAM,
  OIDC_CLIENT_TYPE_VIEWER,
  OIDC_TOKEN_COOKIE
} from '@auth/authentication.options';
import { AuthenticationService } from '@auth/services/authentication.service';
import { CustomAuthConfig, NavigationPath, QueryParam } from '@config/app.config';
import { CookieService } from 'ngx-cookie-service';

import { environment } from '../../../environments/environment';

describe('AuthenticationService', () => {
  let service: AuthenticationService<unknown>;
  let httpMock: HttpTestingController;
  let router: Router;
  let cookieService: CookieService;
  let locationSpy: { href: string };
  let postMessageSpy: jest.Mock;

  beforeEach(() => {
    locationSpy = { href: '' };
    postMessageSpy = jest.fn();
    Object.defineProperty(globalThis, 'location', {
      value: locationSpy,
      writable: true
    });
    (globalThis.navigator as any).serviceWorker = {
      controller: { postMessage: postMessageSpy }
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthenticationService,
        CookieService,
        { provide: AUTH_CONFIG_DI, useValue: CustomAuthConfig },
        {
          provide: Router,
          useValue: { navigateByUrl: jest.fn().mockResolvedValue(true) }
        }
      ]
    });
    service = TestBed.inject(AuthenticationService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    cookieService = TestBed.inject(CookieService);
  });

  afterEach(() => {
    httpMock.verify();
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should POST to URL_AUTH_LOGIN and set token on success', () => {
      service.login({ username: 'u', password: 'p' }).subscribe();
      const req = httpMock.expectOne(environment.apiUrl + URL_AUTH_LOGIN);
      expect(req.request.method).toBe('POST');
      req.flush({ id_token: 'jwt123' });
      expect(localStorage.getItem(service.AUTH_TOKEN)).toBe('jwt123');
      expect(postMessageSpy).toHaveBeenCalledWith({
        type: AUTH_TOKEN_MESSAGE_TYPE,
        token: 'jwt123'
      });
    });
  });

  describe('loginRedirect', () => {
    it('should navigate to redirect URL when query param is present', () => {
      const navSpy = jest.spyOn(router, 'navigateByUrl');
      const route = {
        snapshot: {
          queryParams: {
            [QueryParam.Login.RedirectAfterLogin]: '/target'
          }
        }
      } as unknown as ActivatedRoute;
      service.loginRedirect(route);
      expect(navSpy).toHaveBeenCalledWith('/target');
    });

    it('should navigate to dashboard when no redirect param and getLoggedDetails throws', () => {
      const navSpy = jest.spyOn(router, 'navigateByUrl');
      const route = {
        snapshot: { queryParams: {} }
      } as unknown as ActivatedRoute;
      service.loginRedirect(route);
      expect(navSpy).toHaveBeenCalledWith(
        NavigationPath.Section.User.Dashboard
      );
    });
  });

  describe('logout', () => {
    it('should clear storage, delete OIDC cookie and navigate to login', () => {
      localStorage.setItem(service.AUTH_TOKEN, 't');
      localStorage.setItem(service.AUTH_DETAILS, '{}');
      const deleteSpy = jest.spyOn(cookieService, 'delete');
      const navSpy = jest.spyOn(router, 'navigateByUrl');
      service.logout();
      expect(localStorage.getItem(service.AUTH_TOKEN)).toBeNull();
      expect(localStorage.getItem(service.AUTH_DETAILS)).toBeNull();
      expect(deleteSpy).toHaveBeenCalledWith(OIDC_TOKEN_COOKIE);
      expect(navSpy).toHaveBeenCalledWith(CustomAuthConfig.routes.loginPath);
    });
  });

  describe('getAuthMethods', () => {
    it('should GET enabled-methods URL', () => {
      service.getAuthMethods().subscribe((body) => {
        expect(body).toEqual([]);
      });
      const req = httpMock.expectOne(environment.apiUrl + URL_AUTH_METHODS);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('initOidcAuth', () => {
    it('should set location.href with providerId and OIDC constants', () => {
      service.initOidcAuth('google');
      const expectedUrl = `${environment.apiUrl}${URL_OIDC_AUTH}/google?${OIDC_CLIENT_TYPE_QUERY_PARAM}=${OIDC_CLIENT_TYPE_VIEWER}`;
      expect(locationSpy.href).toBe(expectedUrl);
    });
  });

  describe('authorizeOidcUser', () => {
    it('should set token in localStorage and postMessage to ServiceWorker', () => {
      service.authorizeOidcUser('oidc-jwt');
      expect(localStorage.getItem(service.AUTH_TOKEN)).toBe('oidc-jwt');
      expect(postMessageSpy).toHaveBeenCalledWith({
        type: AUTH_TOKEN_MESSAGE_TYPE,
        token: 'oidc-jwt'
      });
    });
  });

  describe('getToken/setToken ServiceWorker communication', () => {
    it('getToken should postMessage with AUTH_TOKEN_MESSAGE_TYPE when ServiceWorker exists', () => {
      localStorage.setItem(service.AUTH_TOKEN, 'stored-token');
      service.isLoggedIn();
      expect(postMessageSpy).toHaveBeenCalledWith({
        type: AUTH_TOKEN_MESSAGE_TYPE,
        token: 'stored-token'
      });
    });
  });
});
