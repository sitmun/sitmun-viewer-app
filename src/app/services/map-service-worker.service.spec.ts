import { TestBed } from '@angular/core/testing';

import { IndexedDbService } from '@auth/services/indexed-db.service';

import { MapServiceWorkerService } from './map-service-worker.service';
import { SitnaApiService } from './sitna-api.service';

function makeAppCfg(proxy?: string) {
  return { global: proxy ? { proxy } : {} } as any;
}

describe('MapServiceWorkerService', () => {
  let service: MapServiceWorkerService;
  let mockIndexedDb: jest.Mocked<IndexedDbService>;
  let proxificationPrototype: {
    _isServiceWorker: jest.Mock;
  };

  let mockServiceWorkerContainer: {
    ready: Promise<{ active: { postMessage: jest.Mock } | null }>;
    controller: ServiceWorker | null;
    addEventListener: jest.Mock;
  };

  beforeEach(() => {
    mockIndexedDb = {
      setConfig: jest.fn().mockResolvedValue(undefined)
    } as Partial<jest.Mocked<IndexedDbService>> as jest.Mocked<IndexedDbService>;

    mockServiceWorkerContainer = {
      ready: Promise.resolve({ active: { postMessage: jest.fn() } }),
      controller: {} as ServiceWorker,
      addEventListener: jest.fn()
    };
    proxificationPrototype = {
      _isServiceWorker: jest.fn(() => true)
    };

    Object.defineProperty(navigator, 'serviceWorker', {
      value: mockServiceWorkerContainer,
      configurable: true
    });

    TestBed.configureTestingModule({
      providers: [
        MapServiceWorkerService,
        { provide: IndexedDbService, useValue: mockIndexedDb },
        {
          provide: SitnaApiService,
          useValue: {
            getTC: () => ({
              tool: { Proxification: { prototype: proxificationPrototype } }
            })
          }
        }
      ]
    });

    service = TestBed.inject(MapServiceWorkerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('configureMiddleware()', () => {
    it('resolves immediately and warns when no proxy URL is configured', async () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      await expect(service.configureMiddleware(makeAppCfg())).resolves.toBeUndefined();
      expect(mockIndexedDb.setConfig).not.toHaveBeenCalled();
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('No proxy URL in configuration'));
    });

    it('resolves immediately and warns when serviceWorker is unavailable', async () => {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined,
        configurable: true
      });
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

      await expect(service.configureMiddleware(makeAppCfg('http://proxy.example.com'))).resolves.toBeUndefined();
      expect(mockIndexedDb.setConfig).not.toHaveBeenCalled();
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('Service Worker API unavailable'));
    });

    it('stores middleware_url through IndexedDbService.setConfig', async () => {
      await service.configureMiddleware(makeAppCfg('http://proxy.example.com'));
      expect(mockIndexedDb.setConfig).toHaveBeenCalledWith('middleware_url', 'http://proxy.example.com');
    });

    it('posts MIDDLEWARE_URL to the active SW registration', async () => {
      const postMessage = jest.fn();
      mockServiceWorkerContainer.ready = Promise.resolve({ active: { postMessage } });

      await service.configureMiddleware(makeAppCfg('http://proxy.example.com'));

      expect(postMessage).toHaveBeenCalledWith({
        type: 'MIDDLEWARE_URL',
        url: 'http://proxy.example.com'
      });
    });

    it('keeps HTTP middleware requests on HTTP when the worker controls the viewer', async () => {
      await service.configureMiddleware(
        makeAppCfg('http://localhost:9000/middleware/proxy')
      );

      expect(proxificationPrototype._isServiceWorker()).toBe(false);
    });

    it('retains SITNA service-worker handling for HTTPS middleware', async () => {
      await service.configureMiddleware(
        makeAppCfg('https://middleware.example/proxy')
      );

      expect(proxificationPrototype._isServiceWorker()).toBe(true);
    });

    it('does not throw when active registration is null', async () => {
      mockServiceWorkerContainer.ready = Promise.resolve({ active: null });

      await expect(service.configureMiddleware(makeAppCfg('http://proxy.example.com'))).resolves.toBeUndefined();
    });

    it('does not add a controllerchange listener when controller is already present', async () => {
      mockServiceWorkerContainer.controller = {} as ServiceWorker;

      await service.configureMiddleware(makeAppCfg('http://proxy.example.com'));

      expect(mockServiceWorkerContainer.addEventListener).not.toHaveBeenCalledWith(
        'controllerchange',
        expect.any(Function)
      );
    });

    it('adds a controllerchange listener with { once: true } when controller is absent', async () => {
      mockServiceWorkerContainer.controller = null;

      await service.configureMiddleware(makeAppCfg('http://proxy.example.com'));

      expect(mockServiceWorkerContainer.addEventListener).toHaveBeenCalledWith(
        'controllerchange',
        expect.any(Function),
        { once: true }
      );
    });

    it('does not stack controllerchange listeners on repeated calls when controller is absent', async () => {
      mockServiceWorkerContainer.controller = null;

      await service.configureMiddleware(makeAppCfg('http://proxy.example.com'));
      await service.configureMiddleware(makeAppCfg('http://proxy.example.com'));

      const controllerChangeCalls = mockServiceWorkerContainer.addEventListener.mock.calls.filter(
        ([event]) => event === 'controllerchange'
      );
      expect(controllerChangeCalls.length).toBe(1);
    });

    it('resolves even when setConfig rejects', async () => {
      mockIndexedDb.setConfig.mockRejectedValue(new Error('IDB error'));

      await expect(service.configureMiddleware(makeAppCfg('http://proxy.example.com'))).resolves.toBeUndefined();
    });

    it('resolves and warns when postMessage throws', async () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      mockServiceWorkerContainer.ready = Promise.resolve({
        active: {
          postMessage: jest.fn().mockImplementation(() => {
            throw new DOMException('DataCloneError');
          })
        }
      });

      await expect(service.configureMiddleware(makeAppCfg('http://proxy.example.com'))).resolves.toBeUndefined();
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send MIDDLEWARE_URL'),
        expect.any(DOMException)
      );
    });
  });
});
