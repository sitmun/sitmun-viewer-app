import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPaginationComponent } from './dashboard-pagination.component';

describe('DashboardPaginationComponent', () => {
  let component: DashboardPaginationComponent;
  let fixture: ComponentFixture<DashboardPaginationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
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
