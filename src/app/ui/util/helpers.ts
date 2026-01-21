export class StringUtils {
  static isEmpty(field?: string | null): boolean {
    return field?.trim() === '';
  }

  static isNotEmpty(field?: string | null): boolean {
    return !!field && field.trim().length > 0;
  }
}
