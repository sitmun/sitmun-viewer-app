import { Component, Injectable, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { CommonService } from '@api/services/common.service';
import { CustomDetails } from '@api/services/user.service';
import { AuthenticationService } from '@auth/services/authentication.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})

export class NavigationBarComponent implements OnInit {
  showMenu: boolean;
  styleBackground: string = "#000000FF";
  username : string = "";
  currentLang : string;
  navigationClassActive: NavigationButtonActive = NavigationButtonActive.HOME;

  constructor(
    private router: Router,
    private commonService: CommonService,
    private translate: TranslateService,
    private authenticationService : AuthenticationService<CustomDetails>
  ) {
    this.showMenu = false;
    router.events.forEach((event) => {
      if (event instanceof NavigationStart) {
        this.showMenu = false;
      }
    });

    this.currentLang = localStorage.getItem('language') || 'es';
  }

  ngOnInit() {
    this.commonService.message$.subscribe(msg => {
      if (msg.theme === 'sitmun-base') {
        this.styleBackground = "#d79922";
      }
    });

    if(this.IsConnected() && !this.isPublicDashboard()) {
      this.username = this.authenticationService.getLoggedUsername();
    }

    if(this.router.url.startsWith("/user/profile"))
      this.navigationClassActive = NavigationButtonActive.PROFILE;
    else if(this.router.url.startsWith("/user/dashboard"))
      this.navigationClassActive = NavigationButtonActive.HOME;
  }

  homeRedirect() {
    this.navigationClassActive = NavigationButtonActive.HOME;
    this.router.navigate(['/']);
  }

  profileRedirect() {
    this.navigationClassActive = NavigationButtonActive.PROFILE;
    this.router.navigate(['/user/profile']);
  }

  logout() {
    this.authenticationService.logout();
  }

  onShowMenu() {
    this.showMenu = !this.showMenu;
  }

  TamanyMenu() {
    if (this.router.url.startsWith("/auth/login")) {
      return 'nav-bar login';
    }else if (this.router.url.startsWith("/map/")){
      return 'nav-bar pet';
    }
    else{
      return 'nav-bar';
    }
  }

  IsConnected() {
    let isConnected = true;
    if(this.router.url.startsWith("/auth/login") || this.router.url.startsWith("/auth/forgot-password")){
      isConnected = false;
    }
    return isConnected;
  }

  isPublicDashboard() {
    return this.router.url.startsWith("/public");
  }

  useLanguage(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.translate.use(target.value);
    localStorage.setItem('language', target.value);
  }
}

enum NavigationButtonActive {
  HOME = "home",
  NEWS = "news",
  PROFILE = "profile"
}
