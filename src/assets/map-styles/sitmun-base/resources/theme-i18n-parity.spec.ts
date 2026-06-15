import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

type LocaleMessages = Record<string, string>;

const RESOURCES_DIR = join(__dirname);
const APP_CONFIG_PATH = join(
  __dirname,
  '..',
  '..',
  '..',
  'config',
  'app-config.json'
);

const MARKUP_PANEL_KEYS = [
  'tools',
  'legend',
  'layers',
  'overviewMap',
  'overviewMap.tooltip'
] as const;

interface AppConfigLanguage {
  locale?: string;
}

interface AppConfig {
  languages?: AppConfigLanguage[];
}

function loadJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, 'utf8')) as T;
}

function loadThemeLocale(locale: string): LocaleMessages {
  const filePath = join(RESOURCES_DIR, `${locale}.json`);
  return loadJson<LocaleMessages>(filePath);
}

const appConfig = loadJson<AppConfig>(APP_CONFIG_PATH);
const configuredLocales = (appConfig.languages ?? [])
  .map((lang) => lang.locale)
  .filter((locale): locale is string => Boolean(locale));

describe('map theme locale parity', () => {
  it('app-config declares at least one language locale', () => {
    expect(configuredLocales.length).toBeGreaterThan(0);
  });

  it.each(configuredLocales)(
    '%s has a theme resource file with required panel keys',
    (locale) => {
      const resourcePath = join(RESOURCES_DIR, `${locale}.json`);
      expect(existsSync(resourcePath)).toBe(true);

      const messages = loadThemeLocale(locale);
      for (const key of MARKUP_PANEL_KEYS) {
        expect(messages[key]).toBeTruthy();
      }
    }
  );
});
