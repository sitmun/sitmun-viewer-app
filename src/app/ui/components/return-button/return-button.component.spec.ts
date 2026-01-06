import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ReturnButtonComponent } from './return-button.component';

describe('ReturnButtonComponent', () => {
  let component: ReturnButtonComponent;
  let fixture: ComponentFixture<ReturnButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReturnButtonComponent],
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        MatIconModule,
        MatButtonModule,
        MatTooltipModule
      ],
      providers: [
        {
          provide: Location,
          useValue: jasmine.createSpyObj('Location', ['back', 'forward'])
        },
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
