import { Component } from '@angular/core';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'sitmun-viewer-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'sitmun-viewer-app';

  constructor(
    private languageService: LanguageService
  ) {
    // Initialize TranslateService with current language
    this.languageService.initializeTranslateService();
    
    // Optionally load user language from backend if logged in
    // This can be done asynchronously without blocking app initialization
    this.languageService.loadUserLanguage().subscribe();
    
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
