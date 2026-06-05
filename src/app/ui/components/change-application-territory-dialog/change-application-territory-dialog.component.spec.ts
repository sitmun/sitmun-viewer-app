import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';

import { CommonService } from '@api/services/common.service';
import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule
} from '@ngx-translate/core';
import { of } from 'rxjs';
import { NotificationService } from 'src/app/notifications/services/NotificationService';
import { AppConfigService } from 'src/app/services/app-config.service';

import { ChangeApplicationTerritoryDialogComponent } from './change-application-territory-dialog.component';
import { SelectableListComponent } from '../selectable-list/selectable-list.component';

describe('ChangeApplicationTerritoryDialogComponent', () => {
  let component: ChangeApplicationTerritoryDialogComponent;
  let fixture: ComponentFixture<ChangeApplicationTerritoryDialogComponent>;
  let mockCommonService: {
    fetchDashboardItems: jest.Mock;
    fetchTerritoriesByApplication: jest.Mock;
  };
  let mockRouter: { navigateByUrl: jest.Mock; url: string; routerState: any };

  let mockAppConfigService: {
    getMapSwitcherConfig: jest.Mock;
    filterApplicationsByType: jest.Mock;
    isExternalLinkApplication: jest.Mock;
    applicationHasTerritory: jest.Mock;
  };

  beforeEach(() => {
    mockCommonService = {
      fetchDashboardItems: jest.fn().mockReturnValue(of({ content: [] })),
      fetchTerritoriesByApplication: jest
        .fn()
        .mockReturnValue(of({ content: [] }))
    };
    mockAppConfigService = {
      getMapSwitcherConfig: jest.fn().mockReturnValue({
        allowedTypes: ['I'],
        filteringEnabled: true
      }),
      filterApplicationsByType: jest.fn((items, config) => {
        if (!config.filteringEnabled) {
          return items;
        }
        return items.filter(
          (item: { type?: string }) =>
            item.type != null && config.allowedTypes.includes(item.type)
        );
      }),
      isExternalLinkApplication: jest.fn(
        (app: { type?: string }) => app.type === 'E'
      ),
      applicationHasTerritory: jest.fn(
        (app: { type?: string }) => app.type !== 'E'
      )
    };
    mockRouter = {
      navigateByUrl: jest.fn(),
      url: '/user/map/1/4',
      routerState: {
        snapshot: {
          root: {
            firstChild: {
              firstChild: null,
              params: { applicationId: '1', territoryId: '4' }
            },
            params: {}
          }
        }
      }
    };
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        FormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
        MatDialogModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatListModule,
        MatIconModule,
        MatButtonModule
      ],
      declarations: [
        ChangeApplicationTerritoryDialogComponent,
        SelectableListComponent
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: MatDialogRef,
          useValue: {
            close: jest.fn()
          }
        },
        { provide: CommonService, useValue: mockCommonService },
        { provide: AppConfigService, useValue: mockAppConfigService },
        {
          provide: NotificationService,
          useValue: {
            error: jest.fn(),
            success: jest.fn(),
            info: jest.fn(),
            warning: jest.fn()
          }
        }
      ]
    });
    fixture = TestBed.createComponent(
      ChangeApplicationTerritoryDialogComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads territories only for internal applications', () => {
    mockCommonService.fetchDashboardItems.mockReturnValue(
      of({
        content: [{ id: 1, type: 'I', name: 'Internal app', title: 'Internal' }]
      } as any)
    );

    fixture = TestBed.createComponent(
      ChangeApplicationTerritoryDialogComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockCommonService.fetchTerritoriesByApplication).toHaveBeenCalledWith(
      1
    );
    expect(component.showTerritorySelection()).toBe(true);
  });

  it('excludes external link applications from the switcher list', () => {
    mockCommonService.fetchDashboardItems.mockReturnValue(
      of({
        content: [
          {
            id: 1,
            type: 'I',
            name: 'Internal app',
            title: 'Internal app',
            isUnavailable: false
          },
          {
            id: 20,
            type: 'E',
            name: 'Geoportal IDEE',
            title: 'Geoportal IDEE',
            externalUrl: 'https://www.idee.es',
            isUnavailable: false
          }
        ]
      } as any)
    );

    fixture = TestBed.createComponent(
      ChangeApplicationTerritoryDialogComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.groupedApplications[0].items).toHaveLength(1);
    expect(component.groupedApplications[0].items[0].id).toBe(1);
  });
});
