import {
  Component,
  effect,
  OnInit,
  signal,
  WritableSignal
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  AuthProvider,
  AuthenticationRequest,
  AUTH_METHOD_OIDC
} from '@auth/authentication.options';
import { AuthenticationService } from '@auth/services/authentication.service';
import { NavigationPath } from '@config/app.config';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/notifications/services/NotificationService';
import { environment } from 'src/environments/environment';

import {
  extractProblemType,
  isProblemDetail
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

  loginMethods: WritableSignal<Map<string, AuthProvider[]>> = signal(
    new Map<string, AuthProvider[]>()
  );
  alternativeLoginMethods: AuthProvider[] = [];

  constructor(
    private readonly authenticationService: AuthenticationService<unknown>,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly translate: TranslateService,
    private readonly notificationService: NotificationService
  ) {
    this.authenticationService.getAuthMethods().subscribe((res) => {
      if (Array.isArray(res)) {
        const map = new Map<string, AuthProvider[]>();
        res.forEach((item) => {
          map.set(item.id, item.providers ?? []);
        });
        this.loginMethods.set(map);
      }
    });

    effect(() => {
      this.alternativeLoginMethods =
        this.loginMethods().get(AUTH_METHOD_OIDC) ?? [];
    });

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
          this.authenticationService.loginRedirect(this.route);
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

  initAuth(providerId: string) {
    this.authenticationService.initOidcAuth(providerId);
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
