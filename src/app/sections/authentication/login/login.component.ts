import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '@auth/services/authentication.service';
import { Router } from '@angular/router';
import { AuthenticationRequest } from '@auth/authentication.options';
import { TranslateService } from '@ngx-translate/core';
import { NavigationPath } from '@config/app.config';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  authenticationRequest: AuthenticationRequest;

  constructor(
    private authenticationService: AuthenticationService<unknown>,
    private router: Router,
    private translate: TranslateService
  ) {
    this.authenticationRequest = {
      username: '',
      password: ''
    };
  }

  ngOnInit() {
    if (this.authenticationService.isLoggedIn()) {
      this.router.navigateByUrl('/');
    }
  }

  login() {
    if (
      this.authenticationRequest?.username &&
      this.authenticationRequest?.password
    ) {
      this.authenticationService.login(this.authenticationRequest).subscribe({
        next: () => {
          this.router.navigateByUrl(NavigationPath.Section.User.Dashboard);
        },
        error: (error) => {
          if (error.status && error.status === 401) {
            this.authenticationRequest.username = '';
            this.authenticationRequest.password = '';
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

  publicDashboard() {
    this.router.navigateByUrl(NavigationPath.Section.Public.Dashboard);
  }
}
