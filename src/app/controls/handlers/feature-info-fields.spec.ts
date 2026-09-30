import {
  buildFeatureInfoRows,
  resolveFeaturePath,
  type FeatureInfoField
} from './feature-info-fields';

describe('buildFeatureInfoRows', () => {
  it('shows every non-geometry property in response order when the list is empty', () => {
    const rows = buildFeatureInfoRows(
      {
        season: 'summer',
        geometry: { type: 'Point', coordinates: [0, 0] },
        'ns:GEOM': 'x',
        count: 2
      },
      [],
      'es'
    );

    expect(rows.map((row) => row.path)).toEqual(['season', 'count']);
    expect(rows[0]).toEqual({
      path: 'season',
      label: 'season',
      cell: { kind: 'auto', value: 'summer' }
    });
  });

  it('filters, orders, and replaces headers without changing feature data', () => {
    const data = {
      season: 'summer',
      code: 'A',
      getData(): Record<string, unknown> {
        return data;
      }
    };
    const before = JSON.stringify({ season: data.season, code: data.code });
    const fields: FeatureInfoField[] = [
      { name: 'season', label: 'Temporada', format: 'T', order: 2 },
      { name: 'code', label: 'Code', format: 'T', order: 0 }
    ];

    const rows = buildFeatureInfoRows(data, fields, 'en');

    expect(rows.map((row) => [row.path, row.label])).toEqual([
      ['code', 'Code'],
      ['season', 'Temporada']
    ]);
    expect(JSON.stringify({ season: data.season, code: data.code })).toBe(before);
    expect(data.getData()).toBe(data);
  });

  it('reads a nested path and one array element', () => {
    const data = { address: { city: 'Girona' }, items: [{ name: 'A' }] };

    expect(resolveFeaturePath(data, 'address.city')).toBe('Girona');
    expect(resolveFeaturePath(data, 'items[0].name')).toBe('A');
    expect(
      buildFeatureInfoRows(
        data,
        [{ name: 'address.city', label: 'City', format: 'T' }],
        'en'
      )[0].cell
    ).toEqual({ kind: 'text', text: 'Girona' });
    expect(data).toEqual({ address: { city: 'Girona' }, items: [{ name: 'A' }] });
  });

  it('renders a blank text cell when a listed name is missing', () => {
    const rows = buildFeatureInfoRows(
      { name: 'e2e-gfi-click' },
      [
        { name: 'name', label: 'Place', format: 'T', order: 0 },
        { name: 'missing-attr', label: 'Missing', format: 'T', order: 1 }
      ],
      'en'
    );

    expect(rows).toEqual([
      { path: 'name', label: 'Place', cell: { kind: 'text', text: 'e2e-gfi-click' } },
      { path: 'missing-attr', label: 'Missing', cell: { kind: 'text', text: '' } }
    ]);
  });
});

