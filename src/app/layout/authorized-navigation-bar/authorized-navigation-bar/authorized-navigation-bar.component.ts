import { Component } from '@angular/core';
import { AuthenticationService } from '@auth/services/authentication.service';

@Component({
  selector: 'app-authorized-navigation-bar',
  templateUrl: './authorized-navigation-bar.component.html',
  styleUrls: ['./authorized-navigation-bar.component.scss']
})
export class AuthorizedNavigationBarComponent {
  username: string = 'admin';

  constructor(private authenticationService: AuthenticationService<unknown>) {}
  logout() {
    this.authenticationService.logout();
  }
}
