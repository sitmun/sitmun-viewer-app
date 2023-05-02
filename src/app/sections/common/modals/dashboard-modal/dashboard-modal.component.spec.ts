import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardModalComponent } from './dashboard-modal.component';

describe('DashboardDialogComponent', () => {
  let component: DashboardModalComponent;
  let fixture: ComponentFixture<DashboardModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
