import { toLanguageIsoCode } from './language-iso';

describe('toLanguageIsoCode', () => {
  it('maps oc-aranes to OC', () => {
    expect(toLanguageIsoCode('oc-aranes')).toBe('OC');
  });

  it('maps ca to CA', () => {
    expect(toLanguageIsoCode('ca')).toBe('CA');
  });

  it('maps zh-Hans to ZH', () => {
    expect(toLanguageIsoCode('zh-Hans')).toBe('ZH');
  });
});
