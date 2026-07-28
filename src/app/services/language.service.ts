import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  URL_API_CONFIGURATION_PARAMETERS,
  URL_API_I18N_LANGUAGE,
  URL_API_I18N_MESSAGES_LIST
} from '@api/api-config';
import { I18nService } from '@api/services/i18n.service';
import { CustomDetails } from '@api/services/user.service';
import { AuthenticationService } from '@auth/services/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import {
  BehaviorSubject,
  catchError,
  firstValueFrom,
  map,
  Observable,
  of,
  tap
} from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';
import { environment } from 'src/environments/environment';

import {
  filterEnabledLanguages,
  resolveUiLanguage,
  sortByLanguageOrder
} from './ui-language.resolver';

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
  readonly STORED_LANGUAGE: string = 'language';

  private backendDefault: string | null = null;
  private availableLanguages: LanguageDTO[] = [];
  private bootstrapped = false;
  private readonly languagesToUseSubject = new BehaviorSubject<LanguageDTO[]>([]);

  /** Enabled languages for the chrome selector. */
  readonly languagesToUse$ = this.languagesToUseSubject.asObservable();

  /**
   * Get the current language: localStorage → language.default → static. Never browser.
   */
  getCurrentLanguage(): string {
    const available = this.availableShortnames();
    return resolveUiLanguage({
      stored: localStorage.getItem(this.STORED_LANGUAGE),
      backendDefault: this.backendDefault,
      availableShortnames: available,
      staticFallback: this.appConfigService.getDefaultLanguage() || 'en'
    });
  }

  getAvailableLanguages(): LanguageDTO[] {
    return this.availableLanguages;
  }

  /**
   * Updates the in-memory switcher list and notifies subscribers.
   */
  applyLanguagesToUse(languages: LanguageDTO[]): LanguageDTO[] {
    const enabled = filterEnabledLanguages(sortByLanguageOrder(languages ?? []));
    this.availableLanguages = enabled;
    this.languagesToUseSubject.next(enabled);
    return enabled;
  }

  /**
   * Reloads enabled languages from the API (same contract as admin refresh).
   */
  refreshLanguagesToUse(): Observable<LanguageDTO[]> {
    return this.getLanguagesForSwitcher();
  }

  /**
   * Load STM_CONF language.default and languages list, then apply translate.
   * Intended for APP_INITIALIZER before first paint.
   */
  async bootstrapUiLanguage(): Promise<void> {
    if (this.bootstrapped) {
      return;
    }
    this.backendDefault = await firstValueFrom(this.loadBackendDefaultLanguage());
    await firstValueFrom(this.getLanguagesForSwitcher());
    const lang = this.getCurrentLanguage();
    this.translateService.setDefaultLang(lang);
    await firstValueFrom(this.translateService.use(lang));
    this.bootstrapped = true;
  }

  /**
   * Initialize TranslateService with the current language (safe if already bootstrapped).
   */
  initializeTranslateService(): void {
    if (this.bootstrapped) {
      return;
    }
    const lang = this.getCurrentLanguage();
    this.translateService.setDefaultLang(lang);
    this.translateService.use(lang);
  }

  loadBackendDefaultLanguage(): Observable<string | null> {
    return this.http.get<any>(environment.apiUrl + URL_API_CONFIGURATION_PARAMETERS).pipe(
      map((response) => {
        const params = Array.isArray(response)
          ? response
          : response?._embedded?.['configuration-parameters'] || [];
        const found = params.find(
          (p: { name?: string; value?: string }) => p?.name === 'language.default'
        );
        return found?.value ?? null;
      }),
      catchError(() => of(null)),
      tap((value) => {
        this.backendDefault = value;
      })
    );
  }

  /**
   * Languages for the UI switcher: enabled endonyms from GET /api/languages (no ?lang=).
   */
  getLanguagesForSwitcher(): Observable<LanguageDTO[]> {
    return this.http
      .get<any>(environment.apiUrl + URL_API_I18N_MESSAGES_LIST)
      .pipe(
        map((response) => {
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
        catchError(() => of(this.appConfigService.getDefaultLanguages())),
        map((languages) => this.applyLanguagesToUse(languages))
      );
  }

  setLanguage(lang: string, syncBackend = true): Observable<void> {
    localStorage.setItem(this.STORED_LANGUAGE, lang);
    this.translateService.use(lang);

    if (syncBackend && this.authenticationService.isLoggedIn()) {
      const languageDTO: LanguageDTO = { name: lang, shortname: lang };
      return this.i18nService.updateUserLanguage(languageDTO).pipe(
        map(() => undefined),
        catchError(() => {
          console.warn('Failed to sync language with backend');
          return of(undefined);
        })
      );
    }

    return of(undefined);
  }

  getLanguageName(languages: LanguageDTO[], shortname: string): string {
    if (!languages || !shortname) {
      return 'Language';
    }
    const language = languages.find((lang) => lang.shortname === shortname);
    return language ? language.name : 'Language';
  }

  /**
   * @deprecated Prefer getLanguagesForSwitcher for toolbar chrome.
   */
  getLanguagesTranslated(lang: string): Observable<LanguageDTO[]> {
    return this.i18nService.getLanguagesTranslated(lang).pipe(
      map((response: any) => {
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

  getLanguagesTranslatedSorted(_lang: string): Observable<LanguageDTO[]> {
    return this.getLanguagesForSwitcher();
  }

  loadUserLanguage(): Observable<string> {
    if (this.authenticationService.isLoggedIn()) {
      return this.http.get<LanguageDTO>(URL_API_I18N_LANGUAGE).pipe(
        map((languageDto: LanguageDTO) => {
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
        catchError(() => of(this.getCurrentLanguage()))
      );
    }
    return of(this.getCurrentLanguage());
  }

  getLanguageIcon(shortname: string): string {
    return this.appConfigService.getLanguageIcon(shortname);
  }

  private availableShortnames(): string[] {
    if (this.availableLanguages.length > 0) {
      return this.availableLanguages.map((l) => l.shortname);
    }
    return (this.appConfigService.getDefaultLanguages() || []).map(
      (l) => l.shortname
    );
  }
}

export interface LanguageDTO {
  name: string;
  shortname: string;
  order?: number | null;
  enabled?: boolean;
}
