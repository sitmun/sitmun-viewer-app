import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppConfigService, AppConfig } from './app-config.service';

describe('AppConfigService', () => {
  let service: AppConfigService;
  let httpMock: HttpTestingController;

  const mockConfig: AppConfig = {
    dashboard: {
      allowedTypes: ['I', 'E'],
      filteringEnabled: true
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AppConfigService]
    });
    service = TestBed.inject(AppConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadConfig', () => {
    it('should load configuration from JSON file', async () => {
      const loadPromise = service.loadConfig();

      const req = httpMock.expectOne('assets/config/app-config.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockConfig);

      await loadPromise;

      expect(service.getAllowedTypes()).toEqual(['I', 'E']);
      expect(service.isFilteringEnabled()).toBe(true);
    });

    it('should use default config when loading fails', async () => {
      const consoleWarnSpy = spyOn(console, 'warn');

      const loadPromise = service.loadConfig();

      const req = httpMock.expectOne('assets/config/app-config.json');
      req.error(new ProgressEvent('error'));

      await loadPromise;

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(service.getAllowedTypes()).toEqual([]);
      expect(service.isFilteringEnabled()).toBe(false);
    });

    it('should cache configuration after loading', async () => {
      const loadPromise = service.loadConfig();

      const req = httpMock.expectOne('assets/config/app-config.json');
      req.flush(mockConfig);

      await loadPromise;

      expect(service.getAllowedTypes()).toEqual(['I', 'E']);
      expect(service.isFilteringEnabled()).toBe(true);

      // No new HTTP request should be made
      httpMock.expectNone('assets/config/app-config.json');
    });
  });

  describe('getAllowedTypes', () => {
    it('should return allowed types from config', async () => {
      const loadPromise = service.loadConfig();

      const req = httpMock.expectOne('assets/config/app-config.json');
      req.flush(mockConfig);

      await loadPromise;

      expect(service.getAllowedTypes()).toEqual(['I', 'E']);
    });

    it('should return empty array if config not loaded', () => {
      expect(service.getAllowedTypes()).toEqual([]);
    });

    it('should return empty array when allowedTypes is empty', async () => {
      const emptyTypesConfig: AppConfig = {
        dashboard: {
          allowedTypes: [],
          filteringEnabled: false
        }
      };

      const loadPromise = service.loadConfig();

      const req = httpMock.expectOne('assets/config/app-config.json');
      req.flush(emptyTypesConfig);

      await loadPromise;

      expect(service.getAllowedTypes()).toEqual([]);
    });
  });

  describe('isFilteringEnabled', () => {
    it('should return true when filtering is enabled in config', async () => {
      const loadPromise = service.loadConfig();

      const req = httpMock.expectOne('assets/config/app-config.json');
      req.flush(mockConfig);

      await loadPromise;

      expect(service.isFilteringEnabled()).toBe(true);
    });

    it('should return false when filtering is disabled in config', async () => {
      const disabledConfig: AppConfig = {
        dashboard: {
          allowedTypes: ['I'],
          filteringEnabled: false
        }
      };

      const loadPromise = service.loadConfig();

      const req = httpMock.expectOne('assets/config/app-config.json');
      req.flush(disabledConfig);

      await loadPromise;

      expect(service.isFilteringEnabled()).toBe(false);
    });

    it('should return false if config not loaded', () => {
      expect(service.isFilteringEnabled()).toBe(false);
    });
  });

  describe('getDashboardConfig', () => {
    it('should return dashboard config when loaded', async () => {
      const loadPromise = service.loadConfig();

      const req = httpMock.expectOne('assets/config/app-config.json');
      req.flush(mockConfig);

      await loadPromise;

      const dashboardConfig = service.getDashboardConfig();
      expect(dashboardConfig.allowedTypes).toEqual(['I', 'E']);
      expect(dashboardConfig.filteringEnabled).toBe(true);
    });

    it('should return default config when not loaded', () => {
      const dashboardConfig = service.getDashboardConfig();
      expect(dashboardConfig.allowedTypes).toEqual([]);
      expect(dashboardConfig.filteringEnabled).toBe(false);
    });
  });

  describe('getAttribution', () => {
    it('should return attribution when configured', async () => {
      const configWithAttribution: AppConfig = {
        ...mockConfig,
        attribution:
          '<a href="https://github.com/sitmun" target="_blank">SITMUN</a>'
      };

      const loadPromise = service.loadConfig();

      const req = httpMock.expectOne('assets/config/app-config.json');
      req.flush(configWithAttribution);

      await loadPromise;

      const attribution = service.getAttribution();
      expect(attribution).toBe(
        '<a href="https://github.com/sitmun" target="_blank">SITMUN</a>'
      );
    });

    it('should return null when attribution not configured', async () => {
      const loadPromise = service.loadConfig();

      const req = httpMock.expectOne('assets/config/app-config.json');
      req.flush(mockConfig);

      await loadPromise;

      const attribution = service.getAttribution();
      expect(attribution).toBeNull();
    });

    it('should return null if config not loaded', () => {
      const attribution = service.getAttribution();
      expect(attribution).toBeNull();
    });
  });
});
