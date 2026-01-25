import { TestBed } from '@angular/core/testing';

import { SitnaApiService } from './sitna-api.service';

describe('SitnaApiService', () => {
  let service: SitnaApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SitnaApiService);

    // Clean up namespaces before each test
    delete (window as any).TC;
    delete (window as any).SITNA;
  });

  afterEach(() => {
    // Clean up after tests
    delete (window as any).TC;
    delete (window as any).SITNA;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTC', () => {
    it('should throw error when TC is not available', () => {
      expect(() => service.getTC()).toThrow('TC namespace not available');
    });

    it('should return TC from window when available', () => {
      const mockTC = { control: {}, map: {} };
      (window as any).TC = mockTC;

      expect(service.getTC()).toBe(mockTC);
    });
  });

  describe('getSITNA', () => {
    it('should throw error when SITNA is not available', () => {
      expect(() => service.getSITNA()).toThrow('SITNA namespace not available');
    });

    it('should return SITNA from window when available', () => {
      const mockSITNA = { Map: class Map {} };
      (window as any).SITNA = mockSITNA;

      expect(service.getSITNA()).toBe(mockSITNA);
    });
  });

  describe('isReady', () => {
    it('should return false when TC is not available', () => {
      expect(service.isReady()).toBe(false);
    });

    it('should return true when TC is available', () => {
      (window as any).TC = { control: {} };
      expect(service.isReady()).toBe(true);
    });

    it('should return true when both TC and SITNA are available', () => {
      (window as any).TC = { control: {} };
      (window as any).SITNA = { Map: class Map {} };
      expect(service.isReady()).toBe(true);
    });
  });

  describe('getTCProperty', () => {
    it('should return property when it exists', () => {
      (window as any).TC = {
        control: {
          FeatureInfo: class FeatureInfo {}
        }
      };

      const result = service.getTCProperty('control.FeatureInfo');
      expect(result).toBeDefined();
    });

    it('should throw error if property does not exist', () => {
      (window as any).TC = { control: {} };

      expect(() => service.getTCProperty('control.NonExistent')).toThrow(
        'TC.control.NonExistent not found'
      );
    });

    it('should handle deeply nested properties', () => {
      (window as any).TC = {
        level1: {
          level2: {
            level3: {
              value: 'found'
            }
          }
        }
      };

      const result = service.getTCProperty('level1.level2.level3.value');
      expect(result).toBe('found');
    });

    it('should handle property with falsy but defined values', () => {
      (window as any).TC = {
        control: {
          value: 0 // Falsy but defined
        }
      };

      const result = service.getTCProperty('control.value');
      expect(result).toBe(0);
    });

    it('should throw for explicitly undefined properties', () => {
      (window as any).TC = {
        control: {
          explicitUndefined: undefined
        }
      };

      expect(() => service.getTCProperty('control.explicitUndefined')).toThrow(
        'not found'
      );
    });

    it('should handle single level path', () => {
      (window as any).TC = { control: 'value' };
      const result = service.getTCProperty('control');
      expect(result).toBe('value');
    });

    it('should handle multi-level path', () => {
      (window as any).TC = {
        a: {
          b: {
            c: 'deep value'
          }
        }
      };
      const result = service.getTCProperty('a.b.c');
      expect(result).toBe('deep value');
    });

    it('should throw for broken path', () => {
      (window as any).TC = { a: { b: {} } };

      expect(() => service.getTCProperty('a.b.c.d')).toThrow('not found');
    });

    it('should handle arrays in path', () => {
      (window as any).TC = {
        control: {
          '0': 'first'
        }
      };
      const result = service.getTCProperty('control.0');
      expect(result).toBe('first');
    });
  });

  describe('getGlobal / setGlobal', () => {
    it('should return undefined for unset app global', () => {
      expect(service.getGlobal('abstractMapObject')).toBeUndefined();
      expect(service.getGlobal('layerCatalogsForModal')).toBeUndefined();
    });

    it('should set and get abstractMapObject', () => {
      const ref = { updateCatalog: jest.fn() };
      service.setGlobal('abstractMapObject', ref);
      expect(service.getGlobal('abstractMapObject')).toBe(ref);
      service.setGlobal('abstractMapObject', undefined);
      expect(service.getGlobal('abstractMapObject')).toBeUndefined();
    });

    it('should set and get layerCatalogsForModal', () => {
      const state = {
        currentTreeId: 't1',
        catalogs: [{ id: 't1', catalog: 'C1' }],
        rootNodeIds: ['n1']
      };
      service.setGlobal('layerCatalogsForModal', state);
      expect(service.getGlobal('layerCatalogsForModal')).toEqual(state);
      service.setGlobal('layerCatalogsForModal', undefined);
      expect(service.getGlobal('layerCatalogsForModal')).toBeUndefined();
    });
  });

  describe('isGlobalDefined', () => {
    it('should return false for unset app globals', () => {
      expect(service.isGlobalDefined('abstractMapObject')).toBe(false);
      expect(service.isGlobalDefined('layerCatalogsForModal')).toBe(false);
    });

    it('should return true when app global is set', () => {
      service.setGlobal('abstractMapObject', { updateCatalog: jest.fn() });
      expect(service.isGlobalDefined('abstractMapObject')).toBe(true);
    });

    it('should check window for non-SitnaGlobals names', () => {
      expect(service.isGlobalDefined('TC')).toBe(false);
      (window as any).TC = {};
      expect(service.isGlobalDefined('TC')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should throw for null TC', () => {
      (window as any).TC = null;
      expect(() => service.getTC()).toThrow('TC namespace not available');
    });

    it('should throw for null SITNA', () => {
      (window as any).SITNA = null;
      expect(() => service.getSITNA()).toThrow('SITNA namespace not available');
    });

    it('should handle TC with no properties', () => {
      (window as any).TC = {};
      expect(service.isReady()).toBe(true);
      expect(service.getTC()).toEqual({});
    });

    it('should handle SITNA with no properties', () => {
      (window as any).SITNA = {};
      expect(service.getSITNA()).toEqual({});
    });
  });
});
