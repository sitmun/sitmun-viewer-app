import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { OIDC_TOKEN_COOKIE } from '@auth/authentication.options';
import { AuthenticationService } from '@auth/services/authentication.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SpinnerComponent } from '@ui/components/spinner/spinner.component';
import { CookieService } from 'ngx-cookie-service';

import { NotificationService } from '../../notifications/services/NotificationService';

@Component({
  selector: 'app-callback',
  imports: [SpinnerComponent, TranslateModule],
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

  /**
   * Reads the OIDC JWT from the `OIDC_TOKEN_COOKIE` cookie and stores it
   * via `AuthenticationService.authorizeOidcUser`.
   *
   * Requires the backend `http-only-cookie` setting to be `false` (default).
   * When `HttpOnly` is `true`, the browser hides the cookie from JavaScript
   * and this method sees an empty string, causing a redirect to the login page
   * with an error.
   *
   * **Future improvement:** Replace `CookieService.get()` with
   * `ActivatedRoute.snapshot.fragment` parsing to support `httpOnly=true`.
   */
  ngOnInit(): void {
    const token = this.cookieService.get(OIDC_TOKEN_COOKIE);
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
