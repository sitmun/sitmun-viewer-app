import { Location } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';

@Component({
  standalone: false,
  selector: 'app-return-button',
  templateUrl: './return-button.component.html',
  styleUrls: ['./return-button.component.scss']
})
export class ReturnButtonComponent {
  /** i18n key for label, aria-label, and tooltip (e.g. profile.back, territory.back). */
  @Input() labelKey = 'profile.back';
  /** Optional fallback URL to navigate to if there's no useful browser history. */
  @Input() fallbackUrl?: string;

  constructor(
    private translateService: TranslateService,
    private location: Location,
    private router: Router
  ) {}

  historyGoBack(): void {
    if (this.fallbackUrl && window.history.length <= 1) {
      this.router.navigate([this.fallbackUrl]);
    } else {
      this.location.back();
    }
  }
}
