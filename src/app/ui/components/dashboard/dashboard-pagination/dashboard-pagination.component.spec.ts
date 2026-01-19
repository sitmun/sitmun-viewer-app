import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';
import { NgxPaginationModule } from 'ngx-pagination';

import { DashboardPaginationComponent } from './dashboard-pagination.component';

describe('DashboardPaginationComponent', () => {
  let component: DashboardPaginationComponent;
  let fixture: ComponentFixture<DashboardPaginationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), NgxPaginationModule],
      declarations: [DashboardPaginationComponent]
    });
    fixture = TestBed.createComponent(DashboardPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
