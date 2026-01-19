import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

import { TranslateModule } from '@ngx-translate/core';
import { DashboardItemsComponent } from '@ui/components/dashboard/dashboard-items/dashboard-items.component';
import { DashboardSearchboxComponent } from '@ui/components/dashboard/dashboard-searchbox/dashboard-searchbox.component';

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
