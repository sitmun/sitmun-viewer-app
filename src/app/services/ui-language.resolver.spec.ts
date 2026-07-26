import { resolveUiLanguage, sortByLanguageOrder } from './ui-language.resolver';

describe('resolveUiLanguage', () => {
  it('prefers stored when available', () => {
    expect(
      resolveUiLanguage({
        stored: 'ca',
        backendDefault: 'en',
        availableShortnames: ['ca', 'en', 'es'],
        staticFallback: 'ca'
      })
    ).toBe('ca');
  });

  it('uses backendDefault when stored missing', () => {
    expect(
      resolveUiLanguage({
        stored: null,
        backendDefault: 'en',
        availableShortnames: ['ca', 'en', 'es'],
        staticFallback: 'ca'
      })
    ).toBe('en');
  });

  it('uses staticFallback when backend not available', () => {
    expect(
      resolveUiLanguage({
        stored: null,
        backendDefault: 'de',
        availableShortnames: ['ca', 'en'],
        staticFallback: 'en'
      })
    ).toBe('en');
  });
});

describe('sortByLanguageOrder', () => {
  it('sorts by order then shortname', () => {
    expect(
      sortByLanguageOrder([
        { shortname: 'en', order: 3 },
        { shortname: 'ca', order: 1 }
      ]).map((l) => l.shortname)
    ).toEqual(['ca', 'en']);
  });
});
