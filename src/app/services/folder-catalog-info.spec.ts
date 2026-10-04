import {
  applyFolderCatalogInfo,
  presentFolderLayerInfo
} from './folder-catalog-info';
import { WMSLayer } from '../types/wms-capabilities';

const formatLabel = (kind: 'metadata' | 'download', format: string): string =>
  format || kind;

describe('folder catalog info', () => {
  it('copies description, metadata URL, and dataset URL onto the group layer', () => {
    const layer: WMSLayer = { Title: 'Adreces' };
    applyFolderCatalogInfo(layer, {
      children: ['node/2'],
      description: 'Carrers, números de portal i illes urbanes del municipi.',
      metadataURL: 'https://www.icgc.cat/ca/Geoinformacio-i-mapes',
      datasetURL: 'https://www.icgc.cat/ca/Descarregues'
    });
    expect(layer.Abstract).toBe(
      'Carrers, números de portal i illes urbanes del municipi.'
    );
    expect(layer.MetadataURL).toEqual([
      {
        Format: 'text/html',
        OnlineResource: {
          'xlink:href': 'https://www.icgc.cat/ca/Geoinformacio-i-mapes'
        }
      }
    ]);
    expect(layer.DataURL).toEqual([
      {
        Format: 'application/octet-stream',
        OnlineResource: { 'xlink:href': 'https://www.icgc.cat/ca/Descarregues' }
      }
    ]);
    expect(layer.Name).toBeUndefined();
  });

  it('does not copy info fields onto a layer node', () => {
    const layer: WMSLayer = { Title: 'Illes urbanes' };
    applyFolderCatalogInfo(layer, {
      resource: 'layer/9',
      description: 'A leaf description',
      metadataURL: 'https://example.cat/meta'
    });
    expect(layer.Abstract).toBeUndefined();
    expect(layer.MetadataURL).toBeUndefined();
  });

  it('leaves the group layer unchanged when the folder has no info fields', () => {
    const layer: WMSLayer = { Title: 'Gestió municipal' };
    applyFolderCatalogInfo(layer, {
      children: ['node/2'],
      description: '   ',
      metadataURL: '',
      datasetURL: null
    });
    expect(layer.Abstract).toBeUndefined();
    expect(layer.MetadataURL).toBeUndefined();
    expect(layer.DataURL).toBeUndefined();
  });

  it('shows a dataset-only folder in the dialog as a download link', () => {
    const layer: WMSLayer = { Title: 'Adreces' };
    applyFolderCatalogInfo(layer, {
      children: ['node/2'],
      datasetURL: 'https://www.icgc.cat/adreces.zip'
    });
    const downloads = Array.isArray(layer.DataURL) ? layer.DataURL : [];
    expect(downloads[0]?.OnlineResource?.['xlink:href']).toBe(
      'https://www.icgc.cat/adreces.zip'
    );
    expect(Boolean(layer.Abstract) || Boolean(layer.MetadataURL)).toBe(true);
    const shown = presentFolderLayerInfo(
      { title: 'Adreces', abstract: layer.Abstract },
      layer,
      formatLabel
    );
    expect(shown['abstract']).toBeUndefined();
    expect(shown['dataUrl']).toEqual([
      {
        url: 'https://www.icgc.cat/adreces.zip',
        format: 'application/zip',
        formatDescription: 'application/zip'
      }
    ]);
  });

  it('keeps the description and turns the metadata href into a string', () => {
    const layer: WMSLayer = {
      Title: 'Adreces',
      Abstract: 'Carrers del municipi.',
      DataURL: [
        {
          Format: 'application/zip',
          OnlineResource: { 'xlink:href': 'https://www.icgc.cat/adreces.zip' }
        }
      ]
    };
    const shown = presentFolderLayerInfo(
      {
        title: 'Adreces',
        abstract: 'Carrers del municipi.',
        metadata: [
          {
            format: 'text/xml',
            url: { 'xlink:href': 'https://www.icgc.cat/meta.xml' }
          }
        ]
      },
      layer,
      formatLabel
    );
    expect(shown['abstract']).toBe('Carrers del municipi.');
    expect(shown['metadata']).toEqual([
      { format: 'text/xml', url: 'https://www.icgc.cat/meta.xml' }
    ]);
    expect(shown['dataUrl']).toEqual([
      {
        url: 'https://www.icgc.cat/adreces.zip',
        format: 'application/zip',
        formatDescription: 'application/zip'
      }
    ]);
  });
});
