import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { URL_API_I18N_LANGUAGE } from '@api/api-config';
import { I18nService } from '@api/services/i18n.service';
import { CustomDetails } from '@api/services/user.service';
import { AuthenticationService } from '@auth/services/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, Observable, of } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  constructor(
    private i18nService: I18nService,
    private appConfigService: AppConfigService,
    private translateService: TranslateService,
    private authenticationService: AuthenticationService<CustomDetails>,
    private http: HttpClient
  ) {}

  /**
   * Get the current language from localStorage or default from configuration
   * This is the preferred method over getDefaultLanguage() as it's more explicit
   */
  getCurrentLanguage(): string {
    const storedLang = localStorage.getItem('language');
    return storedLang ?? this.appConfigService.getDefaultLanguage();
  }

  /**
   * Get the default language from configuration or localStorage
   * @deprecated Use getCurrentLanguage() instead
   */
  getDefaultLanguage(): string {
    return this.getCurrentLanguage();
  }

  /**
   * Initialize TranslateService with the current language
   * Should be called during app initialization (e.g., in AppComponent)
   */
  initializeTranslateService(): void {
    const lang = this.getCurrentLanguage();
    this.translateService.setDefaultLang(lang);
    this.translateService.use(lang);
  }

  /**
   * Set the current language and update all related services
   * @param lang Language shortname (e.g., 'es', 'en')
   * @param syncBackend Whether to sync with backend (default: true if logged in)
   */
  setLanguage(lang: string, syncBackend = true): Observable<void> {
    // Update localStorage
    localStorage.setItem('language', lang);

    // Update TranslateService
    this.translateService.use(lang);

    // Sync with backend if user is logged in
    if (syncBackend && this.authenticationService.isLoggedIn()) {
      const languageDTO: LanguageDTO = { name: lang, shortname: lang };
      return this.i18nService.updateUserLanguage(languageDTO).pipe(
        map(() => undefined),
        catchError(() => {
          // Log error but don't fail - language is still set locally
          console.warn('Failed to sync language with backend');
          return of(undefined);
        })
      );
    }

    return of(undefined);
  }

  /**
   * Get the display name for a language by its shortname
   * @param languages Array of available languages
   * @param shortname Language shortname to find
   * @returns Display name of the language or 'Language' as fallback
   */
  getLanguageName(languages: LanguageDTO[], shortname: string): string {
    if (!languages || !shortname) {
      return 'Language';
    }
    const language = languages.find((lang) => lang.shortname === shortname);
    return language ? language.name : 'Language';
  }

  /**
   * Return a list of available languages.
   * @returns A list of available languages. If the API call fails, it returns a default list.
   */
  getLanguages(): Observable<LanguageDTO[]> {
    return this.i18nService.availableLanguageCodes().pipe(
      map((response: any) => {
        const languages: LanguageDTO[] = response?._embedded?.languages ?? [];
        if (!languages || languages.length === 0) {
          return this.appConfigService.getDefaultLanguages();
        }
        return languages;
      }),
      catchError(() => of(this.appConfigService.getDefaultLanguages()))
    );
  }

  /**
   * Return a list of available languages with names translated in the specified language.
   * @param lang The language shortname (e.g., 'es', 'en') to get translated language names
   * @returns A list of available languages with translated names. If the API call fails, it returns a default list.
   */
  getLanguagesTranslated(lang: string): Observable<LanguageDTO[]> {
    return this.i18nService.getLanguagesTranslated(lang).pipe(
      map((response: any) => {
        // Handle different response formats
        let languages: LanguageDTO[] = [];
        if (Array.isArray(response)) {
          languages = response;
        } else if (response?._embedded?.languages) {
          languages = response._embedded.languages;
        }

        if (!languages || languages.length === 0) {
          return this.appConfigService.getDefaultLanguages();
        }
        return languages;
      }),
      catchError(() => of(this.appConfigService.getDefaultLanguages()))
    );
  }

  /**
   * Get languages with names translated in the specified language, sorted alphabetically
   * @param lang The language shortname to get translated names
   * @returns Observable of sorted LanguageDTO array
   */
  getLanguagesTranslatedSorted(lang: string): Observable<LanguageDTO[]> {
    return this.getLanguagesTranslated(lang).pipe(
      map((languages) => languages.sort((a, b) => a.name.localeCompare(b.name)))
    );
  }

  /**
   * Load user language from backend if logged in, otherwise use localStorage/default
   * Should be called during app initialization
   */
  loadUserLanguage(): Observable<string> {
    if (this.authenticationService.isLoggedIn()) {
      // Get the full LanguageDTO from API to extract shortname
      return this.http.get<LanguageDTO>(URL_API_I18N_LANGUAGE).pipe(
        map((languageDto: LanguageDTO) => {
          // Use shortname if available, otherwise fall back to name or current language
          const lang =
            languageDto?.shortname ||
            languageDto?.name ||
            this.getCurrentLanguage();
          if (lang && lang !== this.getCurrentLanguage()) {
            localStorage.setItem('language', lang);
            this.translateService.use(lang);
          }
          return lang;
        }),
        catchError(() => {
          // If backend fails, use local storage/default
          return of(this.getCurrentLanguage());
        })
      );
    }
    return of(this.getCurrentLanguage());
  }

  /**
   * Get the icon/flag for a language by its shortname
   * @param shortname Language shortname (e.g., 'es', 'en', 'oc-aranes')
   * @returns Icon string (emoji or image path) or empty string if not found
   */
  getLanguageIcon(shortname: string): string {
    return this.appConfigService.getLanguageIcon(shortname);
  }
}

export interface LanguageDTO {
  name: string;
  shortname: string;
}
