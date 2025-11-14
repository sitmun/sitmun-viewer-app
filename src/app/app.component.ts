import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageHelper } from '@ui/util/LanguageHelper';

@Component({
  selector: 'sitmun-viewer-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'sitmun-viewer-app';

  constructor(private translate: TranslateService) {
    translate.setDefaultLang(LanguageHelper.defaultLanguage);
    translate.use(LanguageHelper.defaultLanguage);
    this.generateDeviceID();
  }

  /**
   * Generating a unique device identifier for each client. The device ID is stored
   * in the browser's local storage and is used to help manage API abuse limits by uniquely
   * identifying each device accessing the application.
   */
  generateDeviceID() {
    const savedId = localStorage.getItem('deviceId');
    if (!savedId) {
      const deviceId = crypto.randomUUID();
      localStorage.setItem('deviceId', deviceId);
    }
  }
}
