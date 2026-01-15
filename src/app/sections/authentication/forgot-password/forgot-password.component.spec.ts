import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ResetPasswordService } from '@auth/services/resetPassword.service';
import { AuthenticationService } from '@auth/services/authentication.service';
import { NotificationService } from 'src/app/notifications/services/NotificationService';
import { PrimaryButtonComponent } from '@ui/components/primary-button/primary-button.component';
import { FormFieldInputComponent } from '@ui/components/form-field-input/form-field-input.component';
import { MatIconModule } from '@angular/material/icon';

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
          useValue: jasmine.createSpyObj('Router', [
            'navigate',
            'navigateByUrl'
          ])
        },
        {
          provide: ResetPasswordService,
          useValue: jasmine.createSpyObj('ResetPasswordService', [
            'requestNewPassword',
            'resetPassword',
            'validateToken'
          ])
        },
        {
          provide: AuthenticationService,
          useValue: jasmine.createSpyObj('AuthenticationService', [
            'login',
            'isLoggedIn',
            'getAuthConfig'
          ])
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', [
            'error',
            'success',
            'info',
            'warning'
          ])
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
