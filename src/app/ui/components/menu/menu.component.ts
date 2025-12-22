import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '@auth/services/authentication.service';
import { CustomDetails } from '@api/services/user.service';
import { LanguageDTO, LanguageService } from 'src/app/services/language.service';
import { MatMenu } from '@angular/material/menu';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  @ViewChild(MatMenu, { static: true }) menu!: MatMenu;
  currentLang: string = '';
  languages!: LanguageDTO[];

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
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.currentLang = this.languageService.getCurrentLanguage();
    this.loadLanguages();
  }

  private loadLanguages() {
    this.languageService.getLanguagesTranslatedSorted(this.currentLang).subscribe((langs: LanguageDTO[]) => {
      this.languages = langs;
    });
  }

  getCurrentLanguageName(): string {
    return this.languageService.getLanguageName(this.languages, this.currentLang);
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
}
