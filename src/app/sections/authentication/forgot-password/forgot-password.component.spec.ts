import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { AuthenticationService } from '@auth/services/authentication.service';
import { ResetPasswordService } from '@auth/services/resetPassword.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormFieldInputComponent } from '@ui/components/form-field-input/form-field-input.component';
import { PrimaryButtonComponent } from '@ui/components/primary-button/primary-button.component';
import { NotificationService } from 'src/app/notifications/services/NotificationService';

import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        MatIconModule
      ],
      declarations: [
        ForgotPasswordComponent,
        PrimaryButtonComponent,
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
          provide: ResetPasswordService,
          useValue: {
            requestNewPassword: jest.fn(),
            resetPassword: jest.fn(),
            validateToken: jest.fn()
          }
        },
        {
          provide: AuthenticationService,
          useValue: {
            login: jest.fn(),
            isLoggedIn: jest.fn(),
            getAuthConfig: jest.fn()
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
    });
    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
