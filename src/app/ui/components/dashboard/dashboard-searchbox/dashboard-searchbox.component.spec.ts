import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSearchboxComponent } from './dashboard-searchbox.component';

describe('DashboardSearchboxComponent', () => {
  let component: DashboardSearchboxComponent;
  let fixture: ComponentFixture<DashboardSearchboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardSearchboxComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardSearchboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
