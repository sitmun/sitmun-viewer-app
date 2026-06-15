import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg } from '@api/model/app-cfg';

import { LocatorControlHandler } from './locator-control.handler';
import { prototypeWrappers } from './locator-control.logic';
import { AppConfigService } from '../../services/app-config.service';
import { LocatorService } from '../../services/locator.service';
import { SitnaApiService } from '../../services/sitna-api.service';

describe('LocatorControlHandler', () => {
  let handler: LocatorControlHandler;
  let locatorService: LocatorService;
  let mockSitnaApi: jest.Mocked<SitnaApiService>;
  let mockAppConfigService: jest.Mocked<AppConfigService>;
  let mockTC: { control: Record<string, unknown> };
  let mockAppCfg: AppCfg;
  let originalConsoleWarn: typeof console.warn;

  beforeEach(() => {
    originalConsoleWarn = console.warn;
    console.warn = jest.fn();

    mockTC = { control: {} };
    mockSitnaApi = {
      getTC: jest.fn().mockReturnValue(mockTC),
      getSITNA: jest.fn().mockReturnValue({} as any),
      getTCProperty: jest.fn(),
      isReady: jest.fn().mockReturnValue(true)
    } as Partial<jest.Mocked<SitnaApiService>> as jest.Mocked<SitnaApiService>;

    mockAppConfigService = {
      getControlDefault: jest.fn().mockReturnValue({ div: 'tc-slot-locator' })
    } as Partial<
      jest.Mocked<AppConfigService>
    > as jest.Mocked<AppConfigService>;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        LocatorControlHandler,
        LocatorService,
        { provide: SitnaApiService, useValue: mockSitnaApi },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.inject(LocatorControlHandler);
    locatorService = TestBed.inject(LocatorService);

    mockAppCfg = {
      application: {
        id: 1,
        title: 'Test App',
        type: 'test',
        theme: 'default',
        srs: 'EPSG:25831',
        initialExtent: [0, 0, 100, 100],
        territoryCode: '08019'
      },
      backgrounds: [],
      groups: [],
      layers: [],
      services: [],
      tasks: [
        {
          id: 'task/41',
          name: 'Locator',
          'ui-control': 'sitmun.locator',
          parameters: { labelField: 'name' }
        }
      ],
      trees: []
    };

    (window as any).SITNA = {
      control: {
        Control: class MockControl {}
      }
    };
  });

  afterEach(() => {
    delete (window as any).SITNA;
    handler.cleanup();
    console.warn = originalConsoleWarn;
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  it('should inject prototypeWrappers via constructor', () => {
    expect((handler as any).prototypeWrappers).toBe(prototypeWrappers);
  });

  describe('controlIdentifier', () => {
    it('should use sitmun.locator', () => {
      expect(handler.controlIdentifier).toBe('sitmun.locator');
    });
  });

  describe('sitnaConfigKey', () => {
    it('should use locator config key', () => {
      expect(handler.sitnaConfigKey).toBe('locator');
    });
  });

  describe('applyBootstrap()', () => {
    it('registers the control shell and initializes LocatorService', async () => {
      const registerSpy = jest.spyOn(handler as any, 'registerCustomControl');
      const initializeSpy = jest.spyOn(locatorService, 'initialize');

      await handler.applyBootstrap(mockAppCfg);

      expect(registerSpy).toHaveBeenCalled();
      expect(initializeSpy).toHaveBeenCalledWith(mockAppCfg);
    });
  });
});
