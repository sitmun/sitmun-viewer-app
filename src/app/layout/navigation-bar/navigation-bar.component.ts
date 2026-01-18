import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';
import { Location } from '@angular/common';
import {
  Component,
  HostBinding,
  OnInit,
  DoCheck,
  OnDestroy
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';

import {
  CommonService,
  DashboardItemsResponse,
  DashboardTypes
} from '@api/services/common.service';
import { CustomDetails } from '@api/services/user.service';
import { AuthenticationService } from '@auth/services/authentication.service';
import { NavigationPath } from '@config/app.config';
import { TranslateService } from '@ngx-translate/core';
import { ChangeApplicationTerritoryDialogComponent } from '@ui/components/change-application-territory-dialog/change-application-territory-dialog.component';
import { Subscription } from 'rxjs';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss'],
  animations: [
    trigger('toolbarCollapse', [
      state(
        'visible',
        style({
          height: '64px',
          minHeight: '64px',
          overflow: 'visible',
          pointerEvents: 'auto'
        })
      ),
      state(
        'hidden',
        style({
          height: '0',
          minHeight: '0',
          overflow: 'hidden',
          pointerEvents: 'none'
        })
      ),
      transition('visible <=> hidden', [
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ])
    ])
  ]
})
export class NavigationBarComponent implements OnInit, DoCheck, OnDestroy {
  @HostBinding('@toolbarCollapse') get toolbarCollapse() {
    return this.toolbarState;
  }
  username = '';
  navigationClassActive: NavigationButtonActive = NavigationButtonActive.HOME;
  private routerSubscription?: Subscription;

  headerLeftSection: IconSection[] | null = null;
  headerRightSection: IconSection[] | null = null;
  headerBase: HeaderBase | null = null;

  isOnAuthLogin = false;
  showProfileButton = true;
  showSwitchLanguageButton = true;
  showLogoutButton = true;
  showChangeAppOrTerritoryButton = true;
  navigationBarIsHidden = false;

