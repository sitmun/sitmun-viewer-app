import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '@auth/services/authentication.service';
import { CustomDetails } from '@api/services/user.service';
import { NavigationPath } from '@config/app.config';
import { LanguageDTO, LanguageHelper } from '@ui/util/LanguageHelper';
import { MatSelectChange } from '@angular/material/select';
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  currentLang: string = '';
  languages!: LanguageDTO[];

  @Input() username: string = '';
  @Input() isConnected: boolean = false;
  @Input() showSwitchLanguageButton: boolean = true;
  @Input() showLogoutButton: boolean = true;
  @Input() showProfileButton: boolean = true;

  @Output() hideEvent = new EventEmitter();
  @Output() loginEvent = new EventEmitter();
  @Output() profileEvent = new EventEmitter();
  @Output() logoutEvent = new EventEmitter();
  @Output() languageEvent = new EventEmitter<string>();

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService<CustomDetails>,
    private languageHelper: LanguageHelper
  ) {}

  ngOnInit() {
    this.currentLang = this.languageHelper.defaultLanguage;
    this.languageHelper.getLanguages().subscribe((langs) => {
      this.languages = langs;
    });
    console.log(this.showProfileButton)
    if (this.showLogoutButton == null) {
      this.showLogoutButton = true;
    }
    if (this.showSwitchLanguageButton == null) {
      this.showSwitchLanguageButton = true;
    }
    if (this.showProfileButton == null) {
      this.showProfileButton = true;
    }
  }

  sendLanguageEvent(event: MatSelectChange) {
    this.languageEvent.emit(event.value);
  }

  sendLoginEvent() {
    this.loginEvent.emit();
    this.sendHideEvent();
  }

  sendProfileEvent() {
    this.profileEvent.emit();
    this.sendHideEvent();
  }

  sendLogoutEvent() {
    this.logoutEvent.emit();
    this.sendHideEvent();
  }

  sendHideEvent() {
    this.hideEvent.emit();
  }
}
