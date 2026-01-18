import { Component } from '@angular/core';
import { Router } from '@angular/router';

import {
  RequestNewPassword,
  ResetPasswordRequest
} from '@auth/authentication.options';
import { ResetPasswordService } from '@auth/services/resetPassword.service';
import { NavigationPath } from '@config/app.config';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/notifications/services/NotificationService';

import { AuthenticationService } from './../../../auth/services/authentication.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  /* Forgot Password Form */
  recoveryRequest!: RequestNewPassword;
  codeReceived = false;
  showResetPasswordForm = false;

  /* Reset Password Form */
  resetPasswordRequest!: ResetPasswordRequest;
  tokenValid = false;
  userTokenService: any;
  confirmationNewPassword = '';
  showResendCode = false;
  disabledResendCode = false;

  constructor(
    private resetPasswordService: ResetPasswordService,
    private translateService: TranslateService,
    private notificationService: NotificationService,
    private router: Router,
    private authenticationService: AuthenticationService<unknown>
  ) {
    this.initRequest();
  }

  initRequest() {
    this.recoveryRequest = {
      email: ''
    };

    this.resetPasswordRequest = {
      newPassword: '',
      email: '',
      codeOTP: ''
    };
  }

  /* Forgot Password Form */
  requestNewPassword(): void {
    if (this.recoveryRequest.email && this.checkIfMailIsValid()) {
      this.translateService
        .get('forgotPasswordPage.forgotPasswordForm.mailSent')
        .subscribe((trad) => {
          this.notificationService.success(trad);
        });
      this.resetPasswordService
        .requestNewPassword(this.recoveryRequest)
        .subscribe({
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          next: () => {}
        });
      this.codeReceived = true;
      this.resetPasswordRequest.email = this.recoveryRequest.email;
      this.recoveryRequest.email = '';
    }
  }

  checkIfMailIsValid(): boolean {
    const email: string = this.recoveryRequest.email;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(email)) {
      this.translateService
        .get('forgotPasswordPage.forgotPasswordForm.incorrectFormatMail')
        .subscribe((trad) => {
          this.notificationService.error(trad);
        });
      return false;
    }

    return true;
  }

  /* Reset Password Form */
  ConfirmResetPassword(): void {
    // Password is empty
    if (
      this.resetPasswordRequest.newPassword == '' ||
      this.confirmationNewPassword == '' ||
      this.resetPasswordRequest.codeOTP == ''
    ) {
      this.translateService
        .get('forgotPasswordPage.resetPasswordForm.fieldsEmpty')
        .subscribe((trad) => {
          this.notificationService.error(trad);
        });
      return;
    }

    // Passwords does not match
    if (this.resetPasswordRequest.newPassword != this.confirmationNewPassword) {
      this.translateService
        .get('forgotPasswordPage.resetPasswordForm.passwordMismatch')
        .subscribe((trad) => {
          this.notificationService.error(trad);
        });
      return;
    }

    try {
      this.resetPasswordService
        .confirmNewPassword(this.resetPasswordRequest)
        .subscribe({
          next: () => {
            this.translateService
              .get('forgotPasswordPage.resetPasswordForm.success')
              .subscribe((trad) => {
                this.notificationService.success(trad);
              });
            this.initRequest();
            this.authenticationService.logout();
          },
          error: (error: any) => {
            if (error.status === 410) {
              this.translateService
                .get('forgotPasswordPage.resetPasswordForm.gone')
                .subscribe((trad) => {
                  this.notificationService.error(trad);
                });
              if (!this.showResendCode) {
                this.showResendCode = true;
              }
            } else if (error.status === 400) {
              this.translateService
                .get('forgotPasswordPage.resetPasswordForm.badRequest')
                .subscribe((trad) => {
                  const attemptsRemaining = error.error;
                  const message = trad.replace('{0}', attemptsRemaining);
                  this.notificationService.error(message);
                });
            } else {
              this.translateService
                .get('forgotPasswordPage.resetPasswordForm.error')
                .subscribe((trad) => {
                  this.notificationService.error(trad);
                });
            }
          }
        });
    } catch (error) {
      this.translateService
        .get('forgotPasswordPage.serverError')
        .subscribe((trad) => {
          this.notificationService.error(trad);
        });
    } finally {
      this.resetPasswordRequest.newPassword = '';
      this.confirmationNewPassword = '';
    }
  }

  previous() {
    if (!this.showResetPasswordForm) {
      this.router.navigateByUrl(NavigationPath.Auth.Login); // redirect to login page if we are on the forgot password form
    } else {
      this.showResetPasswordForm = false; // redirect to the forgot password form if we are on the reset password form
      this.showResendCode = false;
      this.resetPasswordRequest.codeOTP = '';
      this.resetPasswordRequest.newPassword = '';
      this.confirmationNewPassword = '';
    }
  }

  next() {
    this.showResetPasswordForm = true;
    this.codeReceived = false;
  }

  resendCode() {
    this.resetPasswordService
      .resendNewRequest(this.resetPasswordRequest)
      .subscribe({
        next: () => {
          this.translateService
            .get('forgotPasswordPage.resetPasswordForm.codeResent')
            .subscribe((trad) => {
              this.notificationService.success(trad);
            });
          // this.disabledResendCode = true;
        },
        error: (error: any) => {
          if (error.status == 429) {
            this.translateService
              .get('forgotPasswordPage.resetPasswordForm.tooManyRequest')
              .subscribe((trad) => {
                this.notificationService.error(trad);
              });
          }
        }
      });
  }
}
