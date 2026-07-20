/** Closed toolbar badge — e.g. oc-aranes → OC, ca → CA. No lookup table. */
export function toLanguageIsoCode(shortname: string): string {
  const base = shortname.trim().split(/[-_]/)[0] ?? shortname;
  return base.toUpperCase();
}
