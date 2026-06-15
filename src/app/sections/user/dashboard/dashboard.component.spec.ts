import { NgOptimizedImage } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';

import { CommonService } from '@api/services/common.service';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardItemComponent } from '@ui/components/dashboard/dashboard-item/dashboard-item.component';
import { DashboardItemsComponent } from '@ui/components/dashboard/dashboard-items/dashboard-items.component';
import { DashboardSearchboxComponent } from '@ui/components/dashboard/dashboard-searchbox/dashboard-searchbox.component';
import { OpenModalService } from '@ui/modal/service/open-modal.service';
import { of } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NgOptimizedImage,
        TranslateModule.forRoot(),
        MatDialogModule,
        MatTabsModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        NoopAnimationsModule,
        FormsModule
      ],
      declarations: [
        DashboardComponent,
        DashboardItemsComponent,
        DashboardItemComponent,
        DashboardSearchboxComponent
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Router,
          useValue: {
            navigate: jest.fn(),
            navigateByUrl: jest.fn(),
            url: '/user/dashboard'
          }
        },
        {
          provide: CommonService,
          useValue: {
            fetchDashboardItems: jest
              .fn()
              .mockReturnValue(of({ content: [], totalElements: 0 })),
            fetchDashboardApplications: jest
              .fn()
              .mockReturnValue(of({ content: [], totalElements: 0 })),
            fetchTerritoriesByApplication: jest
              .fn()
              .mockReturnValue(of({ content: [] })),
            clearTerritoriesCache: jest.fn(),
            message$: of(null)
          }
        },
        {
          provide: OpenModalService,
          useValue: { open: jest.fn() }
        },
        {
          provide: AppConfigService,
          useValue: {
            isFilteringEnabled: jest.fn().mockReturnValue(false),
            getAllowedTypes: jest.fn().mockReturnValue(['I']),
            getDashboardConfig: jest.fn().mockReturnValue({
              allowedTypes: ['I'],
              filteringEnabled: false,
              initialBatchSize: 12,
              batchIncrement: 6
            }),
            filterApplicationsByType: jest.fn((items: unknown[]) => items),
            applicationHasTerritory: jest.fn().mockReturnValue(true)
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