describe('feature info formats', () => {
  const value = '2024-01-02T15:04:05';

  it('AUTO leaves the value for API-SITNA', () => {
    const field = (name: string): FeatureInfoField => ({
      name,
      label: name,
      format: 'AUTO'
    });
    const data = {
      amount: 1234.5,
      when: value,
      site: 'https://example.test/a',
      open: true,
      photo: 'image__photos/a.jpg',
      note: 'plain'
    };

    const rows = buildFeatureInfoRows(
      data,
      Object.keys(data).map((name) => field(name)),
      'es'
    );

    expect(rows.map((row) => row.cell)).toEqual([
      { kind: 'auto', value: 1234.5 },
      { kind: 'auto', value },
      { kind: 'auto', value: 'https://example.test/a' },
      { kind: 'auto', value: true },
      { kind: 'auto', value: 'image__photos/a.jpg' },
      { kind: 'auto', value: 'plain' }
    ]);
  });

  it('T keeps the original string', () => {
    const rows = buildFeatureInfoRows(
      { when: '2024-01-02' },
      [{ name: 'when', label: 'When', format: 'T' }],
      'es'
    );
    expect(rows[0].cell).toEqual({ kind: 'text', text: '2024-01-02' });
  });

  it('N groups a locale number and pads only when asked', () => {
    expect(numberCell('es', 1234.56789, null, false)).toBe('1.234,56789');
    expect(numberCell('en', 1234.56789, null, false)).toBe('1,234.56789');
    expect(numberCell('es', 1234.56789, 2, false)).toBe('1.234,57');
    expect(numberCell('en', 1234.56789, 2, false)).toBe('1,234.57');
    expect(numberCell('es', 1234.56789, 0, false)).toBe('1.235');
    expect(numberCell('en', 1234.56789, 0, false)).toBe('1,235');
    expect(numberCell('es', 1234.5, 2, false)).toBe('1.234,5');
    expect(numberCell('en', 1234.5, 2, false)).toBe('1,234.5');
    expect(numberCell('es', 1234.5, 2, true)).toBe('1.234,50');
    expect(numberCell('en', 1234.5, 2, true)).toBe('1,234.50');
    expect(numberCell('es', 1234, 2, true)).toBe('1.234,00');
    expect(numberCell('en', 1234, 2, true)).toBe('1,234.00');
  });

  it('F formats only yyyy-MM-ddTHH:mm:ss in the viewer locale', () => {
    expect(dateCell('es', value, null)).toBe('02/01/2024, 15:04:05');
    expect(dateCell('en', value, null)).toBe('01/02/2024, 15:04:05');
    expect(dateCell('es', value, 'datetime')).toBe('02/01/2024, 15:04:05');
    expect(dateCell('es', value, 'date')).toBe('02/01/2024');
    expect(dateCell('en', value, 'date')).toBe('01/02/2024');
    expect(dateCell('es', '2024-01-02', 'date')).toBe('2024-01-02');
  });

  it('U links the original value', () => {
    const rows = buildFeatureInfoRows(
      { site: 'https://example.test/a' },
      [{ name: 'site', label: 'Site', format: 'U' }],
      'en'
    );
    expect(rows[0].cell).toEqual({
      kind: 'link',
      href: 'https://example.test/a',
      text: 'https://example.test/a'
    });
  });

  it('P multiplies by 100 and then uses the number rule', () => {
    expect(percentCell('es', 0.156789, 2, false)).toBe('15,68\u00a0%');
    expect(percentCell('en', 0.156789, 2, false)).toBe('15.68%');
    expect(percentCell('es', 0.156789, 2, true)).toBe('15,68\u00a0%');
    expect(percentCell('en', 0.156789, 2, true)).toBe('15.68%');
    expect(percentCell('es', 0.156, 2, false)).toBe('15,6\u00a0%');
    expect(percentCell('en', 0.156, 2, false)).toBe('15.6%');
    expect(percentCell('es', 0.156, 2, true)).toBe('15,60\u00a0%');
    expect(percentCell('en', 0.156, 2, true)).toBe('15.60%');
  });

  it('I uses the original string as the image address', () => {
    const rows = buildFeatureInfoRows(
      { photo: 'photos/a.jpg' },
      [{ name: 'photo', label: 'Photo', format: 'I' }],
      'en'
    );
    expect(rows[0].cell).toEqual({ kind: 'image', src: 'photos/a.jpg' });
  });
});

function numberCell(
  locale: string,
  value: number,
  digits: number | null,
  pad: boolean
): string {
  const rows = buildFeatureInfoRows(
    { amount: value },
    [
      {
        name: 'amount',
        label: 'Amount',
        format: 'N',
        fractionDigits: digits,
        padFractionDigits: pad
      }
    ],
    locale
  );
  const cell = rows[0].cell;
  if (cell.kind !== 'text') {
    throw new Error('expected text');
  }
  return cell.text;
}

function percentCell(
  locale: string,
  value: number,
  digits: number,
  pad: boolean
): string {
  const rows = buildFeatureInfoRows(
    { ratio: value },
    [
      {
        name: 'ratio',
        label: 'Ratio',
        format: 'P',
        fractionDigits: digits,
        padFractionDigits: pad
      }
    ],
    locale
  );
  const cell = rows[0].cell;
  if (cell.kind !== 'text') {
    throw new Error('expected text');
  }
  return cell.text;
}

function dateCell(
  locale: string,
  value: string,
  dateStyle: string | null
): string {
  const rows = buildFeatureInfoRows(
    { when: value },
    [{ name: 'when', label: 'When', format: 'F', dateStyle }],
    locale
  );
  const cell = rows[0].cell;
  if (cell.kind !== 'text') {
    throw new Error('expected text');
  }
  return cell.text;
}
