import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { CommonService } from '@api/services/common.service';
import { TranslateModule } from '@ngx-translate/core';
import { OpenModalService } from '@ui/modal/service/open-modal.service';

import { PublicDashboardComponent } from './public-dashboard.component';

describe('PublicDashboardComponent', () => {
  let component: PublicDashboardComponent;
  let fixture: ComponentFixture<PublicDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      declarations: [PublicDashboardComponent],
      providers: [
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', [
            'navigate',
            'navigateByUrl'
          ])
        },
        {
          provide: CommonService,
          useValue: jasmine.createSpyObj('CommonService', [
            'fetchDashboardItems',
            'message$'
          ])
        },
        {
          provide: OpenModalService,
          useValue: jasmine.createSpyObj('OpenModalService', ['open'])
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
});
