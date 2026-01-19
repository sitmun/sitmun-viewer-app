import { Location } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';

import { AccountService } from '@api/services/account.service';
import { CommonService } from '@api/services/common.service';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { ApplicationComponent } from './application.component';

describe('ApplicationComponent', () => {
  let component: ApplicationComponent;
  let fixture: ComponentFixture<ApplicationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      declarations: [ApplicationComponent],
      providers: [
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
            fetchDashboardItems: jest.fn().mockReturnValue(of({ content: [] })),
            fetchTerritoriesByApplication: jest
              .fn()
              .mockReturnValue(of({ content: [] })),
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
        }
      ]
    });
    fixture = TestBed.createComponent(ApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
