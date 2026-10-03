import {
  CatalogInfoKind,
  catalogInfoKind,
  catalogInfoVisible
} from './catalog-info-kind';

describe('catalogInfoKind', () => {
  it('returns null for a node that is neither a folder nor a layer', () => {
    expect(catalogInfoKind({})).toBeNull();
    expect(catalogInfoKind(undefined)).toBeNull();
  });

  it('returns folder from children and ignores description', () => {
    expect(
      catalogInfoKind({
        children: ['node/2'],
        description: '   ',
        metadataURL: '',
        datasetURL: null
      })
    ).toBe(CatalogInfoKind.Folder);
  });

  it('returns layer from a cartography resource', () => {
    expect(
      catalogInfoKind({
        children: [],
        resource: 'layer/9',
        metadataURL: ''
      })
    ).toBe(CatalogInfoKind.Layer);
  });
});

describe('catalogInfoVisible', () => {
  it('hides a folder until a description, metadata URL, or dataset URL is set', () => {
    const empty = {
      children: ['node/2'],
      description: '  ',
      metadataURL: '',
      datasetURL: null
    };
    expect(catalogInfoVisible(CatalogInfoKind.Folder, empty)).toBe(false);
    expect(
      catalogInfoVisible(CatalogInfoKind.Folder, {
        ...empty,
        description: 'Carrers del municipi.'
      })
    ).toBe(true);
    expect(
      catalogInfoVisible(CatalogInfoKind.Folder, {
        ...empty,
        metadataURL: 'https://example.cat/meta'
      })
    ).toBe(true);
    expect(
      catalogInfoVisible(CatalogInfoKind.Folder, {
        ...empty,
        datasetURL: 'https://example.cat/adreces.zip'
      })
    ).toBe(true);
  });

  it('keeps a layer visible when the metadata URL is empty', () => {
    expect(
      catalogInfoVisible(CatalogInfoKind.Layer, {
        resource: 'layer/9',
        metadataURL: ''
      })
    ).toBe(true);
  });
});
