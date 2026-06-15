import { readFileSync } from 'fs';
import { join } from 'path';

type LocaleMessages = Record<string, string>;

const I18N_DIR = join(__dirname);

function loadLocale(filename: string): LocaleMessages {
  return JSON.parse(readFileSync(join(I18N_DIR, filename), 'utf8')) as LocaleMessages;
}

const en = loadLocale('en.json');
const es = loadLocale('es.json');
const fr = loadLocale('fr.json');
const ca = loadLocale('ca.json');
const ocAranes = loadLocale('oc-aranes.json');

const REFERENCE_KEYS = Object.keys(en).sort();

const LOCALES: Record<string, LocaleMessages> = {
  es,
  fr,
  ca,
  'oc-aranes': ocAranes
};

const REQUIRED_AUTH_KEYS = ['auth.logoutFailed', 'auth.publicAccessFailed'] as const;

describe('i18n locale parity', () => {
  it.each(Object.keys(LOCALES))('%s has the same keys as en.json', (locale) => {
    expect(Object.keys(LOCALES[locale]).sort()).toEqual(REFERENCE_KEYS);
  });

  it.each([...REQUIRED_AUTH_KEYS])('%s exists in every locale file', (authKey) => {
    expect(en[authKey]).toBeTruthy();
    for (const messages of Object.values(LOCALES)) {
      expect(messages[authKey]).toBeTruthy();
    }
  });
});
