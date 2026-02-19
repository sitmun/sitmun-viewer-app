export type MoreInfoRow = Record<string, any>;

export function normalizeMoreInfoRows(data: any): MoreInfoRow[] {
  if (data == null) return [];

  if (typeof data === 'string') {
    return normalizeStringData(data);
  }

  if (Array.isArray(data)) {
    return normalizeArrayData(data);
  }

  if (typeof data === 'object') {
    if (!hasNestedValues(data)) {
      return [data];
    }

    return flattenToPathRows(data);
  }

  return [{ value: data }];
}

function normalizeStringData(data: string): MoreInfoRow[] {
  const trimmed = data.trim();
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      const parsed = JSON.parse(trimmed);
      return normalizeMoreInfoRows(parsed);
    } catch {
      return [{ value: data }];
    }
  }

  return [{ value: data }];
}

function normalizeArrayData(data: any[]): MoreInfoRow[] {
  if (data.length === 0) return [];

  if (
    data.every((item) => item && typeof item === 'object') &&
    data.every((item) => !hasNestedValues(item))
  ) {
    return data;
  }

  return flattenToPathRows(data);
}

function flattenToPathRows(data: any): MoreInfoRow[] {
  const rows: Array<{ field: string; value: string }> = [];

  const walk = (value: any, path: string): void => {
    if (value === null || value === undefined) {
      rows.push({ field: path || 'value', value: '' });
      return;
    }

    if (isPrimitiveValue(value)) {
      rows.push({ field: path || 'value', value: String(value) });
      return;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        rows.push({ field: path || 'value', value: '[]' });
        return;
      }

      value.forEach((item, index) => {
        const childPath = path
          ? path + '[' + String(index) + ']'
          : '[' + String(index) + ']';
        walk(item, childPath);
      });
      return;
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) {
        rows.push({ field: path || 'value', value: '{}' });
        return;
      }

      keys.forEach((key) => {
        const childPath = path ? path + '.' + key : key;
        walk(value[key], childPath);
      });
    }
  };

  walk(data, '');
  return rows;
}

function hasNestedValues(value: any): boolean {
  if (!value || typeof value !== 'object') return false;

  return Object.values(value).some((item) => {
    return !!item && typeof item === 'object';
  });
}

function isPrimitiveValue(value: any): boolean {
  const valueType = typeof value;
  return (
    valueType === 'string' || valueType === 'number' || valueType === 'boolean'
  );
}
