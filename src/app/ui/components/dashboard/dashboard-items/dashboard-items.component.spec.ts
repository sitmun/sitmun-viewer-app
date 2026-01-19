import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { DashboardItem } from '@api/services/common.service';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardItemComponent } from '@ui/components/dashboard/dashboard-item/dashboard-item.component';
import { DashboardTerritorySelectionDialogComponent } from '@ui/components/dashboard/dashboard-territory-selection-dialog/dashboard-territory-selection-dialog.component';
import { AppConfigService } from 'src/app/services/app-config.service';

import { DashboardItemsComponent } from './dashboard-items.component';

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
    creator: 'test',
    headerParams: {}
  });

  beforeEach(async () => {
    mockRouter = {
      url: '/user/dashboard'
    } as Partial<Router> as jest.Mocked<Router>;
    mockAppConfigService = {
      isFilteringEnabled: jest.fn(),
      getAllowedTypes: jest.fn()
    } as Partial<
      jest.Mocked<AppConfigService>
    > as jest.Mocked<AppConfigService>;

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        MatDialogModule
      ],
      declarations: [
        DashboardItemsComponent,
        DashboardItemComponent,
        DashboardTerritorySelectionDialogComponent
      ],
      providers: [
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

      component.items = [
        createMockItem(1, 'App1', 'I'),
        createMockItem(2, 'App2', 'E'),
        createMockItem(3, 'App3', 'I')
      ];

      component.displayAllApplications(true);

      expect(component.allItems.length).toBe(2);
      expect(component.totalItems).toBe(2);
    });
  });

  describe('displayAllApplicationsPrivate', () => {
    it('should apply type filtering before filtering by private/public', () => {
      mockAppConfigService.isFilteringEnabled.mockReturnValue(true);
      mockAppConfigService.getAllowedTypes.mockReturnValue(['I']);

      component.items = [
        createMockItem(1, 'App1', 'I', true),
        createMockItem(2, 'App2', 'E', true),
        createMockItem(3, 'App3', 'I', false),
        createMockItem(4, 'App4', 'E', false)
      ];

      component.displayAllApplicationsPrivate(true, true);

      expect(component.privateItems.length).toBe(1);
      expect(component.totalPrivateItems).toBe(1);
      expect(component.privateItems[0].name).toBe('App1');
    });

    it('should handle public items with type filtering', () => {
      mockAppConfigService.isFilteringEnabled.mockReturnValue(true);
      mockAppConfigService.getAllowedTypes.mockReturnValue(['I']);

      component.items = [
        createMockItem(1, 'App1', 'I', true),
        createMockItem(2, 'App2', 'E', true),
        createMockItem(3, 'App3', 'I', false),
        createMockItem(4, 'App4', 'E', false)
      ];

      component.displayAllApplicationsPrivate(true, false);

      expect(component.publicItems.length).toBe(1);
      expect(component.totalPublicItems).toBe(1);
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

  describe('isDashboard', () => {
    it('should return true for user dashboard route', () => {
      Object.defineProperty(mockRouter, 'url', {
        get: () => '/user/dashboard'
      });

      expect(component.isDashboard()).toBe(true);
    });

    it('should return true for public dashboard route', () => {
      Object.defineProperty(mockRouter, 'url', {
        get: () => '/public/dashboard'
      });

      expect(component.isDashboard()).toBe(true);
    });

    it('should return false for non-dashboard routes', () => {
      Object.defineProperty(mockRouter, 'url', {
        get: () => '/user/map'
      });

      expect(component.isDashboard()).toBe(false);
    });
  });
});
