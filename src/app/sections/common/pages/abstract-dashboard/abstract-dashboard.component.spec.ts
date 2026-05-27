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
    creator: 'u',
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
            })
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

  it('filters displayed items client-side on keyword search', () => {
    component.onKeywordsSearch('Navarra');

    expect(fetchDashboardApplications).toHaveBeenCalledTimes(1);
    expect(component.items).toHaveLength(1);
    expect(component.items[0].name).toBe('Navarra Geoportal');
    expect(component.allItems).toHaveLength(2);
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
});
