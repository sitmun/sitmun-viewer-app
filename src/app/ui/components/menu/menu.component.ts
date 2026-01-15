import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { VERSION } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenu } from '@angular/material/menu';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuthenticationService } from '@auth/services/authentication.service';
import { CustomDetails } from '@api/services/user.service';
import {
  LanguageDTO,
  LanguageService
} from 'src/app/services/language.service';
import { ErrorTrackingService } from '../../../services/error-tracking.service';
import { SidebarManagerService } from '../../../services/sidebar-manager.service';
import {
  AboutDialogComponent,
  AboutDialogData
} from '../about-dialog/about-dialog.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {
  @ViewChild(MatMenu, { static: true }) menu!: MatMenu;
  currentLang: string = '';
  languages!: LanguageDTO[];
  environment = environment;
  angularVersion = VERSION.full;
  unreviewedErrorCount = 0;

  private errorsSubscription?: Subscription;

  @Input() username: string = '';
  @Input() isConnected!: boolean;
  @Input() showSwitchLanguageButton!: boolean;
  @Input() showLogoutButton!: boolean;
  @Input() showProfileButton!: boolean;
  @Input() showLoginButton!: boolean;
  @Input() showDashboardButton!: boolean;
  @Input() showChangeAppButton!: boolean;

  @Output() loginEvent = new EventEmitter();
  @Output() profileEvent = new EventEmitter();
  @Output() logoutEvent = new EventEmitter();
  @Output() languageEvent = new EventEmitter<string>();
  @Output() dashboardEvent = new EventEmitter();
  @Output() changeAppEvent = new EventEmitter();

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService<CustomDetails>,
    private languageService: LanguageService,
    private dialog: MatDialog,
    private errorTrackingService: ErrorTrackingService,
    private sidebarManager: SidebarManagerService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.currentLang = this.languageService.getCurrentLanguage();
    this.loadLanguages();
    this.updateErrorCount();

    // Subscribe to error changes
    this.errorsSubscription = this.errorTrackingService.errors$.subscribe(
      () => {
        this.updateErrorCount();
      }
    );
  }

  ngOnDestroy(): void {
    this.errorsSubscription?.unsubscribe();
  }

  private loadLanguages() {
    this.languageService
      .getLanguagesTranslatedSorted(this.currentLang)
      .subscribe((langs: LanguageDTO[]) => {
        this.languages = langs;
      });
  }

  getCurrentLanguageName(): string {
    return this.languageService.getLanguageName(
      this.languages,
      this.currentLang
    );
  }

  getLanguageIcon(shortname: string): string {
    return this.languageService.getLanguageIcon(shortname);
  }

  isImageIcon(shortname: string): boolean {
    const icon = this.getLanguageIcon(shortname);
    return icon.startsWith('assets/') || icon.startsWith('/');
  }

  selectLanguage(languageShortname: string) {
    this.currentLang = languageShortname;
    this.languageService.setLanguage(languageShortname).subscribe(() => {
      // Reload languages with names in the new language
      this.loadLanguages();
      this.languageEvent.emit(languageShortname);
    });
  }

  sendLoginEvent() {
    this.loginEvent.emit();
  }

  sendProfileEvent() {
    this.profileEvent.emit();
  }

  sendLogoutEvent() {
    this.logoutEvent.emit();
  }

  sendDashboardEvent() {
    this.dashboardEvent.emit();
  }

  sendChangeAppEvent() {
    this.changeAppEvent.emit();
  }

  updateErrorCount(): void {
    this.unreviewedErrorCount = this.errorTrackingService.getUnreviewedCount();
  }

  openErrorSidebar(): void {
    this.sidebarManager.openSidebar('error');
  }

  openAboutDialog(): void {
    // Get translated application name
    const applicationName = this.translateService.instant(
      'systemInfo.applicationName'
    );

    const dialogData: AboutDialogData = {
      applicationName: applicationName,
      version: this.environment.version || 'N/A',
      environmentName: this.environment.environmentName || 'N/A',
      angularVersion: this.angularVersion,
      buildTimestamp: (this.environment as any).buildTimestamp,
      sitnaVersion: this.environment.sitnaVersion
    };

    this.dialog.open(AboutDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: dialogData
    });
  }
}
