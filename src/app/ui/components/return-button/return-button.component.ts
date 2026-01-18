import { Location } from '@angular/common';
import { Component } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-return-button',
  templateUrl: './return-button.component.html',
  styleUrls: ['./return-button.component.scss']
})
export class ReturnButtonComponent {
  constructor(
    private translateService: TranslateService,
    private location: Location
  ) {}

  historyGoBack(): void {
    this.location.back();
  }
}
