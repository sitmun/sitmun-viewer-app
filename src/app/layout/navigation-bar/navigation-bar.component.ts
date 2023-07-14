import { Component } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent {
  showMenu: boolean;

  constructor(private router: Router) {
    this.showMenu = false;
    router.events.forEach((event) => {
      if (event instanceof NavigationStart) {
        this.showMenu = false;
      }
    });
  }

  logoClicked() {
    this.router.navigate(['/']);
  }

  onShowMenu() {
    this.showMenu = !this.showMenu;
  }
}
