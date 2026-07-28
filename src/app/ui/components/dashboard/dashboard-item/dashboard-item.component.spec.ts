import { NgOptimizedImage } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { CommonService } from '@api/services/common.service';
import {
  TranslateLoader,
  TranslateModule,
  TranslateFakeLoader
} from '@ngx-translate/core';
import { of } from 'rxjs';
import { NotificationService } from 'src/app/notifications/services/NotificationService';
import { AppConfigService } from 'src/app/services/app-config.service';

import { DashboardItemComponent } from './dashboard-item.component';

describe('DashboardItemComponent', () => {
  let component: DashboardItemComponent;
  let fixture: ComponentFixture<DashboardItemComponent>;
  let router: { navigateByUrl: jest.Mock; url: string };
  let tagSpy: jest.SpyInstance;
  let notificationService: {
    warning: jest.Mock;
    error: jest.Mock;
    success: jest.Mock;
  };

  beforeEach(() => {
    router = {
      navigateByUrl: jest.fn(),
      url: '/user/dashboard'
    };
    notificationService = {
      warning: jest.fn(),
      error: jest.fn(),
      success: jest.fn()
    };

    TestBed.configureTestingModule({
      imports: [
        NgOptimizedImage,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
        MatCardModule,
        MatButtonModule,
        MatIconModule
      ],
      declarations: [DashboardItemComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
        {
          provide: CommonService,
          useValue: {
            fetchTerritoriesByApplication: jest
              .fn()
              .mockReturnValue(of({ content: [] }))
          }
        },
        { provide: NotificationService, useValue: notificationService },
        {
          provide: AppConfigService,
          useValue: {
            isExternalLinkApplication: jest.fn(
              (app: { type?: string }) => app.type === 'E'
            ),
            applicationHasTerritory: jest.fn(
              (app: { type?: string }) => app.type !== 'E'
            )
          }
        }
      ]
    });
    fixture = TestBed.createComponent(DashboardItemComponent);
    component = fixture.componentInstance;
    tagSpy = jest.spyOn(component.tag, 'emit');
    component.item = {
      id: 1,
      name: 'Test App',
      type: 'I',
      appPrivate: false,
      isUnavailable: false,
      updateDate: new Date(),
      createdDate: new Date(),
      pointOfContact: 'gis-office@example.com',
      headerParams: {}
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens external URL in a new tab for type E', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    component.item = {
      ...component.item,
      type: 'E',
      externalUrl: 'https://www.idee.es'
    };
    component.territoriesLoaded = true;

    component.navigateToMap(component.item.id);

    expect(openSpy).toHaveBeenCalledWith(
      'https://www.idee.es',
      '_blank',
      'noopener,noreferrer'
    );
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('warns when external application has no URL', () => {
    component.item = { ...component.item, type: 'E', externalUrl: undefined };
    component.territoriesLoaded = true;

    component.navigateToMap(component.item.id);

    expect(notificationService.warning).toHaveBeenCalled();
  });

  it('navigates to map for internal applications', () => {
    component.listOfTerritories = [{ id: 4, name: 'T' }];
    component.nbTerritory = 1;
    component.territoriesLoaded = true;

    component.navigateToMap(component.item.id);

    expect(router.navigateByUrl).toHaveBeenCalledWith('/user/map/1/4');
  });

  it('does not open territory dialog before territories load', () => {
    component.territoriesLoading = true;
    component.territoriesLoaded = false;
    component.nbTerritory = 0;

    component.navigateToMap(component.item.id);

    expect(tagSpy).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('notifies when internal app has no territories after load', () => {
    component.territoriesLoaded = true;
    component.territoriesLoading = false;
    component.nbTerritory = 0;
    component.listOfTerritories = [];

    component.navigateToMap(component.item.id);

    expect(notificationService.warning).toHaveBeenCalled();
    expect(tagSpy).not.toHaveBeenCalled();
  });

  it('syncs nbTerritory when item input changes after init', () => {
    component.item = {
      ...component.item,
      territoryCount: 1,
      singleTerritoryId: 10
    };
    component.ngOnInit();
    expect(component.nbTerritory).toBe(1);

    component.item = {
      ...component.item,
      id: 2,
      territoryCount: 3,
      singleTerritoryId: undefined
    };
    component.ngOnChanges({
      item: {
        previousValue: { territoryCount: 1 },
        currentValue: component.item,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.nbTerritory).toBe(3);
    expect(component.listOfTerritories).toEqual([]);
  });

  it('updates singleTerritoryId list when item changes', () => {
    component.item = {
      ...component.item,
      territoryCount: 1,
      singleTerritoryId: 10
    };
    component.ngOnInit();

    component.item = {
      ...component.item,
      singleTerritoryId: 42
    };
    component.ngOnChanges({
      item: {
        previousValue: { singleTerritoryId: 10 },
        currentValue: component.item,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.listOfTerritories).toEqual([{ id: 42, name: '' }]);
  });
});
