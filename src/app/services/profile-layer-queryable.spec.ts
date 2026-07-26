import { AppLayer } from '@api/model/app-cfg';

import {
  isProfileLayerQueryable,
  resolveSitmunGfiEnabled
} from './profile-layer-queryable';

describe('isProfileLayerQueryable', () => {
  const base: AppLayer = {
    id: 'layer/x',
    title: 'T',
    layers: ['a'],
    service: 'service/1'
  };

  it('returns true when queryableFeatureEnabled is omitted (legacy profile)', () => {
    expect(isProfileLayerQueryable(base)).toBe(true);
  });

  it('returns true when queryableFeatureEnabled is true', () => {
    expect(isProfileLayerQueryable({ ...base, queryableFeatureEnabled: true })).toBe(true);
  });

  it('returns false when queryableFeatureEnabled is false', () => {
    expect(isProfileLayerQueryable({ ...base, queryableFeatureEnabled: false })).toBe(false);
  });
});

describe('resolveSitmunGfiEnabled', () => {
  const base: AppLayer = {
    id: 'layer/x',
    title: 'T',
    layers: ['a'],
    service: 'service/1',
    queryableFeatureEnabled: true
  };

  it('returns false when tree node is not a queryable leaf (consultable off)', () => {
    expect(resolveSitmunGfiEnabled(false, base)).toBe(false);
  });

  it('returns false when leaf is queryable but cartography disables GFI', () => {
    expect(
      resolveSitmunGfiEnabled(true, {
        ...base,
        queryableFeatureEnabled: false
      })
    ).toBe(false);
  });

  it('returns true when leaf is queryable and cartography allows GFI', () => {
    expect(resolveSitmunGfiEnabled(true, base)).toBe(true);
  });

  it('returns true for queryable leaf without app layer (legacy)', () => {
    expect(resolveSitmunGfiEnabled(true, null)).toBe(true);
  });
});
