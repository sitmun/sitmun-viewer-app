import { Location } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';

import { AccountService } from '@api/services/account.service';
import { CommonService } from '@api/services/common.service';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';

import { ApplicationComponent } from './application.component';

describe('ApplicationComponent', () => {
  let component: ApplicationComponent;
  let fixture: ComponentFixture<ApplicationComponent>;
  let commonService: jest.Mocked<
    Pick<CommonService, 'fetchDashboardItems' | 'fetchTerritoriesByApplication'>
  >;

  beforeEach(() => {
    commonService = {
      fetchDashboardItems: jest.fn().mockReturnValue(of({ content: [] })),
      fetchTerritoriesByApplication: jest
        .fn()
        .mockReturnValue(of({ content: [] }))
    };

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [ApplicationComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Router,
          useValue: {
            navigate: jest.fn(),
            navigateByUrl: jest.fn(),
            url: '/user/application/1'
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'applicationId' ? '1' : null)
              }
            }
          }
        },
        {
          provide: Location,
          useValue: {
            back: jest.fn()
          }
        },
        {
          provide: CommonService,
          useValue: {
            ...commonService,
            message$: of(null)
          }
        },
        {
          provide: AccountService,
          useValue: {
            getUserByID: jest
              .fn()
              .mockReturnValue(of({ username: 'test' } as any)),
            getUserByIDPublic: jest
              .fn()
              .mockReturnValue(of({ username: 'test' } as any))
          }
        },
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
    fixture = TestBed.createComponent(ApplicationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('loads territories for internal applications', () => {
    commonService.fetchDashboardItems.mockReturnValue(
      of({
        content: [{ id: 1, type: 'I', name: 'Internal app' }],
        totalElements: 1
      } as any)
    );

    fixture = TestBed.createComponent(ApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(commonService.fetchTerritoriesByApplication).toHaveBeenCalledWith(1);
  });

  it('skips territories for external applications', () => {
    commonService.fetchDashboardItems.mockReturnValue(
      of({
        content: [
          {
            id: 1,
            type: 'E',
            name: 'Geoportal IDEE',
            externalUrl: 'https://www.idee.es'
          }
        ],
        totalElements: 1
      } as any)
    );

    fixture = TestBed.createComponent(ApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(commonService.fetchTerritoriesByApplication).not.toHaveBeenCalled();
    expect(component.isExternalLink()).toBe(true);
  });

  it('sets notFound when application id is missing from list', () => {
    commonService.fetchDashboardItems.mockReturnValue(
      of({ content: [], totalElements: 0 })
    );

    fixture = TestBed.createComponent(ApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.notFound).toBe(true);
    expect(component.application).toBeUndefined();
  });
});
