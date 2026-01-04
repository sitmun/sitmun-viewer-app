import { createPatchManager, PatchManager } from './patch-manager';

describe('PatchManager', () => {
  let patchManager: PatchManager;

  beforeEach(() => {
    patchManager = createPatchManager();
  });

  it('should create patch manager', () => {
    expect(patchManager).toBeDefined();
    expect(patchManager.add).toBeDefined();
    expect(patchManager.restoreAll).toBeDefined();
    expect(patchManager.clear).toBeDefined();
  });

  describe('add', () => {
    it('should add single restore function', () => {
      let restored = false;
      patchManager.add(() => {
        restored = true;
      });

      patchManager.restoreAll();
      expect(restored).toBe(true);
    });

    it('should add array of restore functions', () => {
      const restored: number[] = [];
      
      patchManager.add([
        () => restored.push(1),
        () => restored.push(2),
        () => restored.push(3),
      ]);

      patchManager.restoreAll();
      expect(restored).toEqual([1, 2, 3]);
    });

    it('should add multiple restore functions separately', () => {
      const restored: string[] = [];
      
      patchManager.add(() => restored.push('first'));
      patchManager.add(() => restored.push('second'));
      patchManager.add(() => restored.push('third'));

      patchManager.restoreAll();
      expect(restored).toEqual(['first', 'second', 'third']);
    });

    it('should mix single and array additions', () => {
      const restored: string[] = [];
      
      patchManager.add(() => restored.push('single-1'));
      patchManager.add([
        () => restored.push('array-1'),
        () => restored.push('array-2'),
      ]);
      patchManager.add(() => restored.push('single-2'));

      patchManager.restoreAll();
      expect(restored).toEqual(['single-1', 'array-1', 'array-2', 'single-2']);
    });
  });

  describe('restoreAll', () => {
    it('should execute all restore functions', () => {
      const counters = { a: 0, b: 0, c: 0 };
      
      patchManager.add(() => counters.a++);
      patchManager.add(() => counters.b++);
      patchManager.add(() => counters.c++);

      patchManager.restoreAll();

      expect(counters.a).toBe(1);
      expect(counters.b).toBe(1);
      expect(counters.c).toBe(1);
    });

    it('should clear patches after restore', () => {
      let counter = 0;
      patchManager.add(() => counter++);

      patchManager.restoreAll();
      expect(counter).toBe(1);

      // Restoring again should not execute again
      patchManager.restoreAll();
      expect(counter).toBe(1); // Still 1, not 2
    });

    it('should handle empty patch list', () => {
      expect(() => patchManager.restoreAll()).not.toThrow();
    });

    it('should handle errors in restore functions', () => {
      const restored: string[] = [];
      
      patchManager.add(() => restored.push('first'));
      patchManager.add(() => {
        throw new Error('Intentional error');
      });
      patchManager.add(() => restored.push('third'));

      // Should log error but continue with other patches
      const consoleErrorSpy = spyOn(console, 'error');
      
      patchManager.restoreAll();

      expect(restored).toContain('first');
      expect(restored).toContain('third');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should restore in FIFO order', () => {
      const order: number[] = [];
      
      for (let i = 1; i <= 5; i++) {
        patchManager.add(() => order.push(i));
      }

      patchManager.restoreAll();
      expect(order).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('clear', () => {
    it('should clear patches without executing them', () => {
      let executed = false;
      patchManager.add(() => {
        executed = true;
      });

      patchManager.clear();

      expect(executed).toBe(false);
    });

    it('should allow new patches after clear', () => {
      let counter = 0;
      
      patchManager.add(() => counter++);
      patchManager.clear();
      patchManager.add(() => counter++);
      patchManager.restoreAll();

      expect(counter).toBe(1); // Only second patch executed
    });

    it('should handle multiple clears', () => {
      patchManager.add(() => {});
      patchManager.clear();
      patchManager.clear();
      patchManager.clear();

      expect(() => patchManager.restoreAll()).not.toThrow();
    });
  });

  describe('real-world scenarios', () => {
    it('should restore window properties', () => {
      const originalValue = 'original';
      (window as any).testProperty = originalValue;

      // Patch the property
      const newValue = 'patched';
      (window as any).testProperty = newValue;

      // Add restore
      patchManager.add(() => {
        (window as any).testProperty = originalValue;
      });

      expect((window as any).testProperty).toBe(newValue);

      patchManager.restoreAll();

      expect((window as any).testProperty).toBe(originalValue);

      // Cleanup
      delete (window as any).testProperty;
    });

    it('should restore multiple object properties', () => {
      const obj = {
        method1: () => 'original-1',
        method2: () => 'original-2',
        prop: 'original',
      };

      // Store originals
      const original1 = obj.method1;
      const original2 = obj.method2;
      const originalProp = obj.prop;

      // Patch
      obj.method1 = () => 'patched-1';
      obj.method2 = () => 'patched-2';
      obj.prop = 'patched';

      // Add restores
      patchManager.add([
        () => { obj.method1 = original1; },
        () => { obj.method2 = original2; },
        () => { obj.prop = originalProp; },
      ]);

      expect(obj.method1()).toBe('patched-1');
      expect(obj.method2()).toBe('patched-2');
      expect(obj.prop).toBe('patched');

      patchManager.restoreAll();

      expect(obj.method1()).toBe('original-1');
      expect(obj.method2()).toBe('original-2');
      expect(obj.prop).toBe('original');
    });

    it('should handle monkey patches', () => {
      const obj = {
        calculate: (a: number, b: number) => a + b,
      };

      const original = obj.calculate;

      // Monkey patch to multiply instead
      obj.calculate = (a: number, b: number) => a * b;
      patchManager.add(() => { obj.calculate = original; });

      expect(obj.calculate(2, 3)).toBe(6); // 2 * 3

      patchManager.restoreAll();

      expect(obj.calculate(2, 3)).toBe(5); // 2 + 3 (original)
    });

    it('should handle aspect-oriented patches', () => {
      const calls: string[] = [];
      
      const service = {
        method: (arg: string) => {
          calls.push(`method:${arg}`);
          return arg;
        },
      };

      const original = service.method;

      // AOP: Add before and after advice
      service.method = (arg: string) => {
        calls.push('before');
        const result = original.call(service, arg);
        calls.push('after');
        return result;
      };

      patchManager.add(() => { service.method = original; });

      service.method('test');
      expect(calls).toEqual(['before', 'method:test', 'after']);

      calls.length = 0;
      patchManager.restoreAll();

      service.method('test');
      expect(calls).toEqual(['method:test']); // No before/after
    });
  });

  describe('lifecycle management', () => {
    it('should support component lifecycle pattern', () => {
      // Simulate Angular component lifecycle
      const component = {
        patchManager: createPatchManager(),
        
        ngOnInit() {
          // Apply patches
          const original = (window as any).someMethod;
          (window as any).someMethod = () => 'patched';
          this.patchManager.add(() => {
            (window as any).someMethod = original;
          });
        },
        
        ngOnDestroy() {
          // Clean up patches
          this.patchManager.restoreAll();
        },
      };

      (window as any).someMethod = () => 'original';

      component.ngOnInit();
      expect((window as any).someMethod()).toBe('patched');

      component.ngOnDestroy();
      expect((window as any).someMethod()).toBe('original');

      // Cleanup
      delete (window as any).someMethod;
    });
  });

  describe('performance', () => {
    it('should handle large number of patches', () => {
      const patchCount = 1000;
      let counter = 0;

      for (let i = 0; i < patchCount; i++) {
        patchManager.add(() => counter++);
      }

      const startTime = performance.now();
      patchManager.restoreAll();
      const elapsed = performance.now() - startTime;

      expect(counter).toBe(patchCount);
      expect(elapsed).toBeLessThan(100); // Should be fast
    });
  });

  describe('error resilience', () => {
    it('should continue restoring after error', () => {
      const restored: string[] = [];

      patchManager.add(() => restored.push('first'));
      patchManager.add(() => {
        throw new Error('Error in second');
      });
      patchManager.add(() => restored.push('third'));
      patchManager.add(() => {
        throw new Error('Error in fourth');
      });
      patchManager.add(() => restored.push('fifth'));

      spyOn(console, 'error'); // Suppress error output

      patchManager.restoreAll();

      expect(restored).toEqual(['first', 'third', 'fifth']);
    });

    it('should handle TypeError in restore', () => {
      patchManager.add(() => {
        (null as any).someProperty = 'value'; // Will throw TypeError
      });

      const consoleErrorSpy = spyOn(console, 'error');

      expect(() => patchManager.restoreAll()).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});

