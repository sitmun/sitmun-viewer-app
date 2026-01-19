import { HttpClientTestingModule } from '@angular/common/http/testing';
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

  beforeEach(() => {
    const mockCommonService = {
      fetchDashboardItems: jest.fn().mockReturnValue(of({ content: [] })),
      fetchTerritoriesByApplication: jest
        .fn()
        .mockReturnValue(of({ content: [] }))
    };
    const mockAppConfigService = {
      getDashboardConfig: jest.fn().mockReturnValue(null)
    };

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
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
        {
          provide: Router,
          useValue: {
            navigate: jest.fn(),
            navigateByUrl: jest.fn(),
            url: '/user/dashboard',
            routerState: {
              snapshot: { root: { firstChild: null, params: {} } }
            }
          }
        },
        {
          provide: MatDialogRef,
          useValue: {
            close: jest.fn()
          }
        },
        { provide: CommonService, useValue: mockCommonService },
        {
          provide: NotificationService,
          useValue: {
            error: jest.fn(),
            success: jest.fn(),
            info: jest.fn(),
            warning: jest.fn()
          }
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
