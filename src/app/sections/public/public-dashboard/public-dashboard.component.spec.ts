import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { CommonService } from '@api/services/common.service';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardItemsComponent } from '@ui/components/dashboard/dashboard-items/dashboard-items.component';
import { DashboardSearchboxComponent } from '@ui/components/dashboard/dashboard-searchbox/dashboard-searchbox.component';
import { OpenModalService } from '@ui/modal/service/open-modal.service';
import { of } from 'rxjs';

import { PublicDashboardComponent } from './public-dashboard.component';

describe('PublicDashboardComponent', () => {
  let component: PublicDashboardComponent;
  let fixture: ComponentFixture<PublicDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        MatDialogModule,
        FormsModule
      ],
      declarations: [
        PublicDashboardComponent,
        DashboardItemsComponent,
        DashboardSearchboxComponent
      ],
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: jest.fn(),
            navigateByUrl: jest.fn(),
            url: '/public'
          }
        },
        {
          provide: CommonService,
          useValue: {
            fetchDashboardItems: jest.fn().mockReturnValue(of({ content: [] })),
            message$: of(null)
          }
        },
        {
          provide: OpenModalService,
          useValue: {
            open: jest.fn()
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
});
