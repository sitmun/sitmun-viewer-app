import { RecoveryRequest } from './../../../auth/authentication.options';
import { Component } from '@angular/core';
import { RecoverPasswordService } from '@auth/services/recoverPassword.service';
import { NotificationService } from 'src/app/notifications/services/NotificationService';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  recoveryRequest : RecoveryRequest;

  constructor(
    private recoverService: RecoverPasswordService<unknown>,
    private translate: TranslateService,
    private notificationService : NotificationService,
  ) {
    this.recoveryRequest = {
      login: ''
    }
  }

  sendMail() {
    if (this.recoveryRequest.login) {
      this.translate.get('resetPasswordPage.mailSent').subscribe((trad) => {
        this.notificationService.success(trad);
      });
      this.recoverService.sendEmail(this.recoveryRequest).subscribe({
        next: () => {}
      });
      this.recoveryRequest.login = '';
    }
  }
}
