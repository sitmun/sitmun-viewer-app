import type { FeatureInfoField } from '@api/model/app-cfg';

export type { FeatureInfoField };

export type FeatureInfoCell =
  | { kind: 'auto'; value: unknown }
  | { kind: 'text'; text: string }
  | { kind: 'link'; href: string; text: string }
  | { kind: 'image'; src: string };

export interface FeatureInfoDisplayRow {
  path: string;
  label: string;
  cell: FeatureInfoCell;
}

const GEOMETRY_TYPES = new Set([
  'Point',
  'MultiPoint',
  'LineString',
  'MultiLineString',
  'Polygon',
  'MultiPolygon',
  'GeometryCollection'
]);

const DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/;

type FormatCode = 'AUTO' | 'T' | 'N' | 'F' | 'U' | 'P' | 'I';

export function resolveFeaturePath(data: unknown, path: string): unknown {
  if (data == null || path === '') {
    return undefined;
  }
  let current: unknown = data;
  for (const token of tokenize(path)) {
    if (current == null || typeof current !== 'object') {
      return undefined;
    }
    if (typeof token === 'number') {
      if (!Array.isArray(current) || token >= current.length) {
        return undefined;
      }
      current = current[token];
      continue;
    }
    if (!Object.prototype.hasOwnProperty.call(current, token)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[token];
  }
  return current;
}

export function buildFeatureInfoRows(
  data: Record<string, unknown> | null | undefined,
  fields: FeatureInfoField[] | null | undefined,
  locale: string
): FeatureInfoDisplayRow[] {
  const source = data ?? {};
  if (!fields?.length) {
    return Object.keys(source)
      .filter((key) => !isGeometry(key, source[key]))
      .map((key) => ({
        path: key,
        label: key,
        cell: { kind: 'auto', value: source[key] }
      }));
  }
  return fields
    .map((field, index) => ({ field, index }))
    .sort((left, right) => compareOrder(left, right))
    .map(({ field }) => ({
      path: field.name,
      label: field.label,
      cell: formatCell(resolveFeaturePath(source, field.name), field, locale)
    }));
}

function tokenize(path: string): Array<string | number> {
  const tokens: Array<string | number> = [];
  const pattern = /([^[.\]]+)|\[(\d+)\]/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(path)) !== null) {
    if (match[2] != null) {
      tokens.push(Number(match[2]));
    } else if (match[1]) {
      tokens.push(match[1]);
    }
  }
  return tokens;
}

function compareOrder(
  left: { field: FeatureInfoField; index: number },
  right: { field: FeatureInfoField; index: number }
): number {
  const leftOrder = left.field.order;
  const rightOrder = right.field.order;
  if (leftOrder == null && rightOrder == null) {
    return left.index - right.index;
  }
  if (leftOrder == null) {
    return 1;
  }
  if (rightOrder == null) {
    return -1;
  }
  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }
  return left.index - right.index;
}

function isGeometry(key: string, value: unknown): boolean {
  if (/^(geometry|geom)$/i.test(key) || /:geom$/i.test(key)) {
    return true;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const type = (value as { type?: unknown }).type;
  return typeof type === 'string' && GEOMETRY_TYPES.has(type);
}

function formatCell(
  value: unknown,
  field: FeatureInfoField,
  locale: string
): FeatureInfoCell {
  const format = normalizeFormat(field.format);
  switch (format) {
    case 'AUTO':
      return { kind: 'auto', value };
    case 'T':
      return { kind: 'text', text: asText(value) };
    case 'N':
      return {
        kind: 'text',
        text: formatNumber(value, locale, field, false) ?? asText(value)
      };
    case 'P':
      return {
        kind: 'text',
        text: formatNumber(value, locale, field, true) ?? asText(value)
      };
    case 'F':
      return { kind: 'text', text: formatDate(value, locale, field.dateStyle) };
    case 'U':
      return { kind: 'link', href: asText(value), text: asText(value) };
    case 'I':
      return { kind: 'image', src: asText(value) };
    default: {
      const unreachable: never = format;
      return unreachable;
    }
  }
}

function normalizeFormat(format: string | null | undefined): FormatCode {
  if (
    format === 'T' ||
    format === 'N' ||
    format === 'F' ||
    format === 'U' ||
    format === 'P' ||
    format === 'I'
  ) {
    return format;
  }
  return 'AUTO';
}

function asText(value: unknown): string {
  if (value == null) {
    return '';
  }
  return String(value);
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && /^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(value.trim())) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function fractionDigits(field: FeatureInfoField): number {
  const digits = field.fractionDigits;
  if (typeof digits === 'number' && Number.isInteger(digits) && digits >= 0) {
    return digits;
  }
  return 7;
}

function formatNumber(
  value: unknown,
  locale: string,
  field: FeatureInfoField,
  percent: boolean
): string | null {
  const numeric = asNumber(value);
  if (numeric == null) {
    return null;
  }
  const digits = fractionDigits(field);
  const options: Intl.NumberFormatOptions = {
    maximumFractionDigits: digits,
    useGrouping: true
  };
  if (field.padFractionDigits === true) {
    options.minimumFractionDigits = digits;
  }
  if (percent) {
    options.style = 'percent';
  }
  return new Intl.NumberFormat(locale, options).format(numeric);
}

function formatDate(
  value: unknown,
  locale: string,
  dateStyle: string | null | undefined
): string {
  const raw = asText(value);
  const match = DATE_TIME.exec(raw);
  if (!match) {
    return raw;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const date = new Date(year, month - 1, day, hour, minute, second);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute ||
    date.getSeconds() !== second
  ) {
    return raw;
  }
  const dateOnly = dateStyle === 'date';
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  if (!dateOnly) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.second = '2-digit';
    options.hour12 = false;
  }
  return new Intl.DateTimeFormat(locale, options).format(date);
}
