import { NgOptimizedImage } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthenticationService } from '@auth/services/authentication.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormFieldInputComponent } from '@ui/components/form-field-input/form-field-input.component';
import { PrimaryButtonComponent } from '@ui/components/primary-button/primary-button.component';
import { SecondaryButtonComponent } from '@ui/components/secondary-button/secondary-button.component';
import { of } from 'rxjs';
import { NotificationService } from 'src/app/notifications/services/NotificationService';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        NgOptimizedImage,
        MatIconModule
      ],
      declarations: [
        LoginComponent,
        PrimaryButtonComponent,
        SecondaryButtonComponent,
        FormFieldInputComponent
      ],
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: jest.fn(),
            navigateByUrl: jest.fn()
          }
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: {} } }
        },
        {
          provide: AuthenticationService,
          useValue: {
            login: jest.fn(),
            isLoggedIn: jest.fn(),
            getAuthConfig: jest.fn(),
            getAuthMethods: jest.fn().mockReturnValue(of([])),
            getLoggedDetails: jest.fn()
          }
        },
        {
          provide: NotificationService,
          useValue: {
            error: jest.fn(),
            success: jest.fn(),
            info: jest.fn(),
            warning: jest.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
