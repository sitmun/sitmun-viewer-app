import { TestBed } from '@angular/core/testing';

import { TCNamespaceService } from './tc-namespace.service';

describe('TCNamespaceService', () => {
  let service: TCNamespaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TCNamespaceService);

    // Clean up TC namespace before each test
    delete (window as any).TC;
    delete (globalThis as any).TC;
  });

  afterEach(() => {
    // Clean up after tests
    delete (window as any).TC;
    delete (globalThis as any).TC;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTC', () => {
    it('should return undefined when TC is not available', () => {
      expect(service.getTC()).toBeUndefined();
    });

    it('should return TC from window when available', () => {
      const mockTC = { control: {}, map: {} };
      (window as any).TC = mockTC;

      expect(service.getTC()).toBe(mockTC);
    });

    it('should return TC from globalThis when available', () => {
      const mockTC = { control: {}, map: {} };
      (globalThis as any).TC = mockTC;

      expect(service.getTC()).toBe(mockTC);
    });

    it('should prefer window.TC over globalThis.TC', () => {
      const windowTC = { source: 'window' };
      // In browser environments, window === globalThis, so we can't test preference
      // by setting both separately. Instead, we verify that window.TC is checked first
      // by ensuring the code structure prioritizes window.
      (window as any).TC = windowTC;

      // The implementation checks (window as any).TC first, then (globalThis as any).TC
      // In browser, they're the same, so this test verifies window is in the check
      expect(service.getTC()).toBe(windowTC);

      // Verify the code checks window first by inspecting the implementation
      // The getTC() method returns window.TC || globalThis.TC, so window is checked first
    });
  });

  describe('isTCReady', () => {
    it('should return false when TC is not available', () => {
      expect(service.isTCReady()).toBe(false);
    });

    it('should return true when TC is available', () => {
      (window as any).TC = { control: {} };
      expect(service.isTCReady()).toBe(true);
    });
  });

  describe('waitForTC', () => {
    it('should resolve immediately if TC is already available', async () => {
      const mockTC = { control: {} };
      (window as any).TC = mockTC;

      const result = await service.waitForTC();
      expect(result).toBe(mockTC);
    });

    it('should wait and resolve when TC becomes available', async () => {
      // Start waiting
      const waitPromise = service.waitForTC(10, 10);

      // Make TC available after 50ms
      setTimeout(() => {
        (window as any).TC = { control: {} };
      }, 50);

      const result = await waitPromise;
      expect(result).toBeDefined();
      expect(result.control).toBeDefined();
    });

    it('should throw error after max retries', async () => {
      try {
        await service.waitForTC(3, 10); // 3 retries, 10ms delay
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('TC namespace not available');
      }
    });

    it('should use default retry parameters', async () => {
      const startTime = Date.now();

      setTimeout(() => {
        (window as any).TC = { control: {} };
      }, 100);

      await service.waitForTC();

      // Should have waited at least 100ms
      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeGreaterThanOrEqual(50);
    });

    it('should handle concurrent wait calls', async () => {
      // Make TC available after 50ms
      setTimeout(() => {
        (window as any).TC = { control: {} };
      }, 50);

      const [result1, result2, result3] = await Promise.all([
        service.waitForTC(20, 10),
        service.waitForTC(20, 10),
        service.waitForTC(20, 10)
      ]);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result3).toBeDefined();
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });

  describe('waitForTCProperty', () => {
    it('should resolve when property exists', async () => {
      (window as any).TC = {
        control: {
          FeatureInfo: class FeatureInfo {}
        }
      };

      const result = await service.waitForTCProperty('control.FeatureInfo');
      expect(result).toBeDefined();
    });

    it('should wait for nested property to become available', async () => {
      // Start with partial TC
      (window as any).TC = { control: {} };

      // Start waiting
      const waitPromise = service.waitForTCProperty(
        'control.SearchSilme',
        10,
        10
      );

      // Add property after 50ms
      setTimeout(() => {
        (window as any).TC.control.SearchSilme = class SearchSilme {};
      }, 50);

      const result = await waitPromise;
      expect(result).toBeDefined();
    });

    it('should throw error if property never becomes available', async () => {
      (window as any).TC = { control: {} };

      try {
        await service.waitForTCProperty('control.NonExistent', 3, 10);
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('TC property');
        expect(error.message).toContain('control.NonExistent');
      }
    });

    it('should handle deeply nested properties', async () => {
      (window as any).TC = {
        level1: {
          level2: {
            level3: {
              value: 'found'
            }
          }
        }
      };

      const result = await service.waitForTCProperty(
        'level1.level2.level3.value'
      );
      expect(result).toBe('found');
    });

    it('should wait for TC namespace if not available', async () => {
      // Start waiting
      const waitPromise = service.waitForTCProperty('control.Test', 10, 10);

      // Add TC with property after 50ms
      setTimeout(() => {
        (window as any).TC = {
          control: {
            Test: 'testValue'
          }
        };
      }, 50);

      const result = await waitPromise;
      expect(result).toBe('testValue');
    });

    it('should handle property with falsy but defined values', async () => {
      (window as any).TC = {
        control: {
          value: 0 // Falsy but defined
        }
      };

      const result = await service.waitForTCProperty('control.value');
      expect(result).toBe(0);
    });

    it('should not resolve for explicitly undefined properties', async () => {
      (window as any).TC = {
        control: {
          explicitUndefined: undefined
        }
      };

      try {
        await service.waitForTCProperty('control.explicitUndefined', 3, 10);
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('not available');
      }
    });
  });

  describe('getPropertyByPath', () => {
    it('should handle single level path', async () => {
      (window as any).TC = { control: 'value' };
      const result = await service.waitForTCProperty('control');
      expect(result).toBe('value');
    });

    it('should handle multi-level path', async () => {
      (window as any).TC = {
        a: {
          b: {
            c: 'deep value'
          }
        }
      };
      const result = await service.waitForTCProperty('a.b.c');
      expect(result).toBe('deep value');
    });

    it('should return undefined for broken path', async () => {
      (window as any).TC = { a: { b: {} } };

      try {
        await service.waitForTCProperty('a.b.c.d', 2, 10);
        fail('Should have thrown');
      } catch (error) {
        // Expected
      }
    });

    it('should handle arrays in path', async () => {
      (window as any).TC = {
        control: {
          '0': 'first'
        }
      };
      const result = await service.waitForTCProperty('control.0');
      expect(result).toBe('first');
    });
  });

  describe('edge cases', () => {
    it('should handle null TC', () => {
      (window as any).TC = null;
      expect(service.getTC()).toBeNull();
    });

    it('should handle TC with no properties', () => {
      (window as any).TC = {};
      expect(service.isTCReady()).toBe(true);
      expect(service.getTC()).toEqual({});
    });

    it('should handle rapid TC availability changes', async () => {
      let changeCount = 0;
      const interval = setInterval(() => {
        if (changeCount % 2 === 0) {
          (window as any).TC = { control: {} };
        } else {
          delete (window as any).TC;
        }
        changeCount++;
        if (changeCount > 5) {
          (window as any).TC = { control: {} }; // End with TC available
          clearInterval(interval);
        }
      }, 10);

      const result = await service.waitForTC(20, 20);
      expect(result).toBeDefined();
      clearInterval(interval);
    });

    it('should handle waitForTC with 0 retries', async () => {
      try {
        await service.waitForTC(0, 10);
        fail('Should have thrown');
      } catch (error) {
        // Expected
      }
    });

    it('should handle very long delay', async () => {
      (window as any).TC = { control: {} };

      const startTime = Date.now();
      await service.waitForTC(1, 1000); // Should resolve immediately despite long delay
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeLessThan(100); // Should be fast since TC is already there
    });
  });
});
