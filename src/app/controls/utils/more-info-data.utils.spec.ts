import { describe, expect, it } from '@jest/globals';

import { normalizeMoreInfoRows } from './more-info-data.utils';

describe('normalizeMoreInfoRows', () => {
  it('returns empty array for null and undefined', () => {
    expect(normalizeMoreInfoRows(null)).toEqual([]);
    expect(normalizeMoreInfoRows(undefined)).toEqual([]);
  });

  it('keeps flat object as a single row', () => {
    const data = { id: 10, name: 'Layer A', active: true };

    expect(normalizeMoreInfoRows(data)).toEqual([data]);
  });

  it('keeps flat object arrays as table rows', () => {
    const data = [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' }
    ];

    expect(normalizeMoreInfoRows(data)).toEqual(data);
  });

  it('flattens nested object into field/value rows', () => {
    const data = {
      user: {
        name: {
          first: 'Claudia',
          last: 'Navarrete'
        },
        age: 39
      }
    };

    expect(normalizeMoreInfoRows(data)).toEqual([
      { field: 'user.name.first', value: 'Claudia' },
      { field: 'user.name.last', value: 'Navarrete' },
      { field: 'user.age', value: '39' }
    ]);
  });

  it('flattens nested arrays with index notation', () => {
    const data = {
      results: [
        {
          name: { first: 'Jane' },
          tags: ['a', 'b']
        }
      ]
    };

    expect(normalizeMoreInfoRows(data)).toEqual([
      { field: 'results[0].name.first', value: 'Jane' },
      { field: 'results[0].tags[0]', value: 'a' },
      { field: 'results[0].tags[1]', value: 'b' }
    ]);
  });

  it('parses JSON strings and normalizes them', () => {
    const json = '{"profile":{"city":"Barcelona"}}';

    expect(normalizeMoreInfoRows(json)).toEqual([
      { field: 'profile.city', value: 'Barcelona' }
    ]);
  });

  it('returns plain string as value when not JSON', () => {
    expect(normalizeMoreInfoRows('hello')).toEqual([{ value: 'hello' }]);
  });

  it('represents empty objects and arrays', () => {
    const data = { a: {}, b: [] };

    expect(normalizeMoreInfoRows(data)).toEqual([
      { field: 'a', value: '{}' },
      { field: 'b', value: '[]' }
    ]);
  });
});
