import { Location } from '@angular/common';
import { Component, HostListener, Injectable, OnInit } from '@angular/core';
import { NavigationStart, Router, NavigationEnd } from '@angular/router';
import { CommonService, DashboardItemsResponse, DashboardTypes } from '@api/services/common.service';
import { CustomDetails } from '@api/services/user.service';
import { AuthenticationService } from '@auth/services/authentication.service';
import { NavigationPath } from '@config/app.config';
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
  isResponsive : boolean = false;
  mediaQueryListener: any;
  navigationBarIsHidden : boolean = false;
  displayTerritoriesAppList : boolean = false;
  totalApplicationLength! : number;

  headerLeftSection: any;
  headerRightSection : any;
  headerBase : any;

  constructor(
    private router: Router,
    private commonService: CommonService,
    private translate: TranslateService,
    private authenticationService : AuthenticationService<CustomDetails>,
    private location: Location
  ) {
    this.showMenu = false;
    router.events.forEach((event) => {
      if (event instanceof NavigationStart) {
        this.showMenu = false;
      }
    });

    this.currentLang = localStorage.getItem('language') || 'es';
    this.getTotalApplicationLength();
  }

  ngOnInit() {
    this.CheckIfResponsive();

    this.commonService.message$.subscribe(msg => {
      if (msg.theme === 'sitmun-base') {
        this.styleBackground = "#d79922";
      }
    });

    if(this.IsConnected() && !this.isPublicDashboard()) {
      this.username = this.authenticationService.getLoggedUsername();
    }

    this.CheckWichClassIsActive();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.CheckWichClassIsActive();
      }
    });

    this.location.onUrlChange(url => {this.OverideNavbar(url)});
  }

  ngOnDestroy() {
    if (this.mediaQueryListener) {
      this.mediaQueryListener.removeListener();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event : any) {
    this.CheckIfResponsive();
  }

  OverideNavbar(url : string) {
    if(url.startsWith("/public/map") || url.startsWith("/user/map")){
      // We get the application headers params of the app selected in the map
      this.commonService.fetchDashboardItems(DashboardTypes.APPLICATIONS).subscribe({
        next: (res: DashboardItemsResponse) => {
          let applicationSelectedId = this.router.url.split('/')[3];
          let application = res.content.find((app) => app.id.toString() == applicationSelectedId);
          if(application?.headerParams) {
            console.log(application.headerParams);
            this.headerBase = {};
            this.headerLeftSection = [];
            this.headerRightSection = [];
            let headerParams = application.headerParams;
            const leftBaseKeys = [NavigationBarSection.LOGO_SITMUN];
            const rightBaseKeys = [NavigationBarSection.SWITCH_APP_BUTTON, NavigationBarSection.HOME_MENU_BUTTON, NavigationBarSection.SWITCH_LANGUAGE_BUTTON, NavigationBarSection.PROFILE_BUTTON, NavigationBarSection.LOGOUT_BUTTON];

            const toIconSection = (key : any, obj: any): IconSection => ({
              name: key ?? '',
              url: obj?.url ?? '',
              alt: obj?.alt ?? '',
              visible: obj?.visible ?? false
            });

            // We overide the left side
            let headerLeftSection = headerParams.headerLeftSection;
            for (let key of leftBaseKeys) {
              if (headerLeftSection[key]) this.headerBase[key] = headerLeftSection[key]; // BaseKeys already presents in HTML
            }
            for (let key in headerLeftSection) {
              if (!leftBaseKeys.includes(key as NavigationBarSection)) this.headerLeftSection.push(toIconSection(key, headerLeftSection[key])); // Future logo in header in the left section
            }

            // We look each button on the right side and dot not show if visible param is false
            let headerRightSection = headerParams.headerRightSection;
            for (let key of rightBaseKeys) {
              if (headerRightSection[key]) this.headerBase[key] = headerRightSection[key]; // BaseKeys already presents in HTML
            }
            for (let key in headerRightSection) {
              if (!rightBaseKeys.includes(key as NavigationBarSection)) this.headerRightSection.push(toIconSection(key, headerRightSection[key])); // Future logo in header in the right section
            }
          }
        },
      });
    }
    else {
      this.headerLeftSection = null;
      this.headerRightSection = null;
      this.headerBase = null;
    }
  }

  CheckWichClassIsActive() {
    if(this.router.url.includes("profile"))
      this.navigationClassActive = NavigationButtonActive.PROFILE;
    else if(this.router.url.includes("dashboard"))
      this.navigationClassActive = NavigationButtonActive.HOME;
    else
      this.navigationClassActive = NavigationButtonActive.OTHER;
  }

  homeRedirect() {
    this.navigationClassActive = NavigationButtonActive.HOME;
    if(this.router.url.startsWith("/public")){
      this.router.navigateByUrl(
        NavigationPath.Section.Public.Dashboard
      );
    }
    else{
      this.router.navigateByUrl(
        NavigationPath.Section.User.Dashboard
      );
    }
  }

  loginRedirect() {
    this.router.navigate(['/auth/login']);  }

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
    if (this.router.url.startsWith("/auth/login") || this.router.url.startsWith("/auth/forgot-password")) {
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

  CheckIfResponsive(): void {
    const breakpoint = 640;
    this.isResponsive =  window.innerWidth <= breakpoint;
  }

  isOnMap() {
    return this.router.url.startsWith("/user/map") || this.router.url.startsWith("/public/map");
  }

  getTotalApplicationLength(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.commonService.fetchDashboardItems(DashboardTypes.APPLICATIONS)
        .subscribe({
          next: (res: DashboardItemsResponse) => {
            this.totalApplicationLength = res.content.length;
          },
          error: (err) => {
            reject(err);
          }
        });
    });
  }

}

enum NavigationButtonActive {
  HOME = "home",
  NEWS = "news",
  PROFILE = "profile",
  OTHER = "other"
}

enum NavigationBarSection {
  LOGO_SITMUN = "logoSitmun",
  SWITCH_APP_BUTTON = "switchApplication",
  HOME_MENU_BUTTON = "homeMenu",
  SWITCH_LANGUAGE_BUTTON = "switchLanguage",
  PROFILE_BUTTON = "profileButton",
  LOGOUT_BUTTON = "logoutButton"
}

interface IconSection {
  name : string,
  url : string,
  alt : string,
  visible : boolean
}
