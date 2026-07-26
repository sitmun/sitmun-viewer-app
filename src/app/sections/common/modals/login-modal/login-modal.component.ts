import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationRequest } from '@auth/authentication.options';
import { AuthenticationService } from '@auth/services/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import { BaseModal } from '@ui/modal/component/base-modal';
import { OpenModalRef } from '@ui/modal/service/open-modal-ref';

import { NotificationService } from '../../../../notifications/services/NotificationService';

@Component({
  standalone: false,
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: [
    './login-modal.component.scss',
    '../../../../ui/modal/style/open-modal.component.scss'
  ]
})
export class LoginModalComponent extends BaseModal {
  authenticationRequest: AuthenticationRequest;

  constructor(
    private modalRef: OpenModalRef,
    private authenticationService: AuthenticationService<unknown>,
    private router: Router,
    private translate: TranslateService,
    private notificationService: NotificationService
  ) {
    super();
    this.authenticationRequest = {
      username: '',
      password: ''
    };
  }

  protected override onClose() {
    super.onClose();
    this.modalRef.close({
      loggedIn: false
    });
  }

  login() {
    if (
      this.authenticationRequest?.username &&
      this.authenticationRequest?.password
    ) {
      this.authenticationService.login(this.authenticationRequest).subscribe({
        next: () => {
          this.modalRef.close({
            loggedIn: true
          });
        },
        error: (error) => {
          if (error.status && error.status === 401) {
            this.authenticationRequest.password = '';
            this.translate.get('loginPage.incorrectLogin').subscribe((message) => {
              this.notificationService.error(message);
            });
          }
        }
      });
    }
  }
}
