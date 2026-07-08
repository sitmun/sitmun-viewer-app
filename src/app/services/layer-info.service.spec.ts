import { TestBed } from '@angular/core/testing';

import { TranslateService } from '@ngx-translate/core';

import { LanguageService } from './language.service';
import { LayerInfoService } from './layer-info.service';

describe('LayerInfoService', () => {
  let service: LayerInfoService;
  let languageService: jest.Mocked<Pick<LanguageService, 'getCurrentLanguage'>>;

  const translateInstant = (key: string): string =>
    (
      ({
        'layerCatalog.linkType.metadata': 'Metadata',
        'layerCatalog.linkType.download': 'Download',
        'layerCatalog.linkType.format.text_xml': 'XML',
        'layerCatalog.linkType.format.text_html': 'HTML',
        'layerCatalog.linkType.format.application_zip': 'ZIP',
        'layerCatalog.linkType.format.application_octet-stream': 'BIN'
      }) as Record<string, string>
    )[key] ?? key;

  beforeEach(() => {
    languageService = {
      getCurrentLanguage: jest.fn().mockReturnValue('es-ES')
    };
    TestBed.configureTestingModule({
      providers: [
        LayerInfoService,
        { provide: TranslateService, useValue: { instant: translateInstant } },
        { provide: LanguageService, useValue: languageService }
      ]
    });
    service = TestBed.inject(LayerInfoService);
  });

  describe('extractLanguageAwareText', () => {
    it('returns null when textField is empty', () => {
      expect(service.extractLanguageAwareText(undefined)).toBeNull();
      expect(service.extractLanguageAwareText(null)).toBeNull();
    });

    it('returns string directly when provided', () => {
      expect(service.extractLanguageAwareText('Hola')).toBe('Hola');
    });

    it('uses the language selected in the application when no override is passed', () => {
      languageService.getCurrentLanguage.mockReturnValue('ca');
      const textField = { 'ca-ES': 'Catala', 'es-ES': 'Espanol' };

      expect(service.extractLanguageAwareText(textField)).toBe('Catala');
    });

    it('returns preferred language from object', () => {
      const textField = { 'es-ES': 'Espanol', en: 'English' };
      expect(service.extractLanguageAwareText(textField, 'es-ES')).toBe(
        'Espanol'
      );
    });

    it('falls back to base language from object', () => {
      const textField = { es: 'Espanol', en: 'English' };
      expect(service.extractLanguageAwareText(textField, 'es-ES')).toBe(
        'Espanol'
      );
    });

    it('prefers the closest regional variant for the selected language', () => {
      const textField = {
        es: 'Espanol generico',
        'es-MX': 'Espanol mexicano',
        'es-ES': 'Espanol de Espana'
      };
      expect(service.extractLanguageAwareText(textField, 'es-ES')).toBe(
        'Espanol de Espana'
      );
    });

    it('handles xml:lang arrays from WMS capabilities', () => {
      const textField = [
        { 'xml:lang': 'ca-ES', _: 'Catala' },
        { 'xml:lang': 'es-ES', _: 'Espanol' }
      ];
      expect(service.extractLanguageAwareText(textField, 'es-ES')).toBe(
        'Espanol'
      );
      expect(service.extractLanguageAwareText(textField, 'ca-ES')).toBe(
        'Catala'
      );
    });

    it('handles arrays of strings by returning the first item', () => {
      const textField = ['First', 'Second'];
      expect(service.extractLanguageAwareText(textField, 'es-ES')).toBe(
        'First'
      );
    });

    it('prefers language-tagged array entries over earlier untagged text', () => {
      const textField = [
        { _: 'Default abstract' },
        { 'xml:lang': 'ca-ES', _: 'Abstracte català' },
        { 'xml:lang': 'es-ES', _: 'Abstracto castellano' }
      ];
      expect(service.extractLanguageAwareText(textField, 'ca')).toBe(
        'Abstracte català'
      );
    });

    it('returns the first variant when none match the selected language', () => {
      const textField = { es: 'Español', en: 'English' };
      expect(service.extractLanguageAwareText(textField, 'de')).toBe('Español');
    });

    it('matches oc-aranes as full shortname, not collapsed to oc', () => {
      const textField = { 'oc-aranes': 'Aranés', oc: 'Occitan generic' };
      expect(service.extractLanguageAwareText(textField, 'oc-aranes')).toBe(
        'Aranés'
      );
    });

    it('returns the first variant when the selected language has no close match', () => {
      const textField = { 'oc-aranes': 'Aranés', pt: 'Português' };
      expect(service.extractLanguageAwareText(textField, 'de')).toBe('Aranés');
    });

    it('falls back to the first unrelated variant when the selected language has no match', () => {
      const textField = { fr: 'Francais', en: 'English' };
      expect(service.extractLanguageAwareText(textField, 'de-DE')).toBe(
        'Francais'
      );
    });
  });

  describe('describeOgcLinkFormat', () => {
    it('uses generic labels when format is unknown (empty)', () => {
      expect(service.describeOgcLinkFormat('metadata', '')).toBe('Metadata');
      expect(service.describeOgcLinkFormat('download', '   ')).toBe('Download');
    });

    it('uses MIME-specific label when format matches i18n', () => {
      expect(service.describeOgcLinkFormat('metadata', 'text/xml')).toBe(
        'XML'
      );
    });
  });

  describe('extractOgcMetadataAndDataUrls', () => {
    it('returns empty arrays when layer is undefined', () => {
      expect(service.extractOgcMetadataAndDataUrls(undefined)).toEqual({
        metadata: [],
        dataUrl: []
      });
    });

    it('maps single MetadataURL and DataURL', () => {
      const out = service.extractOgcMetadataAndDataUrls({
        Title: 'L',
        MetadataURL: {
          Format: 'text/xml',
          OnlineResource: { 'xlink:href': 'https://md.example/x' }
        },
        DataURL: {
          Format: 'application/zip',
          OnlineResource: { 'xlink:href': 'https://data.example/z.zip' }
        }
      });
      expect(out.metadata).toEqual([
        {
          url: 'https://md.example/x',
          format: 'text/xml',
          type: 'simple',
          formatDescription: 'XML'
        }
      ]);
      expect(out.dataUrl).toEqual([
        {
          url: 'https://data.example/z.zip',
          format: 'application/zip',
          type: 'simple',
          formatDescription: 'ZIP'
        }
      ]);
    });

    it('maps arrays and skips entries without href', () => {
      const out = service.extractOgcMetadataAndDataUrls({
        Title: 'L',
        MetadataURL: [
          { Format: 'text/html', OnlineResource: {} },
          { OnlineResource: { 'xlink:href': '  https://ok  ' } }
        ]
      });
      expect(out.metadata).toEqual([
        {
          url: 'https://ok',
          format: 'text/html',
          type: 'simple',
          formatDescription: 'HTML'
        }
      ]);
    });
  });
});
