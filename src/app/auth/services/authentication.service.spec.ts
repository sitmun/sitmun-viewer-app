import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';

import { URL_AUTH_PROXY } from '@api/api-config';
import { AUTH_CONFIG_DI } from '@auth/authentication.options';
import { CustomAuthConfig } from '@config/app.config';

import { AuthenticationService } from './authentication.service';
import { IndexedDbService } from './indexed-db.service';
import { environment } from '../../../environments/environment';


const PROXY_URL = environment.apiUrl + URL_AUTH_PROXY;

describe('AuthenticationService', () => {
  let service: AuthenticationService<unknown>;
  let httpMock: HttpTestingController;
  let mockIndexedDb: jest.Mocked<IndexedDbService>;
  let mockSWContainer: { addEventListener: jest.Mock };

  beforeEach(() => {
    jest.spyOn(console, 'debug').mockImplementation(() => {});

    mockIndexedDb = {
      init: jest.fn().mockResolvedValue(undefined),
      set: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined),
      setConfig: jest.fn().mockResolvedValue(undefined)
    } as Partial<jest.Mocked<IndexedDbService>> as jest.Mocked<IndexedDbService>;

    mockSWContainer = { addEventListener: jest.fn() };

    Object.defineProperty(navigator, 'serviceWorker', {
      value: mockSWContainer,
      configurable: true,
      writable: true
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthenticationService,
        { provide: Router, useValue: { navigateByUrl: jest.fn().mockResolvedValue(true) } },
        { provide: IndexedDbService, useValue: mockIndexedDb },
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
          imports: [HttpClientTestingModule],
          providers: [
            AuthenticationService,
            { provide: Router, useValue: { navigateByUrl: jest.fn() } },
            { provide: IndexedDbService, useValue: mockIndexedDb },
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
      httpMock.expectOne(PROXY_URL).error(new ErrorEvent('network'));
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
});
