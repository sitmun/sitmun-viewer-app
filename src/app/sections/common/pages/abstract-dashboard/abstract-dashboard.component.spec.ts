import { Directive } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import {
  CommonService,
  DashboardItem
} from '@api/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { OpenModalService } from '@ui/modal/service/open-modal.service';
import { Subject, of, throwError } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';

import { AbstractDashboardComponent } from './abstract-dashboard.component';

@Directive()
class TestDashboardComponent extends AbstractDashboardComponent {
  constructor(
    router: Router,
    commonService: CommonService,
    modal: OpenModalService
  ) {
    super(router, commonService, modal);
  }
}

function dashboardItem(id: number, name: string): DashboardItem {
  return {
    id,
    name,
    title: name,
    appPrivate: false,
    isUnavailable: false,
    updateDate: new Date(),
    createdDate: new Date(),
    pointOfContact: 'u',
    headerParams: {}
  };
}

describe('AbstractDashboardComponent', () => {
  let component: TestDashboardComponent;
  let fetchDashboardItems: jest.Mock;
  let fetchDashboardApplications: jest.Mock;

  beforeEach(() => {
    fetchDashboardItems = jest.fn().mockReturnValue(
      of({
        content: [
          dashboardItem(1, 'Menorca App'),
          dashboardItem(2, 'Navarra Geoportal')
        ],
        totalElements: 2
      })
    );

    fetchDashboardApplications = jest.fn().mockReturnValue(
      of({
        content: [
          dashboardItem(1, 'Menorca App'),
          dashboardItem(2, 'Navarra Geoportal')
        ],
        totalElements: 2
      })
    );

    TestBed.configureTestingModule({
      providers: [
        TestDashboardComponent,
        {
          provide: Router,
          useValue: { url: '/public/dashboard' }
        },
        {
          provide: CommonService,
          useValue: { 
            fetchDashboardItems, 
            fetchDashboardApplications,
            clearTerritoriesCache: jest.fn()
          }
        },
        {
          provide: OpenModalService,
          useValue: {}
        },
        {
          provide: TranslateService,
          useValue: { onLangChange: new Subject() }
        },
        {
          provide: AppConfigService,
          useValue: {
            getDashboardConfig: jest.fn().mockReturnValue({
              initialBatchSize: 12,
              batchIncrement: 6,
              allowedTypes: ['I', 'E'],
              filteringEnabled: true
            }),
            filterApplicationsByType: jest.fn((items: DashboardItem[]) => items)
          }
        }
      ]
    });

    component = TestBed.inject(TestDashboardComponent);
    component.ngOnInit();
  });

  it('loads all items without keyword query param', () => {
    expect(fetchDashboardApplications).toHaveBeenCalledWith({ 
      page: 0, 
      size: 12 
    });
    expect(component.allItems).toHaveLength(2);
    expect(component.items).toHaveLength(2);
  });

  it('filters displayed items client-side on single-character keyword search', () => {
    component.onKeywordsSearch('v');

    expect(fetchDashboardApplications).toHaveBeenCalledTimes(1);
    expect(component.items).toHaveLength(1);
    expect(component.items[0].name).toBe('Navarra Geoportal');
  });

  it('onKeywordsSearch with 2+ chars reloads dashboard applications with keywords', () => {
    fetchDashboardApplications.mockReturnValueOnce(
      of({
        content: [dashboardItem(3, 'Remote App')],
        totalElements: 1,
        page: { number: 0, size: 12, totalPages: 1, totalElements: 1 }
      })
    );

    component.onKeywordsSearch('Remote');

    expect(component.loading).toBe(false);
    expect(fetchDashboardApplications).toHaveBeenLastCalledWith({
      page: 0,
      size: 12,
      keywords: 'Remote'
    });
    expect(component.items).toHaveLength(1);
    expect(component.items[0].name).toBe('Remote App');
  });

  it('keyword search stores full dashboard application results', () => {
    const remoteApp: DashboardItem = {
      ...dashboardItem(3, 'Remote App'),
      territoryCount: 1,
      singleTerritoryId: 99,
      hasTerritories: true
    };
    fetchDashboardApplications.mockReturnValueOnce(
      of({
        content: [remoteApp],
        totalElements: 1,
        page: { number: 0, size: 12, totalPages: 1, totalElements: 1 }
      })
    );

    component.onKeywordsSearch('Remote');

    expect(component.items[0].territoryCount).toBe(1);
    expect(component.items[0].singleTerritoryId).toBe(99);
    expect(component.items[0].hasTerritories).toBe(true);
  });

  it('onKeywordsSearch empty restores unfiltered page 0', () => {
    fetchDashboardApplications.mockReturnValueOnce(
      of({
        content: [dashboardItem(3, 'Remote App')],
        totalElements: 1
      })
    );
    component.onKeywordsSearch('Remote');
    fetchDashboardApplications.mockClear();

    component.onKeywordsSearch('');

    expect(fetchDashboardApplications).toHaveBeenCalledWith({ page: 0, size: 12 });
  });

  it('loadMore while searching keeps same keywords', () => {
    const page0 = Array.from({ length: 12 }, (_, i) =>
      dashboardItem(i + 1, `Remote ${i + 1}`)
    );
    fetchDashboardApplications
      .mockReturnValueOnce(of({ content: page0, totalElements: 13, page: { number: 0, size: 12, totalPages: 2, totalElements: 13 } }))
      .mockReturnValueOnce(
        of({
          content: [dashboardItem(13, 'Remote 13')],
          totalElements: 13,
          page: { number: 1, size: 12, totalPages: 2, totalElements: 13 }
        })
      );

    component.onKeywordsSearch('Remote');
    component.loadMoreItems();

    expect(fetchDashboardApplications).toHaveBeenLastCalledWith({
      page: 1,
      size: 12,
      keywords: 'Remote'
    });
  });

  it('clears filter when keyword is empty', () => {
    component.onKeywordsSearch('Navarra');
    component.onKeywordsSearch('');

    expect(component.items).toHaveLength(2);
  });

  it('sets loadError when fetch fails', () => {
    fetchDashboardApplications.mockReturnValueOnce(
      throwError(() => new Error('network'))
    );
    component.loadItems();

    expect(component.loadError).toBe(true);
    expect(component.loading).toBe(false);
  });

  describe('pagination', () => {
    function pageResponse(
      content: DashboardItem[],
      pageNumber: number,
      totalPages: number
    ) {
      return {
        content,
        totalElements: totalPages * 12,
        page: {
          number: pageNumber,
          size: 12,
          totalPages,
          totalElements: totalPages * 12
        }
      };
    }

    beforeEach(() => {
      fetchDashboardApplications.mockReset();
    });

    it('loadMoreItems requests page 1 with size 12 after 12 items loaded', () => {
      const page0 = Array.from({ length: 12 }, (_, i) =>
        dashboardItem(i + 1, `App ${i + 1}`)
      );
      fetchDashboardApplications
        .mockReturnValueOnce(of(pageResponse(page0, 0, 2)))
        .mockReturnValueOnce(
          of(pageResponse([dashboardItem(13, 'App 13')], 1, 2))
        );

      component.loadItems();
      component.loadMoreItems();

      expect(fetchDashboardApplications).toHaveBeenNthCalledWith(1, {
        page: 0,
        size: 12
      });
      expect(fetchDashboardApplications).toHaveBeenNthCalledWith(2, {
        page: 1,
        size: 12
      });
    });

    it('loadMoreItems does not duplicate items when batchIncrement differs from initialBatchSize', () => {
      const page0 = Array.from({ length: 12 }, (_, i) =>
        dashboardItem(i + 1, `App ${i + 1}`)
      );
      const page1 = Array.from({ length: 6 }, (_, i) =>
        dashboardItem(i + 13, `App ${i + 13}`)
      );
      fetchDashboardApplications
        .mockReturnValueOnce(of(pageResponse(page0, 0, 2)))
        .mockReturnValueOnce(of(pageResponse(page1, 1, 2)));

      component.loadItems();
      component.loadMoreItems();

      const ids = component.allItems.map((item) => item.id);
      expect(new Set(ids).size).toBe(18);
      expect(ids).toEqual([...Array.from({ length: 18 }, (_, i) => i + 1)]);
    });

    it('hasMorePages is false when page.number + 1 >= totalPages even if last page is full', () => {
      const page0 = Array.from({ length: 12 }, (_, i) =>
        dashboardItem(i + 1, `App ${i + 1}`)
      );
      fetchDashboardApplications.mockReturnValue(
        of(pageResponse(page0, 0, 1))
      );

      component.loadItems();

      expect(component.hasMorePages).toBe(false);
      fetchDashboardApplications.mockClear();
      component.loadMoreItems();
      expect(fetchDashboardApplications).not.toHaveBeenCalled();
    });

    it('hasMorePages uses page.totalElements when top-level totalElements is absent', () => {
      const page0 = Array.from({ length: 3 }, (_, i) =>
        dashboardItem(i + 1, `App ${i + 1}`)
      );
      fetchDashboardApplications.mockReturnValueOnce(
        of({
          content: page0,
          page: { number: 0, size: 3, totalPages: 4, totalElements: 12 }
        })
      );

      component.loadItems();

      expect(component.hasMorePages).toBe(true);
    });

    it('loadMoreItems requests sequential pages using lastLoadedPage', () => {
      const page0 = Array.from({ length: 3 }, (_, i) =>
        dashboardItem(i + 1, `App ${i + 1}`)
      );
      fetchDashboardApplications
        .mockReturnValueOnce(
          of({
            content: page0,
            page: { number: 0, size: 3, totalPages: 4, totalElements: 12 }
          })
        )
        .mockReturnValueOnce(
          of({
            content: [dashboardItem(4, 'App 4')],
            page: { number: 1, size: 3, totalPages: 4, totalElements: 12 }
          })
        );

      component.loadItems();
      component.loadMoreItems();

      expect(fetchDashboardApplications).toHaveBeenNthCalledWith(1, {
        page: 0,
        size: 12
      });
      expect(fetchDashboardApplications).toHaveBeenNthCalledWith(2, {
        page: 1,
        size: 12
      });
    });

    it('loadMoreItems is no-op while loading is true', () => {
      component.loading = true;
      fetchDashboardApplications.mockClear();

      component.loadMoreItems();

      expect(fetchDashboardApplications).not.toHaveBeenCalled();
    });

    it('loadMore error keeps hasMorePages true and allows retry', () => {
      const page0 = Array.from({ length: 12 }, (_, i) =>
        dashboardItem(i + 1, `App ${i + 1}`)
      );
      fetchDashboardApplications
        .mockReturnValueOnce(of(pageResponse(page0, 0, 2)))
        .mockReturnValueOnce(throwError(() => new Error('network')))
        .mockReturnValueOnce(
          of(pageResponse([dashboardItem(13, 'App 13')], 1, 2))
        );

      component.loadItems();
      expect(component.hasMorePages).toBe(true);

      component.loadMoreItems();
      expect(component.loadError).toBe(true);
      expect(component.hasMorePages).toBe(true);

      component.loadMoreItems();
      expect(component.allItems).toHaveLength(13);
    });
  });
});
