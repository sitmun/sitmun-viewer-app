import { LayerInfoService } from './layer-info.service';

describe('LayerInfoService', () => {
  let service: LayerInfoService;

  beforeEach(() => {
    service = new LayerInfoService();
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

    it('falls back to common languages when preferred not found', () => {
      const textField = { fr: 'Francais', en: 'English' };
      expect(service.extractLanguageAwareText(textField, 'de-DE')).toBe(
        'English'
      );
    });
  });
});
