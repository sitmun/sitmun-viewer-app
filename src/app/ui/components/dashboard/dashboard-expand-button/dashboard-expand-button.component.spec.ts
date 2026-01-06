import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DashboardExpandButtonComponent } from './dashboard-expand-button.component';

describe('DashboardExpandButtonComponent', () => {
  let component: DashboardExpandButtonComponent;
  let fixture: ComponentFixture<DashboardExpandButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      declarations: [DashboardExpandButtonComponent]
    });
    fixture = TestBed.createComponent(DashboardExpandButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
