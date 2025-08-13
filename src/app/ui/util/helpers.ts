import { formatDate } from '@angular/common';

export class DateUtils {
  // TODO
  static toLocalLongTime(utcDate: string): string {
    // return formatDate(utcDate, 'yyyy-MM-dd HH:mm:ss', 'en-US');
    if (StringUtils.isEmpty(utcDate)) {
      return '';
    }
    return formatDate(utcDate, 'yyyy-MM-dd HH:mm:ss', 'en-US');
    // return formatDate(utcDate + 'Z', 'yyyy-MM-dd HH:mm:ss', 'en-US');
  }

  static toLocalDate(utcDate: string): string {
    // return formatDate(utcDate, 'yyyy-MM-dd', 'en-US');
    if (StringUtils.isEmpty(utcDate)) {
      return '';
    }
    return formatDate(utcDate + 'Z', 'yyyy-MM-dd', 'en-US');
  }
}

export class StringUtils {
  static isEmpty(field?: string | null): boolean {
    return field?.trim() === '';
  }

  static isNotEmpty(field?: string | null): boolean {
    return !!field && field.trim().length > 0;
  }

  static ellipsis(input: string, limit: number, placeholder = '...'): string {
    if (input != null && input.trim().length > limit) {
      return `${input.slice(0, limit).trim()}${placeholder}`;
    }
    return input;
  }
}
