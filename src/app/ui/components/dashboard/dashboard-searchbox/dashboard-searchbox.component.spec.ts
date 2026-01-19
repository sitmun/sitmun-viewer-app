import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';

import { DashboardSearchboxComponent } from './dashboard-searchbox.component';

describe('DashboardSearchboxComponent', () => {
  let component: DashboardSearchboxComponent;
  let fixture: ComponentFixture<DashboardSearchboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        FormsModule
      ],
      declarations: [DashboardSearchboxComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardSearchboxComponent);
    component = fixture.componentInstance;
    // Initialize applications array to prevent forEach error in ngOnInit
    component.applications = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
