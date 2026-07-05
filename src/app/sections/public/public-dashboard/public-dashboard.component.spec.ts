import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { CommonService } from '@api/services/common.service';
import { TranslateModule } from '@ngx-translate/core';
import { OpenModalService } from '@ui/modal/service/open-modal.service';
import { of } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';

import { PublicDashboardComponent } from './public-dashboard.component';

describe('PublicDashboardComponent', () => {
  let component: PublicDashboardComponent;
  let fixture: ComponentFixture<PublicDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MatDialogModule, FormsModule],
      declarations: [PublicDashboardComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Router,
          useValue: {
            navigate: jest.fn(),
            navigateByUrl: jest.fn(),
            url: '/public/dashboard'
          }
        },
        {
          provide: CommonService,
          useValue: {
            fetchDashboardItems: jest.fn().mockReturnValue(
              of({
                content: [
                  {
                    id: 1,
                    name: 'Menorca',
                    title: 'Menorca',
                    type: 'I',
                    appPrivate: false,
                    isUnavailable: false,
                    updateDate: new Date(),
                    createdDate: new Date(),
                    pointOfContact: 'u',
                    headerParams: {}
                  },
                  {
                    id: 2,
                    name: 'Navarra',
                    title: 'Navarra',
                    type: 'I',
                    appPrivate: false,
                    isUnavailable: false,
                    updateDate: new Date(),
                    createdDate: new Date(),
                    pointOfContact: 'u',
                    headerParams: {}
                  }
                ],
                totalElements: 2
              })
            ),
            fetchDashboardApplications: jest.fn().mockReturnValue(
              of({
                content: [
                  {
                    id: 1,
                    name: 'Menorca',
                    title: 'Menorca',
                    type: 'I',
                    appPrivate: false,
                    isUnavailable: false,
                    updateDate: new Date(),
                    createdDate: new Date(),
                    pointOfContact: 'u',
                    headerParams: {}
                  },
                  {
                    id: 2,
                    name: 'Navarra',
                    title: 'Navarra',
                    type: 'I',
                    appPrivate: false,
                    isUnavailable: false,
                    updateDate: new Date(),
                    createdDate: new Date(),
                    pointOfContact: 'u',
                    headerParams: {}
                  }
                ],
                totalElements: 2
              })
            ),
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
            filterApplicationsByType: (items: unknown[]) => items,
            getDashboardConfig: () => ({
              allowedTypes: ['I'],
              filteringEnabled: true,
              initialBatchSize: 12
            }),
            applicationHasTerritory: () => true
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PublicDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onKeywordsSearch with 2+ chars reloads dashboard applications with keywords', () => {
    const commonService = TestBed.inject(CommonService);
    const fetchSpy = commonService.fetchDashboardApplications as jest.Mock;
    fetchSpy.mockClear();
    fetchSpy.mockReturnValueOnce(
      of({
        content: [
          {
            id: 2,
            name: 'Navarra',
            title: 'Navarra',
            type: 'I',
            appPrivate: false,
            isUnavailable: false,
            updateDate: new Date(),
            createdDate: new Date(),
            pointOfContact: 'u',
            headerParams: {}
          }
        ],
        totalElements: 1,
        page: { number: 0, size: 12, totalPages: 1, totalElements: 1 }
      })
    );

    component.onKeywordsSearch('Navarra');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith({
      page: 0,
      size: 12,
      keywords: 'Navarra'
    });
    expect(component.items).toHaveLength(1);
    expect(component.items[0].name).toBe('Navarra');
  });
});
