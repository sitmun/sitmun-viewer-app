import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '@auth/services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationRequest } from '@auth/authentication.options';
import { TranslateService } from '@ngx-translate/core';
import { NavigationPath } from '@config/app.config';
import { NotificationService } from 'src/app/notifications/services/NotificationService';
import { environment } from 'src/environments/environment';
import { QueryParam } from '@config/app.config';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  authenticationRequest: AuthenticationRequest;

  showPassword: boolean = false;
  passwordImage: string = '';
  showPasswordImage: string = 'assets/img/showPassword=Default.svg';
  hidePasswordImage: string = 'assets/img/hidePassword=Default.svg';
  displayPassword: string = 'password';
  displayDNIEButton: boolean = true;
  displayBackgroundImage: boolean = true;

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
      this.router.navigateByUrl('/');
    }
    this.displayDNIEButton = !((environment as any).hideDNIEAccess ?? true);
    this.displayBackgroundImage = !((environment as any).hideBackgroundImage ?? true);
  }

  login() {
    if (
      this.authenticationRequest?.username &&
      this.authenticationRequest?.password
    ) {
      this.authenticationService.login(this.authenticationRequest).subscribe({
        next: () => {
          // Check for redirect query parameter
          const redirectUrl = this.route.snapshot.queryParams[QueryParam.Login.RedirectAfterLogin];
          const AUTH_CONFIG = this.authenticationService.getAuthConfig();
          
          if (redirectUrl) {
            // Redirect to the originally requested URL
            this.router.navigateByUrl(redirectUrl);
          } else {
            // Use default path - get auth details for defaultPath function
            try {
              const authDetails = this.authenticationService.getLoggedDetails();
              this.router.navigateByUrl(AUTH_CONFIG.routes.defaultPath(authDetails));
            } catch {
              // Fallback to dashboard if details not available yet
          this.router.navigateByUrl(NavigationPath.Section.User.Dashboard);
            }
          }
        },
        error: (error) => {
          if (error.status && error.status === 401) {
            this.authenticationRequest.username = '';
            this.authenticationRequest.password = '';
            this.translate.get('loginPage.incorrectLogin').subscribe((trad) => {
              this.notificationService.error(trad);
            });
          }
        }
      });
    }
  }

  publicDashboard() {
    this.router.navigateByUrl(NavigationPath.Section.Public.Dashboard);
  }

  showOrHidePassword() {
    if(this.showPassword) {
      this.passwordImage = this.showPasswordImage;
      this.displayPassword = "password";
    }
    else {
      this.passwordImage = this.hidePasswordImage;
      this.displayPassword = "text";
    }
    this.showPassword = !this.showPassword;
  }
}
