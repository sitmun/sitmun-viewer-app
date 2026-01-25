import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { SitnaApiService } from './sitna-api.service';
import { SitnaLoaderService } from './sitna-loader.service';

describe('SitnaLoaderService', () => {
  let service: SitnaLoaderService;
  let sitnaApiSpy: jest.Mocked<SitnaApiService>;

  beforeEach(() => {
    const spy = {
      getSITNA: jest.fn(),
      getTC: jest.fn(),
      getTCProperty: jest.fn(),
      isReady: jest.fn().mockReturnValue(false),
      getGlobal: jest.fn(),
      setGlobal: jest.fn(),
      isGlobalDefined: jest.fn().mockReturnValue(false)
    } as Partial<jest.Mocked<SitnaApiService>> as jest.Mocked<SitnaApiService>;

    TestBed.configureTestingModule({
      providers: [
        SitnaLoaderService,
        { provide: SitnaApiService, useValue: spy }
      ]
    });

    service = TestBed.inject(SitnaLoaderService);
    sitnaApiSpy = TestBed.inject(
      SitnaApiService
    ) as jest.Mocked<SitnaApiService>;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false initially for isReady()', () => {
    expect(service.isReady()).toBe(false);
  });

  it('should emit false initially on ready$', fakeAsync(() => {
    let emittedValue: boolean | undefined;
    service.ready$.subscribe((ready) => {
      emittedValue = ready;
    });
    tick();
    expect(emittedValue).toBe(false);
  }));

  it('should resolve immediately if SITNA already ready', async () => {
    // Mock SITNA as already available
    sitnaApiSpy.getSITNA.mockReturnValue({
      Map: () => null
    } as any);

    await service.waitForSITNAMap(1000);

    expect(service.isReady()).toBe(true);
  });

  it('should poll and resolve when SITNA becomes available', async () => {
    // Initially throw, then return SITNA after a few calls
    let callCount = 0;
    sitnaApiSpy.getSITNA.mockImplementation(() => {
      callCount++;
      if (callCount > 3) {
        return {
          Map: () => null
        } as any;
      }
      throw new Error('SITNA namespace not available');
    });

    // Should not be ready initially
    expect(service.isReady()).toBe(false);

    // Wait for SITNA to become available (polling at 100ms intervals)
    await service.waitForSITNAMap(2000);

    expect(service.isReady()).toBe(true);
    expect(callCount).toBeGreaterThan(3);
  }, 5000);

  it('should timeout if SITNA never becomes available', async () => {
    sitnaApiSpy.getSITNA.mockImplementation(() => {
      throw new Error('SITNA namespace not available');
    });

    // Use a very short timeout for the test
    await expect(service.waitForSITNAMap(50)).rejects.toThrow(
      'failed to load within 50ms'
    );
  }, 5000);

  it('should emit true on ready$ when SITNA becomes available', async () => {
    const emissions: boolean[] = [];

    service.ready$.subscribe((ready) => {
      emissions.push(ready);
    });

    // Initially should have false
    expect(emissions).toEqual([false]);

    // Mock SITNA becoming available
    sitnaApiSpy.getSITNA.mockReturnValue({
      Map: () => null
    } as any);

    await service.waitForSITNAMap(1000);

    // Should now have true
    expect(emissions).toEqual([false, true]);
  });

  it('should allow multiple subscribers to ready$', async () => {
    const emissions1: boolean[] = [];
    const emissions2: boolean[] = [];

    service.ready$.subscribe((ready) => {
      emissions1.push(ready);
    });

    service.ready$.subscribe((ready) => {
      emissions2.push(ready);
    });

    // Both should receive initial false
    expect(emissions1).toEqual([false]);
    expect(emissions2).toEqual([false]);

    // Mock SITNA becoming available
    sitnaApiSpy.getSITNA.mockReturnValue({
      Map: () => null
    } as any);

    await service.waitForSITNAMap(1000);

    // Both should receive true
    expect(emissions1).toEqual([false, true]);
    expect(emissions2).toEqual([false, true]);
  });

  it('should handle late subscribers to ready$ after SITNA is ready', async () => {
    // Mock SITNA as available
    sitnaApiSpy.getSITNA.mockReturnValue({
      Map: () => null
    } as any);

    await service.waitForSITNAMap(1000);

    // Now subscribe after SITNA is ready
    const emissions: boolean[] = [];
    service.ready$.subscribe((ready) => {
      emissions.push(ready);
    });

    // Late subscriber should immediately receive true (BehaviorSubject caches last value)
    expect(emissions).toEqual([true]);
  });

  it('should only start polling once', async () => {
    sitnaApiSpy.getSITNA.mockReturnValue({
      Map: () => null
    } as any);

    // Call waitForSITNAMap multiple times
    const promise1 = service.waitForSITNAMap(1000);
    const promise2 = service.waitForSITNAMap(1000);
    const promise3 = service.waitForSITNAMap(1000);

    await Promise.all([promise1, promise2, promise3]);

    // All should resolve successfully
    expect(service.isReady()).toBe(true);
  });
});
