import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CommonService } from '@api/services/common.service';
import { AccountService } from '@api/services/account.service';

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
          useValue: jasmine.createSpyObj(
            'Router',
            ['navigate', 'navigateByUrl'],
            {
              url: '/user/application/1'
            }
          )
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
          useValue: jasmine.createSpyObj('Location', ['back'])
        },
        {
          provide: CommonService,
          useValue: jasmine.createSpyObj('CommonService', [
            'fetchDashboardItems',
            'fetchTerritoriesByApplication'
          ])
        },
        {
          provide: AccountService,
          useValue: jasmine.createSpyObj('AccountService', [
            'getUserByID',
            'getUserByIDPublic'
          ])
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
