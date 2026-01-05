import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Location } from '@angular/common';

import { ReturnButtonComponent } from './return-button.component';

describe('ReturnButtonComponent', () => {
  let component: ReturnButtonComponent;
  let fixture: ComponentFixture<ReturnButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReturnButtonComponent],
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: Location, useValue: jasmine.createSpyObj('Location', ['back', 'forward']) },
        TranslateService
      ]
    });
    fixture = TestBed.createComponent(ReturnButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
