import { I18nService } from '@api/services/i18n.service';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageHelper {
  public defaultLanguage: string = localStorage.getItem('language') ?? 'es';

  constructor(private i18nService: I18nService) {}

  getLanguages(): Observable<LanguageDTO[]> {
    return this.i18nService.availableLanguageCodes();
  }
}

export interface LanguageDTO {
  name: string;
  shortName: string;
}
