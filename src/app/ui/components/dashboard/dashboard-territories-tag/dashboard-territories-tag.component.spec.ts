import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTerritoriesTagComponent } from './dashboard-territories-tag.component';

describe('DashboardTerritoriesTagComponent', () => {
  let component: DashboardTerritoriesTagComponent;
  let fixture: ComponentFixture<DashboardTerritoriesTagComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardTerritoriesTagComponent]
    });
    fixture = TestBed.createComponent(DashboardTerritoriesTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
