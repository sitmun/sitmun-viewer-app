import { readFileSync } from 'fs';
import { join } from 'path';

import { NgOptimizedImage } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { DashboardItem } from '@api/services/common.service';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardItemComponent } from '@ui/components/dashboard/dashboard-item/dashboard-item.component';
import { DashboardTerritorySelectionDialogComponent } from '@ui/components/dashboard/dashboard-territory-selection-dialog/dashboard-territory-selection-dialog.component';
import { AppConfigService } from 'src/app/services/app-config.service';

import { DashboardItemsComponent } from './dashboard-items.component';

// Mock IntersectionObserver for tests
global.IntersectionObserver = class IntersectionObserver {
  constructor(public callback: IntersectionObserverCallback) {}
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
  takeRecords = jest.fn();
  root = null;
  rootMargin = '';
  thresholds = [];
} as any;

describe('DashboardItemsComponent', () => {
  let component: DashboardItemsComponent;
  let fixture: ComponentFixture<DashboardItemsComponent>;
  let mockRouter: jest.Mocked<Router>;
  let mockAppConfigService: jest.Mocked<AppConfigService>;

  const createMockItem = (
    id: number,
    name: string,
    type: string | null = 'I',
    appPrivate = false
  ): DashboardItem => ({
    id,
    name,
    type: type ?? undefined,
    appPrivate,
    isUnavailable: false,
    updateDate: new Date(),
    createdDate: new Date(),
    pointOfContact: 'gis-office@example.com',
    headerParams: {}
  });

  beforeEach(async () => {
    mockRouter = {
      url: '/user/dashboard'
    } as Partial<Router> as jest.Mocked<Router>;
    mockAppConfigService = {
      isFilteringEnabled: jest.fn(),
      getAllowedTypes: jest.fn(),
      getDashboardConfig: jest.fn(() => ({
        allowedTypes: mockAppConfigService.getAllowedTypes(),
        filteringEnabled: mockAppConfigService.isFilteringEnabled(),
        initialBatchSize: 3,
        batchIncrement: 3
      })),
      filterApplicationsByType: jest.fn((items, config) => {
        if (!config.filteringEnabled) {
          return items;
        }
        const allowedTypes = config.allowedTypes ?? [];
        return items.filter(
          (item) => item.type != null && allowedTypes.includes(item.type)
        );
      })
    } as Partial<
      jest.Mocked<AppConfigService>
    > as jest.Mocked<AppConfigService>;

    await TestBed.configureTestingModule({
      imports: [
        NgOptimizedImage,
        TranslateModule.forRoot(),
        MatDialogModule
      ],
      declarations: [
        DashboardItemsComponent,
        DashboardItemComponent,
        DashboardTerritorySelectionDialogComponent
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockRouter },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardItemsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('filterByType', () => {
    it('should return all items when filtering is disabled', () => {
      mockAppConfigService.isFilteringEnabled.mockReturnValue(false);

      const items: DashboardItem[] = [
        createMockItem(1, 'App1', 'I'),
        createMockItem(2, 'App2', 'E'),
        createMockItem(3, 'App3', null)
      ];

      const result = component.filterByType(items);

      expect(result.length).toBe(3);
      expect(result).toEqual(items);
    });

    it('should filter items by allowed types when filtering is enabled', () => {
      mockAppConfigService.isFilteringEnabled.mockReturnValue(true);
      mockAppConfigService.getAllowedTypes.mockReturnValue(['I']);

      const items: DashboardItem[] = [
        createMockItem(1, 'App1', 'I'),
        createMockItem(2, 'App2', 'E'),
        createMockItem(3, 'App3', 'I')
      ];

      const result = component.filterByType(items);

      expect(result.length).toBe(2);
      expect(result[0].name).toBe('App1');
      expect(result[1].name).toBe('App3');
    });

    it('should filter out items with null type when filtering is enabled', () => {
      mockAppConfigService.isFilteringEnabled.mockReturnValue(true);
      mockAppConfigService.getAllowedTypes.mockReturnValue(['I']);

      const items: DashboardItem[] = [
        createMockItem(1, 'App1', 'I'),
        createMockItem(2, 'App2', null),
        createMockItem(3, 'App3', 'I')
      ];

      const result = component.filterByType(items);

      expect(result.length).toBe(2);
      expect(result[0].name).toBe('App1');
      expect(result[1].name).toBe('App3');
    });

    it('should return empty array when no items match allowed types', () => {
      mockAppConfigService.isFilteringEnabled.mockReturnValue(true);
      mockAppConfigService.getAllowedTypes.mockReturnValue(['P']);

      const items: DashboardItem[] = [
        createMockItem(1, 'App1', 'I'),
        createMockItem(2, 'App2', 'E')
      ];

      const result = component.filterByType(items);

      expect(result.length).toBe(0);
    });

    it('should handle multiple allowed types', () => {
      mockAppConfigService.isFilteringEnabled.mockReturnValue(true);
      mockAppConfigService.getAllowedTypes.mockReturnValue(['I', 'E', 'P']);

      const items: DashboardItem[] = [
        createMockItem(1, 'App1', 'I'),
        createMockItem(2, 'App2', 'E'),
        createMockItem(3, 'App3', 'P'),
        createMockItem(4, 'App4', 'X')
      ];

      const result = component.filterByType(items);

      expect(result.length).toBe(3);
      expect(result.map((r) => r.name)).toEqual(['App1', 'App2', 'App3']);
    });
  });

  describe('displayAllApplications', () => {
    it('should apply type filtering before displaying applications', () => {
      mockAppConfigService.isFilteringEnabled.mockReturnValue(true);
      mockAppConfigService.getAllowedTypes.mockReturnValue(['I']);
      Object.defineProperty(mockRouter, 'url', {
        get: () => '/public/dashboard'
      });

      component.items = [
        createMockItem(1, 'App1', 'I'),
        createMockItem(2, 'App2', 'E'),
        createMockItem(3, 'App3', 'I')
      ];

      component.ngOnInit();

      expect(component.allItems.length).toBe(2);
    });

    it('should display all items from input', () => {
      mockAppConfigService.isFilteringEnabled.mockReturnValue(false);
      Object.defineProperty(mockRouter, 'url', {
        get: () => '/public/dashboard'
      });

      component.items = Array.from({ length: 9 }, (_, index) =>
        createMockItem(index + 1, `App${index + 1}`, 'E')
      );
      component.ngOnInit();

      expect(component.allItems.length).toBe(9);
    });

    it('should update displayed items when input changes', () => {
      mockAppConfigService.isFilteringEnabled.mockReturnValue(false);
      Object.defineProperty(mockRouter, 'url', {
        get: () => '/public/dashboard'
      });

      component.items = Array.from({ length: 15 }, (_, index) =>
        createMockItem(index + 1, `App${index + 1}`, 'E')
      );
      component.ngOnInit();

      expect(component.allItems.length).toBe(15);

      const nextItems = [createMockItem(1, 'App1', 'E')];
      component.items = nextItems;
      component.ngOnChanges({
        items: {
          previousValue: [],
          currentValue: nextItems,
          firstChange: false,
          isFirstChange: () => false
        }
      });

      expect(component.allItems.length).toBe(1);
    });
  });

  describe('displayAllApplicationsPrivate', () => {
    it('should apply type filtering before filtering by private/public', () => {
      mockAppConfigService.isFilteringEnabled.mockReturnValue(true);
      mockAppConfigService.getAllowedTypes.mockReturnValue(['I']);
      Object.defineProperty(mockRouter, 'url', {
        get: () => '/user/dashboard'
      });

      component.items = [
        createMockItem(1, 'App1', 'I', true),
        createMockItem(2, 'App2', 'E', true),
        createMockItem(3, 'App3', 'I', false),
        createMockItem(4, 'App4', 'E', false)
      ];

      component.ngOnInit();

      expect(component.privateItems.length).toBe(1);
      expect(component.privateItems[0].name).toBe('App1');
    });

    it('should handle public items with type filtering', () => {
      mockAppConfigService.isFilteringEnabled.mockReturnValue(true);
      mockAppConfigService.getAllowedTypes.mockReturnValue(['I']);
      Object.defineProperty(mockRouter, 'url', {
        get: () => '/user/dashboard'
      });

      component.items = [
        createMockItem(1, 'App1', 'I', true),
        createMockItem(2, 'App2', 'E', true),
        createMockItem(3, 'App3', 'I', false),
        createMockItem(4, 'App4', 'E', false)
      ];

      component.ngOnInit();

      expect(component.publicItems.length).toBe(1);
      expect(component.publicItems[0].name).toBe('App3');
    });
  });

  describe('isPublic', () => {
    it('should return true for public routes', () => {
      Object.defineProperty(mockRouter, 'url', {
        get: () => '/public/dashboard'
      });

      expect(component.isPublic()).toBe(true);
    });

    it('should return false for non-public routes', () => {
      Object.defineProperty(mockRouter, 'url', {
        get: () => '/user/dashboard'
      });

      expect(component.isPublic()).toBe(false);
    });
  });

  it('declares full-width block host layout for stable filtered grids', () => {
    const scss = readFileSync(
      join(__dirname, 'dashboard-items.component.scss'),
      'utf8'
    );
    expect(scss).toContain(':host');
    expect(scss).toMatch(/display:\s*block/);
    expect(scss).toMatch(/width:\s*100%/);
  });

  describe('Infinite Scroll', () => {
    beforeEach(() => {
      mockAppConfigService.getDashboardConfig.mockReturnValue({
        allowedTypes: [],
        filteringEnabled: false,
        initialBatchSize: 12,
        batchIncrement: 6
      });
    });

    it('should setup observers after view init', () => {
      Object.defineProperty(mockRouter, 'url', {
        get: () => '/public/dashboard'
      });
      component.items = Array.from({ length: 20 }, (_, i) =>
        createMockItem(i + 1, `App${i + 1}`, 'E')
      );
      component.hasMorePages = true;
      component.ngOnInit();
      
      component.ngAfterViewInit();
      
      expect(component['observers']).toBeDefined();
      expect(Array.isArray(component['observers'])).toBe(true);
    });

    it('rebinds intersection observers when items arrive after init', () => {
      jest.useFakeTimers();
      Object.defineProperty(mockRouter, 'url', {
        get: () => '/public/dashboard'
      });
      component.hasMorePages = true;
      component.ngOnInit();
      component.ngAfterViewInit();

      const setupSpy = jest.spyOn(
        component as unknown as { setupIntersectionObservers: () => void },
        'setupIntersectionObservers'
      );
      setupSpy.mockClear();

      component.items = [createMockItem(1, 'App 1', 'I')];
      component.ngOnChanges({
        items: {
          currentValue: component.items,
          previousValue: [],
          firstChange: false,
          isFirstChange: () => false
        }
      });

      jest.advanceTimersByTime(100);

      expect(setupSpy).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('should emit loadMore event when sentinel visible', () => {
      Object.defineProperty(mockRouter, 'url', {
        get: () => '/public/dashboard'
      });
      component.items = Array.from({ length: 12 }, (_, i) =>
        createMockItem(i + 1, `App${i + 1}`, 'E')
      );
      component.hasMorePages = true;
      component.loadingMore = false;
      component.ngOnInit();

      const loadMoreSpy = jest.spyOn(component.loadMore, 'emit');

      component['onSentinelVisible']();

      expect(loadMoreSpy).toHaveBeenCalled();
    });

    it('should prevent simultaneous loads', () => {
      Object.defineProperty(mockRouter, 'url', {
        get: () => '/public/dashboard'
      });
      component.items = Array.from({ length: 12 }, (_, i) =>
        createMockItem(i + 1, `App${i}`, 'E')
      );
      component.hasMorePages = true;
      component.loadingMore = true;
      component.ngOnInit();

      const loadMoreSpy = jest.spyOn(component.loadMore, 'emit');

      component['onSentinelVisible']();

      expect(loadMoreSpy).not.toHaveBeenCalled();
    });

    it('should not emit when no more pages', () => {
      Object.defineProperty(mockRouter, 'url', {
        get: () => '/public/dashboard'
      });
      component.items = Array.from({ length: 12 }, (_, i) =>
        createMockItem(i + 1, `App${i}`, 'E')
      );
      component.hasMorePages = false;
      component.loadingMore = false;
      component.ngOnInit();

      const loadMoreSpy = jest.spyOn(component.loadMore, 'emit');

      component['onSentinelVisible']();

      expect(loadMoreSpy).not.toHaveBeenCalled();
    });

    it('checkIncompleteRows does not emit loadMore when loading is true', () => {
      Object.defineProperty(mockRouter, 'url', {
        get: () => '/public/dashboard'
      });
      component.items = Array.from({ length: 4 }, (_, i) =>
        createMockItem(i + 1, `App${i + 1}`, 'E')
      );
      component.hasMorePages = true;
      component.loadingMore = false;
      component.loading = true;
      component.ngOnInit();

      const loadMoreSpy = jest.spyOn(component.loadMore, 'emit');
      component['checkIncompleteRows']();

      expect(loadMoreSpy).not.toHaveBeenCalled();
    });

    it('checkIncompleteRows emits loadMore when loading is false and row is incomplete', () => {
      Object.defineProperty(mockRouter, 'url', {
        get: () => '/public/dashboard'
      });
      component.items = Array.from({ length: 4 }, (_, i) =>
        createMockItem(i + 1, `App${i + 1}`, 'E')
      );
      component.hasMorePages = true;
      component.loadingMore = false;
      component.loading = false;
      component.ngOnInit();
      component['currentColumns'] = 3;

      const loadMoreSpy = jest.spyOn(component.loadMore, 'emit');
      component['checkIncompleteRows']();

      expect(loadMoreSpy).toHaveBeenCalled();
    });

    it('should cleanup observers on destroy', () => {
      Object.defineProperty(mockRouter, 'url', {
        get: () => '/public/dashboard'
      });
      component.items = [];
      component.ngOnInit();
      component.ngAfterViewInit();

      const mockObserver = {
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
        takeRecords: jest.fn()
      };
      component['observers'] = [mockObserver as any];

      component.ngOnDestroy();

      expect(mockObserver.disconnect).toHaveBeenCalled();
      expect(component['observers'].length).toBe(0);
    });
  });
});
