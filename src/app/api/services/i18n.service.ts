import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  URL_API_I18N_LANGUAGE,
  URL_API_I18N_MESSAGES_LIST,
  URL_API_I18N_LANGUAGES_TRANSLATED
} from '@api/api-config';
import { CustomDetails } from '@api/services/user.service';
import { AuthenticationService } from '@auth/services/authentication.service';
import { map, Observable, of, switchMap } from 'rxjs';
import { LanguageDTO } from 'src/app/services/language.service';
import { environment } from 'src/environments/environment';

import { messages } from './messages';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  messages: any = messages;

  private cachedLanguages?: string[];

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService<CustomDetails>
  ) {}

  availableLanguageCodes(): Observable<LanguageDTO[]> {
    return this.http.get<LanguageDTO[]>(
      environment.apiUrl + URL_API_I18N_MESSAGES_LIST
    );
  }

  /**
   * Get available languages with names translated in the specified language.
   * @param lang The language shortname (e.g., 'es', 'en') to get translated language names
   * @returns Observable of LanguageDTO array with translated names
   */
  getLanguagesTranslated(lang: string): Observable<LanguageDTO[]> {
    return this.http.get<LanguageDTO[]>(
      environment.apiUrl + URL_API_I18N_LANGUAGES_TRANSLATED(lang)
    );
  }

  getUserLanguage(): Observable<string> {
    const defaultLanguage$ = this.availableLanguageCodes().pipe(
      map((languages) => languages[0]?.name ?? 'en')
    );

    if (this.authenticationService.isLoggedIn()) {
      return this.http.get<LanguageDTO>(URL_API_I18N_LANGUAGE).pipe(
        switchMap((languageDto) => {
          if (languageDto && languageDto.name) {
            return of(languageDto.name);
          } else {
            return defaultLanguage$;
          }
        })
      );
    } else {
      return defaultLanguage$;
    }
  }

  updateUserLanguage(language: LanguageDTO): Observable<LanguageDTO> {
    return this.http.put<LanguageDTO>(URL_API_I18N_LANGUAGE, language);
  }

  hasMessage(code: string): boolean {
    return !!this.messages[code];
  }

  getMessage(code: string, args?: any[]): string {
    if (this.hasMessage(code)) {
      let translated = this.messages[code];
      if (args) {
        args.forEach((arg, index) => {
          translated = translated.replace(`{${index}}`, arg);
        });
      }
      return translated;
    }
    return `???${code}???`;
  }
}
