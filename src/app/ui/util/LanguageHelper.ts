import { I18nService } from '@api/services/i18n.service';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageHelper {
  public static defaultLanguage: string = localStorage.getItem('language') ?? 'es';

  constructor(private i18nService: I18nService) {}

  /**
   * Return a list of available languages.
   * @returns A list of available languages. If the API call fails, it returns a default list.
   */
  getLanguages(): Observable<LanguageDTO[]> {
    return this.i18nService.availableLanguageCodes().pipe(
      map((response: any) => {
        let languages: LanguageDTO[] = response?._embedded?.languages ?? [];
        if (!languages || languages.length === 0) {
          return [
            { name: 'Español', shortname: 'es' },
            { name: 'English', shortname: 'en' },
            { name: 'Français', shortname: 'fr' },
            { name: 'Català', shortname: 'ca' }
          ];
        }
        return languages;
      }),
      catchError(() =>
        of([
          { name: 'Español', shortname: 'es' },
          { name: 'English', shortname: 'en' },
          { name: 'Français', shortname: 'fr' },
          { name: 'Català', shortname: 'ca' }
        ])
      )
    );
  }
}

export interface LanguageDTO {
  name: string;
  shortname: string;
}
