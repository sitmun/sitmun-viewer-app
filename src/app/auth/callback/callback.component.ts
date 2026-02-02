import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationService } from '@auth/services/authentication.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';

import { NotificationService } from '../../notifications/services/NotificationService';

@Component({
  selector: 'app-callback',
  imports: [TranslateModule],
  templateUrl: './callback.component.html',
  styleUrl: './callback.component.scss'
})
export class CallbackComponent implements OnInit {
  messageKey = 'callback.processing';

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly cookieService: CookieService,
    private readonly translateService: TranslateService,
    private readonly notificationService: NotificationService,
    private readonly authenticationService: AuthenticationService<any>
  ) {}

  ngOnInit(): void {
    const token = this.cookieService.get('oidc_token');
    if (token) {
      this.messageKey = 'callback.redirect';
      this.authenticationService.authorizeOidcUser(token);
      this.authenticationService.loginRedirect(this.route);
    } else {
      this.router.navigateByUrl('/').then(() => {
        this.notificationService.error(
          this.translateService.instant('loginPage.incorrectLogin')
        );
      });
    }
  }
}
