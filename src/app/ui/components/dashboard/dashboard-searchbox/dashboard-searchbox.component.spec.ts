import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DashboardSearchboxComponent } from './dashboard-searchbox.component';

describe('DashboardSearchboxComponent', () => {
  let component: DashboardSearchboxComponent;
  let fixture: ComponentFixture<DashboardSearchboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
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
