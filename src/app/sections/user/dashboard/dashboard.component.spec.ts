import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

import { CommonService } from '@api/services/common.service';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardItemsComponent } from '@ui/components/dashboard/dashboard-items/dashboard-items.component';
import { DashboardSearchboxComponent } from '@ui/components/dashboard/dashboard-searchbox/dashboard-searchbox.component';
import { OpenModalService } from '@ui/modal/service/open-modal.service';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        MatDialogModule,
        FormsModule
      ],
      declarations: [
        DashboardComponent,
        DashboardItemsComponent,
        DashboardSearchboxComponent
      ],
      providers: [
        {
          provide: CommonService,
          useValue: {
            fetchDashboardItems: jest
              .fn()
              .mockReturnValue(of({ content: [], totalElements: 0 })),
            fetchTerritoriesByApplication: jest
              .fn()
              .mockReturnValue(of({ content: [] }))
          }
        },
        {
          provide: OpenModalService,
          useValue: { open: jest.fn() }
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
