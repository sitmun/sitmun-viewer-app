import { I18nService } from '@api/services/i18n.service';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageHelper {
  public defaultLanguage: string = localStorage.getItem('language') ?? 'es';

  constructor(private i18nService: I18nService) {}

  /**
   * Return a list of available languages.
   * @returns A list of available languages. If the API call fails, it returns a default list.
   */
  getLanguages(): Observable<LanguageDTO[]> {
    return this.i18nService.availableLanguageCodes().pipe(
      map((languages: LanguageDTO[] | null | undefined) => {
        if (!languages || languages.length === 0) {
          return [
            { name: 'es', shortName: 'ES', nativeName: 'Español' },
            { name: 'en', shortName: 'EN', nativeName: 'English' },
            { name: 'fr', shortName: 'FR', nativeName: 'Français' },
            { name: 'ca', shortName: 'CA', nativeName: 'Català' }
          ];
        }
        return languages;
      }),
      catchError(() =>
        of([
          { name: 'es', shortName: 'Español' },
          { name: 'en', shortName: 'English' },
          { name: 'fr', shortName: 'Français' },
          { name: 'ca', shortName: 'Català' }
        ])
      )
    );
  }
}

export interface LanguageDTO {
  name: string;
  shortName: string;
}
