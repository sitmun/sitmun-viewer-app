import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PublicDashboardComponent } from './public-dashboard.component';

describe('PublicDashboardComponent', () => {
  let component: PublicDashboardComponent;
  let fixture: ComponentFixture<PublicDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [PublicDashboardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PublicDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
