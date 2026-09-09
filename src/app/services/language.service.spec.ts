import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { I18nService } from '@api/services/i18n.service';
import { AuthenticationService } from '@auth/services/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AppConfigService } from './app-config.service';
import { LanguageService } from './language.service';
import { environment } from '../../environments/environment';

describe('LanguageService', () => {
  let service: LanguageService;
  let httpMock: HttpTestingController;
  let appConfig: jest.Mocked<
    Pick<AppConfigService, 'getDefaultLanguage' | 'getDefaultLanguages' | 'getLanguageIcon'>
  >;

  beforeEach(() => {
    localStorage.removeItem('language');
    appConfig = {
      getDefaultLanguage: jest.fn().mockReturnValue('es'),
      getDefaultLanguages: jest.fn().mockReturnValue([
        { shortname: 'ca', name: 'Català', order: 1 },
        { shortname: 'en', name: 'English', order: 3 },
        { shortname: 'es', name: 'Castellano', order: 2 }
      ]),
      getLanguageIcon: jest.fn().mockReturnValue('')
    };
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LanguageService,
        {
          provide: I18nService,
          useValue: {
            getLanguagesTranslated: jest.fn(),
            updateUserLanguage: jest.fn()
          }
        },
        { provide: AppConfigService, useValue: appConfig },
        {
          provide: TranslateService,
          useValue: {
            setDefaultLang: jest.fn(),
            use: jest.fn().mockReturnValue(of({})),
            currentLang: 'en'
          }
        },
        {
          provide: AuthenticationService,
          useValue: { isLoggedIn: jest.fn().mockReturnValue(false) }
        }
      ]
    });
    service = TestBed.inject(LanguageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('language');
  });

  async function flushBootstrap(defaultLang = 'en') {
    const bootstrap = service.bootstrapUiLanguage();
    const confReq = httpMock.expectOne(
      `${environment.apiUrl}/api/configuration-parameters`
    );
    confReq.flush({
      _embedded: {
        'configuration-parameters': [{ name: 'language.default', value: defaultLang }]
      }
    });
    await Promise.resolve();
    const langReq = httpMock.expectOne(`${environment.apiUrl}/api/languages`);
    langReq.flush({
      _embedded: {
        languages: [
          { shortname: 'ca', name: 'Català', order: 1, enabled: true },
          { shortname: 'en', name: 'English', order: 3, enabled: true },
          { shortname: 'es', name: 'Castellano', order: 2, enabled: true },
          { shortname: 'fr', name: 'Français', order: 5, enabled: false }
        ]
      }
    });
    await bootstrap;
  }

  it('uses language.default when storage empty', async () => {
    await flushBootstrap('en');
    expect(service.getCurrentLanguage()).toBe('en');
  });

  it('prefers stored language over backend default', async () => {
    localStorage.setItem('language', 'ca');
    await flushBootstrap('en');
    expect(service.getCurrentLanguage()).toBe('ca');
  });

  it('omits disabled languages from the switcher list', async () => {
    await flushBootstrap('en');
    const shortnames = service['availableLanguages'].map((l) => l.shortname);
    expect(shortnames).toEqual(['ca', 'es', 'en']);
    expect(shortnames).not.toContain('fr');
  });

  it('emits languagesToUse$ when the switcher list is applied', async () => {
    const emissions: string[][] = [];
    service.languagesToUse$.subscribe((langs) => {
      emissions.push(langs.map((l) => l.shortname));
    });
    await flushBootstrap('en');
    expect(emissions.at(-1)).toEqual(['ca', 'es', 'en']);
  });
});
