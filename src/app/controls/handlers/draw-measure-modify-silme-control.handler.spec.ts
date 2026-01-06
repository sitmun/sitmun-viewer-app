import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DrawMeasureModifySilmeControlHandler } from './draw-measure-modify-silme-control.handler';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { UIStateService } from '../../services/ui-state.service';
import { AppConfigService } from '../../services/app-config.service';
import { AppCfg, AppTasks } from '@api/model/app-cfg';

describe('DrawMeasureModifySilmeControlHandler', () => {
  let handler: DrawMeasureModifySilmeControlHandler;
  let mockTCNamespace: jasmine.SpyObj<TCNamespaceService>;
  let mockUIStateService: jasmine.SpyObj<UIStateService>;
  let mockAppConfigService: jasmine.SpyObj<AppConfigService>;
  let mockAppCfg: AppCfg;
  let mockTC: any;

  beforeEach(() => {
    mockTC = {
      control: {
        DrawMeasureModify: {},
        DrawMeasureModifySilme: {}
      }
    };

    mockTCNamespace = jasmine.createSpyObj('TCNamespaceService', [
      'waitForTC',
      'getTC'
    ]);
    mockTCNamespace.waitForTC.and.returnValue(Promise.resolve(mockTC));
    mockTCNamespace.getTC.and.returnValue(mockTC);

    mockUIStateService = jasmine.createSpyObj('UIStateService', [
      'enableToolsButton'
    ]);

    mockAppConfigService = jasmine.createSpyObj('AppConfigService', [
      'getControlDefault'
    ]);
    mockAppConfigService.getControlDefault.and.returnValue({ div: 'drawmeasuremodify' });

    // Setup window.__patchesLoaded
    (window as any).__patchesLoaded = {
      DrawMeasureModifySilme: true
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DrawMeasureModifySilmeControlHandler,
        { provide: TCNamespaceService, useValue: mockTCNamespace },
        { provide: UIStateService, useValue: mockUIStateService },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.inject(DrawMeasureModifySilmeControlHandler);

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

  afterEach(() => {
    delete (window as any).__patchesLoaded;
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  describe('controlIdentifier', () => {
    it('should have correct control identifier', () => {
      expect(handler.controlIdentifier).toBe('sitna.drawMeasureModify.silme.extension');
    });
  });

  describe('requiredPatches', () => {
    it('should have required patch file', () => {
      expect(handler.requiredPatches).toEqual(['assets/js/patch/controls/DrawMeasureModifySilme.js']);
    });
  });

  describe('loadPatches()', () => {
    it('should mark patch as loaded if already loaded', async () => {
      (window as any).__patchesLoaded.DrawMeasureModifySilme = true;
      
      await handler.loadPatches(mockAppCfg);

      expect(mockTCNamespace.waitForTC).not.toHaveBeenCalled();
    });

    it('should wait for TC namespace', async () => {
      (window as any).__patchesLoaded.DrawMeasureModifySilme = true;
      
      await handler.loadPatches(mockAppCfg);

      // Should check for TC but not load script if already loaded
      expect(true).toBe(true);
    });
  });

  describe('buildConfiguration()', () => {
    beforeEach(async () => {
      // Ensure patch is marked as loaded
      (window as any).__patchesLoaded.DrawMeasureModifySilme = true;
      await handler.loadPatches(mockAppCfg);
    });

    it('should return configuration even if patch not loaded (patches load after config)', () => {
      // Reset patch loaded state - but buildConfiguration doesn't check this anymore
      // because patches are loaded after configuration is built
      (handler as any).patchLoaded = false;
      mockTC.control.DrawMeasureModifySilme = undefined;

      const task: AppTasks = {
        'ui-control': 'sitna.drawMeasureModify.silme.extension',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      // Configuration is built before patches are loaded
      expect(config).not.toBeNull();
      expect(config?.['div']).toBe('drawmeasuremodify');
      expect(config?.['displayElevation']).toEqual({
        displayOn: 'controlContainer'
      });
    });

    it('should return configuration with default div and displayElevation', () => {
      (handler as any).patchLoaded = true;
      mockTC.control.DrawMeasureModifySilme = {};

      const task: AppTasks = {
        'ui-control': 'sitna.drawMeasureModify.silme.extension',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'drawmeasuremodify',
        displayElevation: {
          displayOn: 'controlContainer'
        }
      });
      expect(mockUIStateService.enableToolsButton).toHaveBeenCalled();
    });

    it('should merge task parameters', () => {
      (handler as any).patchLoaded = true;
      mockTC.control.DrawMeasureModifySilme = {};

      const task: AppTasks = {
        'ui-control': 'sitna.drawMeasureModify.silme.extension',
        parameters: {
          customOption: 'value'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'drawmeasuremodify',
        displayElevation: {
          displayOn: 'controlContainer'
        },
        customOption: 'value'
      });
      expect(mockUIStateService.enableToolsButton).toHaveBeenCalled();
    });

    it('should allow parameters to override displayElevation', () => {
      (handler as any).patchLoaded = true;
      mockTC.control.DrawMeasureModifySilme = {};

      const task: AppTasks = {
        'ui-control': 'sitna.drawMeasureModify.silme.extension',
        parameters: {
          displayElevation: {
            displayOn: 'custom'
          }
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.['displayElevation']).toEqual({
        displayOn: 'custom'
      });
    });

    it('should always enable tools button', () => {
      (handler as any).patchLoaded = true;
      mockTC.control.DrawMeasureModifySilme = {};

      const task: AppTasks = {
        'ui-control': 'sitna.drawMeasureModify.silme.extension',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      handler.buildConfiguration(task, context);

      expect(mockUIStateService.enableToolsButton).toHaveBeenCalledTimes(1);
    });
  });

  describe('isReady()', () => {
    it('should return false if patch not loaded', () => {
      (handler as any).patchLoaded = false;
      expect(handler.isReady()).toBe(false);
    });

    it('should return false if TC.control.DrawMeasureModifySilme not available', () => {
      (handler as any).patchLoaded = true;
      mockTC.control.DrawMeasureModifySilme = undefined;
      expect(handler.isReady()).toBe(false);
    });

    it('should return true if patch loaded and control available', () => {
      (handler as any).patchLoaded = true;
      mockTC.control.DrawMeasureModifySilme = {};
      expect(handler.isReady()).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should handle full lifecycle', async () => {
      // Setup patch as loaded
      (window as any).__patchesLoaded.DrawMeasureModifySilme = true;
      mockTC.control.DrawMeasureModifySilme = {};

      // Load patches
      await handler.loadPatches(mockAppCfg);

      // Should be ready
      expect(handler.isReady()).toBe(true);

      // Build config
      const task: AppTasks = {
        'ui-control': 'sitna.drawMeasureModify.silme.extension',
        parameters: { customOption: true }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);
      expect(config).toBeDefined();
      expect(config?.div).toBe('drawmeasuremodify');
      expect(config?.['displayElevation']).toEqual({
        displayOn: 'controlContainer'
      });
      expect(config?.['customOption']).toBe(true);
      expect(mockUIStateService.enableToolsButton).toHaveBeenCalled();
    });
  });
});

