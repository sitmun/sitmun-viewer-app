import { Component } from '@angular/core';
import { AuthenticationService } from '@auth/services/authentication.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-authorized-navigation-bar',
  templateUrl: './authorized-navigation-bar.component.html',
  styleUrls: ['./authorized-navigation-bar.component.scss']
})
export class AuthorizedNavigationBarComponent {
  username: string = 'admin';

  constructor(
    private authenticationService: AuthenticationService<unknown>,
    private translate: TranslateService
  ) {}
  logout() {
    this.authenticationService.logout();
  }

  useLanguage(lang: string) {
    this.translate.use(lang);
  }
}
