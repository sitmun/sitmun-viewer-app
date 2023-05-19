import { Component } from '@angular/core';
import { AuthenticationRequest } from '@auth/authentication.options';
import { AuthenticationService } from '@auth/services/authentication.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BaseModal } from '@ui/modal/component/base-modal';
import { OpenModalRef } from '@ui/modal/service/open-modal-ref';

@Component({
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
    private translate: TranslateService
  ) {
    super();
    this.authenticationRequest = {
      username: '',
      password: ''
    };
  }

  protected override onClose() {
    super.onClose();
    this.modalRef.close();
  }

  login() {
    if (
      this.authenticationRequest?.username &&
      this.authenticationRequest?.password
    ) {
      this.authenticationService.login(this.authenticationRequest).subscribe({
        next: () => {
          this.modalRef.close();
        },
        error: (error) => {
          if (error.status && error.status === 401) {
            let traduction: string = '';
            this.translate.get('loginPage.incorrectLogin').subscribe((trad) => {
              traduction = trad;
            });
            // alert(traduction);
          }
        }
      });
    }
  }
}
