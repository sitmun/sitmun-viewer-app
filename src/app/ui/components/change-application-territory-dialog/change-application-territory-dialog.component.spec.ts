import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonService } from '@api/services/common.service';
import { NotificationService } from 'src/app/notifications/services/NotificationService';
import { AppConfigService } from 'src/app/services/app-config.service';
import { of } from 'rxjs';

import { ChangeApplicationTerritoryDialogComponent } from './change-application-territory-dialog.component';

describe('ChangeApplicationTerritoryDialogComponent', () => {
  let component: ChangeApplicationTerritoryDialogComponent;
  let fixture: ComponentFixture<ChangeApplicationTerritoryDialogComponent>;

  beforeEach(() => {
    const mockCommonService = jasmine.createSpyObj('CommonService', [
      'fetchDashboardItems',
      'fetchTerritoriesByApplication'
    ]);
    mockCommonService.fetchDashboardItems.and.returnValue(of({ content: [] }));
    mockCommonService.fetchTerritoriesByApplication.and.returnValue(
      of({ content: [] })
    );

    const mockAppConfigService = jasmine.createSpyObj('AppConfigService', [
      'getDashboardConfig'
    ]);
    mockAppConfigService.getDashboardConfig.and.returnValue(null);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        MatDialogModule
      ],
      declarations: [ChangeApplicationTerritoryDialogComponent],
      providers: [
        {
          provide: Router,
          useValue: jasmine.createSpyObj(
            'Router',
            ['navigate', 'navigateByUrl'],
            {
              url: '/user/dashboard',
              routerState: {
                snapshot: { root: { firstChild: null, params: {} } }
              }
            }
          )
        },
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpyObj('MatDialogRef', ['close'])
        },
        { provide: CommonService, useValue: mockCommonService },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', [
            'error',
            'success',
            'info',
            'warning'
          ])
        },
        { provide: AppConfigService, useValue: mockAppConfigService }
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
});
