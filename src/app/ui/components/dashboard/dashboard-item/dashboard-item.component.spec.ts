import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DashboardItemComponent } from './dashboard-item.component';

describe('DashboardItemComponent', () => {
  let component: DashboardItemComponent;
  let fixture: ComponentFixture<DashboardItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [DashboardItemComponent]
    });
    fixture = TestBed.createComponent(DashboardItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