  constructor(
    private router: Router,
    private commonService: CommonService,
    private translate: TranslateService,
    private authenticationService: AuthenticationService<CustomDetails>,
    private location: Location,
    private languageService: LanguageService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    if (this.isConnected() && !this.isPublicDashboard()) {
      this.username = this.authenticationService.getLoggedUsername();
    }
    this.checkWhichClassIsActive();
    this.overrideNavbar(this.router.url);
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Reset toolbar visibility when leaving map pages
        if (!this.isOnMap()) {
          this.navigationBarIsHidden = false;
        }
        this.checkWhichClassIsActive();
        this.overrideNavbar(this.router.url);
        // Update visibility flags on navigation
        this.updateButtonVisibility();
      }
    });
    // Initial update
    this.updateButtonVisibility();
  }

  ngDoCheck() {
    // Only update auth login state here as it's needed for template rendering
    this.isOnAuthLogin = this.isInAuthLoginSection();
  }

  private updateButtonVisibility(): void {
    this.showProfileButton =
      !this.isOnProfile() &&
      (!this.isOnMap() || this.headerBase?.profileButton?.visible !== false);
    this.showLogoutButton =
      !this.isOnMap() || this.headerBase?.logoutButton?.visible !== false;
    this.showSwitchLanguageButton =
      !this.isOnMap() || this.headerBase?.switchLanguage?.visible !== false;
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  overrideNavbar(url: string) {
    if (url.startsWith('/public/map') || url.startsWith('/user/map')) {
      // We get the application headers params of the app selected in the map
      this.commonService
        .fetchDashboardItems(DashboardTypes.APPLICATIONS)
        .subscribe({
          next: (res: DashboardItemsResponse) => {
            const applicationSelectedId = this.router.url.split('/')[3];
            const application = res.content.find(
              (app) => app.id.toString() == applicationSelectedId
            );
            if (application?.headerParams) {
              this.headerBase = {};
              this.headerLeftSection = [];
              this.headerRightSection = [];
              const headerParams = application.headerParams;
              const leftBaseKeys = [NavigationBarSection.LOGO_SITMUN];
              const rightBaseKeys = [
                NavigationBarSection.SWITCH_APP_BUTTON,
                NavigationBarSection.HOME_MENU_BUTTON,
                NavigationBarSection.SWITCH_LANGUAGE_BUTTON,
                NavigationBarSection.PROFILE_BUTTON,
                NavigationBarSection.LOGOUT_BUTTON
              ];

              const toIconSection = (key: any, obj: any): IconSection => ({
                name: key ?? '',
                url: obj?.url ?? '',
                alt: obj?.alt ?? '',
                visible: obj?.visible ?? false
              });

              // We overide the left side
              const headerLeftSection = headerParams.headerLeftSection;
              for (const key of leftBaseKeys) {
                if (headerLeftSection[key])
                  this.headerBase[key] = headerLeftSection[key]; // BaseKeys already presents in HTML
              }
              for (const key in headerLeftSection) {
                if (!leftBaseKeys.includes(key as NavigationBarSection))
                  this.headerLeftSection.push(
                    toIconSection(key, headerLeftSection[key])
                  ); // Future logo in header in the left section
              }

              // We look each button on the right side and dot not show if visible param is false
              const headerRightSection = headerParams.headerRightSection;
              for (const key of rightBaseKeys) {
                if (headerRightSection[key])
                  this.headerBase[key] = headerRightSection[key]; // BaseKeys already presents in HTML
              }
              for (const key in headerRightSection) {
                if (!rightBaseKeys.includes(key as NavigationBarSection))
                  this.headerRightSection.push(
                    toIconSection(key, headerRightSection[key])
                  ); // Future logo in header in the right section
              }
            }
          }
        });
    } else {
      this.headerLeftSection = null;
      this.headerRightSection = null;
      this.headerBase = null;
    }
  }

  checkWhichClassIsActive() {
    if (
      this.router.url.includes('/user/profile') ||
      this.router.url.includes('/public/profile')
    )
      this.navigationClassActive = NavigationButtonActive.PROFILE;
    else if (this.router.url.includes('/dashboard'))
      this.navigationClassActive = NavigationButtonActive.HOME;
    else this.navigationClassActive = NavigationButtonActive.OTHER;
  }

  homeRedirect() {
    this.navigationClassActive = NavigationButtonActive.HOME;
    if (this.router.url.startsWith('/public')) {
      this.router.navigateByUrl(NavigationPath.Section.Public.Dashboard);
    } else {
      this.router.navigateByUrl(NavigationPath.Section.User.Dashboard);
    }
  }

  loginRedirect() {
    this.router.navigateByUrl(NavigationPath.Auth.Login);
  }

  profileRedirect() {
    this.navigationClassActive = NavigationButtonActive.PROFILE;
    this.router.navigate([NavigationPath.Section.User.Profile]);
  }

  logoutRedirect() {
    this.authenticationService.logout();
  }

  getToolbarClass(): string {
    if (
      this.router.url.startsWith(NavigationPath.Auth.Login) ||
      this.router.url.startsWith(NavigationPath.Auth.ForgotPassword)
    ) {
      return 'login';
    } else if (
      this.router.url.startsWith(NavigationPath.Section.User.Base + '/map') ||
      this.router.url.startsWith(NavigationPath.Section.Public.Base + '/map')
    ) {
      return 'pet';
    } else {
      return '';
    }
  }

  changeLanguage(language: string) {
    this.languageService.setLanguage(language).subscribe();
  }

  isConnected(): boolean {
    let isConnected = true;
    if (
      this.router.url.startsWith('/public') ||
      this.router.url.startsWith('/auth/login') ||
      this.router.url.startsWith('/auth/forgot-password')
    ) {
      isConnected = false;
    }
    return isConnected;
  }

  isInAuthLoginSection(): boolean {
    return this.router.url.startsWith(NavigationPath.Auth.Login);
  }

  isPublicDashboard() {
    return this.router.url.startsWith('/public');
  }

  isOnMap() {
    return (
      this.router.url.startsWith('/user/map') ||
      this.router.url.startsWith('/public/map')
    );
  }

  isOnProfile(): boolean {
    return (
      this.router.url.includes(NavigationPath.Section.User.Profile) ||
      this.router.url.includes('/user/profile')
    );
  }

  shouldShowDashboardButton(): boolean {
    // Don't show on dashboard pages
    if (this.router.url.includes('/dashboard')) {
      return false;
    }
    // Don't show on login/auth pages
    if (this.isInAuthLoginSection()) {
      return false;
    }
    // Show on all other pages (map, profile, territory, application, etc.)
    return true;
  }

  shouldShowChangeAppButton(): boolean {
    // Show when: on map pages AND showChangeAppOrTerritoryButton is true AND headerBase?.switchApplication?.visible !== false
    return (
      this.isOnMap() &&
      this.showChangeAppOrTerritoryButton &&
      this.headerBase?.switchApplication?.visible !== false
    );
  }

  get toolbarState(): string {
    return this.navigationBarIsHidden && this.isOnMap() ? 'hidden' : 'visible';
  }

  /**
   * Opens the change application/territory dialog.
   * This method only handles opening the dialog - it does not contain any
   * territory selection or navigation logic. Those concerns are handled separately:
   * - Single-territory auto-navigation: handled in DashboardItemComponent.navigateToMap()
   * - Dialog selection logic: handled in ChangeApplicationTerritoryDialogComponent
   */
  openTerritoriesDialog(): void {
    const dialogRef = this.dialog.open(
      ChangeApplicationTerritoryDialogComponent,
      {
        width: '800px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        disableClose: false,
        autoFocus: false
      }
    );

    dialogRef.afterClosed().subscribe(() => {
      // Dialog closed
    });
  }
}

enum NavigationButtonActive {
  HOME = 'home',
  PROFILE = 'profile',
  OTHER = 'other'
}

enum NavigationBarSection {
  LOGO_SITMUN = 'logoSitmun',
  SWITCH_APP_BUTTON = 'switchApplication',
  HOME_MENU_BUTTON = 'homeMenu',
  SWITCH_LANGUAGE_BUTTON = 'switchLanguage',
  PROFILE_BUTTON = 'profileButton',
  LOGOUT_BUTTON = 'logoutButton'
}

interface HeaderBase {
  logoSitmun?: { visible?: boolean };
  switchApplication?: { visible?: boolean };
  homeMenu?: { visible?: boolean };
  switchLanguage?: { visible?: boolean };
  profileButton?: { visible?: boolean };
  logoutButton?: { visible?: boolean };
}

interface IconSection {
  name: string;
  url: string;
  alt: string;
  visible: boolean;
}
