import { TranslateService } from '@ngx-translate/core';
import { Component } from '@angular/core';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import { ActivatedRoute, Router } from '@angular/router';
import { ResetPasswordService } from '@auth/services/resetPassword.service';
import { UserRequest } from './../../../auth/authentication.options';
import { NotificationService } from 'src/app/notifications/services/NotificationService';
import { UserTokenService } from '@auth/services/userToken.service';


/**
 * Component for handling password reset functionality.
 */
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  private token: string = '';
  private userRequest : UserRequest;
  password : string = '';
  password_confirmation : string = '';
  tokenValid : boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resetPasswordService: ResetPasswordService<unknown>,
    private notificationService : NotificationService,
    private translateService : TranslateService,
    private userTokenService : UserTokenService<unknown>
  ) {
    this.userRequest = {
      password: null,
      token: null,
    };

  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.token = params['token'];
    });
    this.isTokenValid();
  }

  /**
   * Validates the token by checking its expiration time.
   *
   * If the token is invalid or expired, navigates the user to the home page.
   * If the token is valid, allows the user to proceed with the password reset process.
   *
   * @returns True if the token is valid; otherwise, false.
   */
  isTokenValid(): boolean {
    let isTokenValid = false;

    this.userTokenService.isUserTokenValid(this.token).subscribe({
      next: (res : boolean) => {
        isTokenValid = res;
        if (!isTokenValid)
          this.router.navigateByUrl('/auth/forgot-password');
        else
          this.tokenValid = res;
      }
    });

    return isTokenValid;
  }

  /**
   * Change user password
   */
  changePassword(): void {
    if(this.password == this.password_confirmation){
      this.userRequest.password = this.password;
      this.userRequest.token = this.token;
      try{
        this.resetPasswordService.resetPassword(this.userRequest).subscribe({
          next: () => {
            this.translateService.get('resetPasswordPage.success').subscribe((trad) => {
              this.notificationService.success(trad);
            });
            this.router.navigateByUrl('/');
          },
          error: (error) => {
            console.error(error);
            this.translateService.get('resetPasswordPage.error').subscribe((trad) => {
              this.notificationService.error(trad);
            });
          }
        });
      }
      catch (error){
        this.translateService.get('resetPasswordPage.serverError').subscribe((trad) => {
          this.notificationService.error(trad);
        });
      }
      finally {
        this.userRequest.password = '';
      }
    }
    else {
      this.translateService.get('resetPasswordPage.passwordMismatch').subscribe((trad) => {
        this.notificationService.error(trad);
      });
    }
    this.password = '';
    this.password_confirmation = '';
  }
}
