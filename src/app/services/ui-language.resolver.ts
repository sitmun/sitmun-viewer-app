export function resolveUiLanguage(input: {
  stored: string | null | undefined;
  backendDefault: string | null | undefined;
  availableShortnames: string[];
  staticFallback: string;
}): string {
  const available = input.availableShortnames ?? [];
  const inAvailable = (code: string | null | undefined) =>
    !!code && available.includes(code);

  if (inAvailable(input.stored)) {
    return input.stored as string;
  }
  if (inAvailable(input.backendDefault)) {
    return input.backendDefault as string;
  }
  if (inAvailable(input.staticFallback)) {
    return input.staticFallback;
  }
  if (available.length > 0) {
    return available[0];
  }
  return input.staticFallback || 'en';
}

export function sortByLanguageOrder<T extends { order?: number | null; shortname: string }>(
  langs: T[]
): T[] {
  return [...langs].sort((a, b) => {
    const ao = a.order ?? Number.MAX_SAFE_INTEGER;
    const bo = b.order ?? Number.MAX_SAFE_INTEGER;
    if (ao !== bo) {
      return ao - bo;
    }
    return a.shortname.localeCompare(b.shortname);
  });
}

/** Treats null/undefined as enabled (matches backend safety). */
export function isLanguageEnabled(language: { enabled?: boolean | null } | null | undefined): boolean {
  return language?.enabled !== false;
}

export function filterEnabledLanguages<T extends { enabled?: boolean | null }>(langs: T[]): T[] {
  return (langs ?? []).filter(isLanguageEnabled);
}
