import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { WFSQueryControlHandler } from './wfs-query-control.handler';
import { AppConfigService } from '../../services/app-config.service';
import { TCNamespaceService } from '../../services/tc-namespace.service';

describe('WFSQueryControlHandler', () => {
  let handler: WFSQueryControlHandler;
  let mockTCNamespace: jest.Mocked<TCNamespaceService>;
  let mockAppConfigService: jest.Mocked<AppConfigService>;
  let mockAppCfg: AppCfg;

  beforeEach(() => {
    mockTCNamespace = {
      waitForTC: jest.fn(),
      waitForTCProperty: jest.fn(),
      getTC: jest.fn(),
      isTCReady: jest.fn().mockReturnValue(true)
    } as Partial<
      jest.Mocked<TCNamespaceService>
    > as jest.Mocked<TCNamespaceService>;

    mockAppConfigService = {
      getControlDefault: jest.fn()
    } as Partial<
      jest.Mocked<AppConfigService>
    > as jest.Mocked<AppConfigService>;
    mockAppConfigService.getControlDefault.mockReturnValue(null);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        WFSQueryControlHandler,
        { provide: TCNamespaceService, useValue: mockTCNamespace },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.inject(WFSQueryControlHandler);

    mockAppCfg = {
      application: {
        id: 1,
        title: 'Test App',
        type: 'test',
        theme: 'default',
        srs: 'EPSG:25831',
        initialExtent: [0, 0, 100, 100]
      },
      backgrounds: [],
      groups: [],
      layers: [],
      services: [],
      tasks: [],
      trees: []
    };
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  describe('controlIdentifier', () => {
    it('should have correct control identifier', () => {
      expect(handler.controlIdentifier).toBe('sitna.WFSQuery');
    });
  });

  describe('sitnaConfigKey', () => {
    it('should have correct sitna config key', () => {
      expect(handler.sitnaConfigKey).toBe('WFSQuery');
    });
  });

  describe('requiredPatches', () => {
    it('should have no required patches', () => {
      expect(handler.requiredPatches).toBeUndefined();
    });
  });

  describe('buildConfiguration()', () => {
    it('should return boolean true to enable control when no parameters', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.WFSQuery',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBe(true);
    });

    it('should return options object when parameters are provided', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.WFSQuery',
        parameters: {
          styles: {
            polygon: {
              strokeColor: '#057f28',
              strokeWidth: 4
            }
          }
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).not.toBe(true);
      expect(config).toBeDefined();
      expect(config?.['styles']).toBeDefined();
      expect(config?.['styles']?.['polygon']?.strokeColor).toBe('#057f28');
    });

    it('should pass through styles option', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.WFSQuery',
        parameters: {
          styles: {
            point: {
              strokeColor: '#057f28'
            },
            line: {
              strokeColor: '#057f28',
              strokeWidth: 4
            },
            polygon: {
              strokeColor: '#057f28',
              strokeWidth: 4,
              fillColor: '#057f28',
              fillOpacity: 0.3
            }
          }
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.['styles']).toBeDefined();
      expect(config?.['styles']?.['point']?.strokeColor).toBe('#057f28');
      expect(config?.['styles']?.['line']?.strokeWidth).toBe(4);
      expect(config?.['styles']?.['polygon']?.fillOpacity).toBe(0.3);
    });

    it('should pass through highlightStyles option', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.WFSQuery',
        parameters: {
          highlightStyles: {
            polygon: {
              strokeColor: '#ff7f27',
              strokeWidth: 4,
              fillColor: '#ff7f27',
              fillOpacity: 0.3
            }
          }
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.['highlightStyles']).toBeDefined();
      expect(config?.['highlightStyles']?.['polygon']?.strokeColor).toBe(
        '#ff7f27'
      );
    });

    it('should pass through highLightStyles alias (legacy capital L)', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.WFSQuery',
        parameters: {
          highLightStyles: {
            line: {
              strokeColor: '#ff7f27',
              strokeWidth: 4
            }
          }
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.['highLightStyles']).toBeDefined();
      expect(config?.['highLightStyles']?.['line']?.strokeColor).toBe(
        '#ff7f27'
      );
    });

    it('should pass through both styles and highlightStyles together', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.WFSQuery',
        parameters: {
          styles: {
            polygon: {
              strokeColor: '#057f28',
              fillColor: '#057f28',
              fillOpacity: 0.3
            }
          },
          highlightStyles: {
            polygon: {
              strokeColor: '#ff7f27',
              fillColor: '#ff7f27',
              fillOpacity: 0.3
            }
          }
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.['styles']).toBeDefined();
      expect(config?.['highlightStyles']).toBeDefined();
      expect(config?.['styles']?.['polygon']?.strokeColor).toBe('#057f28');
      expect(config?.['highlightStyles']?.['polygon']?.strokeColor).toBe(
        '#ff7f27'
      );
    });
  });

  describe('isReady()', () => {
    it('should always return true (no patches)', () => {
      expect(handler.isReady()).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should handle full lifecycle with boolean mode', async () => {
      // Load patches (no-op for native control)
      await handler.loadPatches(mockAppCfg);

      // Should be ready immediately
      expect(handler.isReady()).toBe(true);

      // Build config with no parameters (boolean mode)
      const task: AppTasks = {
        'ui-control': 'sitna.WFSQuery',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);
      expect(config).toBe(true);
    });

    it('should handle full lifecycle with options object mode', async () => {
      // Load patches (no-op for native control)
      await handler.loadPatches(mockAppCfg);

      // Should be ready immediately
      expect(handler.isReady()).toBe(true);

      // Build config with parameters (options object mode)
      const task: AppTasks = {
        'ui-control': 'sitna.WFSQuery',
        parameters: {
          styles: {
            polygon: {
              strokeColor: '#057f28',
              fillColor: '#057f28',
              fillOpacity: 0.3
            }
          },
          highlightStyles: {
            polygon: {
              strokeColor: '#ff7f27',
              fillColor: '#ff7f27',
              fillOpacity: 0.3
            }
          }
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);
      expect(config).not.toBe(true);
      expect(config).toBeDefined();
      expect(config?.['styles']).toBeDefined();
      expect(config?.['highlightStyles']).toBeDefined();
    });
  });
});
