import { map, Observable, of, switchMap, tap } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '@auth/services/authentication.service';
import { CustomDetails } from '@api/services/user.service';
import { messages } from './messages';
import {
  URL_API_I18N_LANGUAGE,
  URL_API_I18N_MESSAGES_LIST
} from '@api/api-config';

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

  availableLanguageCodes(): Observable<string[]> {
    if (this.cachedLanguages != null) {
      // const clonadoSimple = this.cachedLanguages.map(c => Object.assign({}, c));
      // return of(clonadoSimple);
      return of([...this.cachedLanguages]);
    } else {
      return this.http
        .get<string[]>(URL_API_I18N_MESSAGES_LIST)
        .pipe(tap((languages) => (this.cachedLanguages = languages)));
    }
  }

  getUserLanguage(): Observable<string> {
    const defaultLanguage$ = this.availableLanguageCodes().pipe(
      map((languageCodes) => languageCodes[0])
    );
    if (this.authenticationService.isLoggedIn()) {
      return this.http.get<LanguageDTO>(URL_API_I18N_LANGUAGE).pipe(
        switchMap((languageDto) => {
          if (languageDto && languageDto.language) {
            return of(languageDto.language);
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

  getMessage(code: string, args?: any[]) {
    if (this.hasMessage(code)) {
      var translated = this.messages[code];
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

export interface LanguageDTO {
  language: string;
}
