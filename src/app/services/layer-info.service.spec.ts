import { TestBed } from '@angular/core/testing';

import { TranslateService } from '@ngx-translate/core';

import { AppConfigService } from './app-config.service';
import { LayerInfoService } from './layer-info.service';

describe('LayerInfoService', () => {
  let service: LayerInfoService;
  let appConfigService: jest.Mocked<
    Pick<AppConfigService, 'getDefaultLanguage' | 'getDefaultLanguages'>
  >;

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
    appConfigService = {
      getDefaultLanguage: jest.fn().mockReturnValue('es'),
      getDefaultLanguages: jest.fn().mockReturnValue([
        { name: 'Español', shortname: 'es' },
        { name: 'English', shortname: 'en' },
        { name: 'Français', shortname: 'fr' },
        { name: 'Català', shortname: 'ca' },
        { name: 'Aranés', shortname: 'oc-aranes' }
      ])
    };
    TestBed.configureTestingModule({
      providers: [
        LayerInfoService,
        { provide: TranslateService, useValue: { instant: translateInstant } },
        { provide: AppConfigService, useValue: appConfigService }
      ]
    });
    service = TestBed.inject(LayerInfoService);
  });

  describe('extractLanguageAwareText', () => {
    it('returns null when textField is empty', () => {
      expect(service.extractLanguageAwareText(undefined, 'es')).toBeNull();
      expect(service.extractLanguageAwareText(null, 'es')).toBeNull();
    });

    it('returns string directly when provided', () => {
      expect(service.extractLanguageAwareText('Hola', 'es')).toBe('Hola');
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

    it('falls back to configured defaultLanguage when preferred not found', () => {
      // 'de' not in data; defaultLanguage is 'es'
      const textField = { es: 'Español', en: 'English' };
      expect(service.extractLanguageAwareText(textField, 'de')).toBe('Español');
    });

    it('matches oc-aranes as full shortname from config, not collapsed to oc', () => {
      const textField = { 'oc-aranes': 'Aranés', oc: 'Occitan generic' };
      expect(service.extractLanguageAwareText(textField, 'oc-aranes')).toBe(
        'Aranés'
      );
    });

    it('falls back to configured oc-aranes when oc-aranes is the default language', () => {
      appConfigService.getDefaultLanguage.mockReturnValue('oc-aranes');
      const textField = { 'oc-aranes': 'Aranés', en: 'English' };
      expect(service.extractLanguageAwareText(textField, 'de')).toBe('Aranés');
    });

    it('tries oc-aranes from configured list before falling back to first value', () => {
      // preferred 'de' not found; fallback chain: 'es'(miss), 'en'(miss), 'fr'(miss), 'ca'(miss), 'oc-aranes'(hit)
      const textField = { 'oc-aranes': 'Aranés', pt: 'Português' };
      expect(service.extractLanguageAwareText(textField, 'de')).toBe('Aranés');
    });

    it('falls back to common languages when preferred not found', () => {
      const textField = { fr: 'Francais', en: 'English' };
      expect(service.extractLanguageAwareText(textField, 'de-DE')).toBe(
        'English'
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
