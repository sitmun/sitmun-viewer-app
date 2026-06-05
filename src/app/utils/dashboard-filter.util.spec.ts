import { DashboardItem } from '@api/services/common.service';

import {
  escapeRegExp,
  filterDashboardItemsByKeyword
} from './dashboard-filter.util';

function item(partial: Partial<DashboardItem> & { id: number; name: string }): DashboardItem {
  return {
    appPrivate: false,
    isUnavailable: false,
    updateDate: new Date(),
    createdDate: new Date(),
    pointOfContact: 'c',
    headerParams: {},
    ...partial
  };
}

describe('dashboard-filter.util', () => {
  const apps = [
    item({ id: 1, name: 'IDE Menorca', title: 'IDE Menorca', description: 'coast' }),
    item({ id: 2, name: 'IDENA Navarra', title: 'IDENA Navarra' })
  ];

  it('returns all items when keyword is empty', () => {
    expect(filterDashboardItemsByKeyword(apps, '')).toHaveLength(2);
    expect(filterDashboardItemsByKeyword(apps, '   ')).toHaveLength(2);
  });

  it('filters by title or description', () => {
    expect(filterDashboardItemsByKeyword(apps, 'navarra')).toEqual([apps[1]]);
    expect(filterDashboardItemsByKeyword(apps, 'coast')).toEqual([apps[0]]);
  });

  it('escapes regex metacharacters', () => {
    expect(escapeRegExp('a+b')).toBe('a\\+b');
  });
});
