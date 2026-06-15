import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { I18nService } from '@api/services/i18n.service';
import { AuthenticationService } from '@auth/services/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AppConfigService } from './app-config.service';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;
  let translateService: jest.Mocked<Pick<TranslateService, 'setDefaultLang' | 'use'>>;
  let appConfigService: jest.Mocked<Pick<AppConfigService, 'getDefaultLanguage' | 'getDefaultLanguages'>>;

  beforeEach(() => {
    translateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn().mockReturnValue(of({}))
    };
    appConfigService = {
      getDefaultLanguage: jest.fn().mockReturnValue('es'),
      getDefaultLanguages: jest.fn().mockReturnValue([])
    };

    TestBed.configureTestingModule({
      providers: [
        LanguageService,
        { provide: TranslateService, useValue: translateService },
        { provide: AppConfigService, useValue: appConfigService },
        {
          provide: I18nService,
          useValue: {
            updateUserLanguage: jest.fn().mockReturnValue(of(null)),
            getLanguagesTranslated: jest.fn().mockReturnValue(of([]))
          }
        },
        {
          provide: AuthenticationService,
          useValue: { isLoggedIn: jest.fn().mockReturnValue(false) }
        },
        { provide: HttpClient, useValue: { get: jest.fn().mockReturnValue(of(null)) } }
      ]
    });
    service = TestBed.inject(LanguageService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initializeTranslateService', () => {
    it('sets default lang from config, not from stored language', () => {
      localStorage.setItem('language', 'fr');
      service.initializeTranslateService();
      expect(translateService.setDefaultLang).toHaveBeenCalledWith('es');
    });

    it('uses stored language as active language', () => {
      localStorage.setItem('language', 'fr');
      service.initializeTranslateService();
      expect(translateService.use).toHaveBeenCalledWith('fr');
    });

    it('uses config default as active language when nothing is stored', () => {
      service.initializeTranslateService();
      expect(translateService.setDefaultLang).toHaveBeenCalledWith('es');
      expect(translateService.use).toHaveBeenCalledWith('es');
    });
  });

  describe('setLanguage', () => {
    it('stores language and calls use()', (done) => {
      service.setLanguage('ca', false).subscribe(() => {
        expect(localStorage.getItem('language')).toBe('ca');
        expect(translateService.use).toHaveBeenCalledWith('ca');
        done();
      });
    });
  });
});
