import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationRequest } from '@auth/authentication.options';
import { AuthenticationService } from '@auth/services/authentication.service';
import { NavigationPath, QueryParam } from '@config/app.config';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/notifications/services/NotificationService';
import { environment } from 'src/environments/environment';

import {
  isProblemDetail,
  extractProblemType
} from '../../../utils/problem-detail.utils';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  authenticationRequest: AuthenticationRequest;

  showPassword = false;
  passwordImage = '';
  showPasswordImage = 'assets/img/showPassword=Default.svg';
  hidePasswordImage = 'assets/img/hidePassword=Default.svg';
  displayPassword = 'password';
  displayDNIEButton = true;
  displayBackgroundImage = true;
  backgroundImageUrl?: string;

  constructor(
    private authenticationService: AuthenticationService<unknown>,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private notificationService: NotificationService
  ) {
    this.authenticationRequest = {
      username: '',
      password: ''
    };
    this.passwordImage = this.showPasswordImage;
  }

  ngOnInit() {
    if (this.authenticationService.isLoggedIn()) {
      void this.router.navigateByUrl('/');
    }
    this.displayDNIEButton = !((environment as any).hideDNIEAccess ?? true);
    this.backgroundImageUrl = (environment as any).loginBackgroundImageUrl;
    // If loginBackgroundImageUrl is null or undefined, hide the background image
    if (!this.backgroundImageUrl) {
      this.displayBackgroundImage = false;
    } else {
      this.displayBackgroundImage = !(
        (environment as any).hideBackgroundImage ?? true
      );
    }
  }

  login() {
    if (
      this.authenticationRequest?.username &&
      this.authenticationRequest?.password
    ) {
      this.authenticationService.login(this.authenticationRequest).subscribe({
        next: () => {
          // Check for redirect query parameter
          const redirectUrl =
            this.route.snapshot.queryParams[
              QueryParam.Login.RedirectAfterLogin
            ];
          const AUTH_CONFIG = this.authenticationService.getAuthConfig();

          if (redirectUrl) {
            // Redirect to the originally requested URL
            void this.router.navigateByUrl(redirectUrl);
          } else {
            // Use default path - get auth details for defaultPath function
            try {
              const authDetails = this.authenticationService.getLoggedDetails();
              void this.router.navigateByUrl(
                AUTH_CONFIG.routes.defaultPath(authDetails)
              );
            } catch {
              // Fallback to dashboard if details not available yet
              void this.router.navigateByUrl(
                NavigationPath.Section.User.Dashboard
              );
            }
          }
        },
        error: (error) => {
          if (error.status === 401 || isProblemDetail(error)) {
            this.authenticationRequest.username = '';
            this.authenticationRequest.password = '';

            // Try to get error translation, fallback to default message
            let errorKey = 'loginPage.incorrectLogin';
            if (isProblemDetail(error)) {
              const problemType = extractProblemType(error);
              errorKey = problemType
                ? `error.${problemType}`
                : 'error.unauthorized';
            }

            this.translate.get(errorKey).subscribe((trad) => {
              this.notificationService.error(trad);
            });
          }
        }
      });
    }
  }

  publicDashboard() {
    void this.router.navigateByUrl(NavigationPath.Section.Public.Dashboard);
  }

  showOrHidePassword() {
    if (this.showPassword) {
      this.passwordImage = this.showPasswordImage;
      this.displayPassword = 'password';
    } else {
      this.passwordImage = this.hidePasswordImage;
      this.displayPassword = 'text';
    }
    this.showPassword = !this.showPassword;
  }
}
