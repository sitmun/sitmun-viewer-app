import {
  CatalogInfoKind,
  CatalogInfoNode,
  catalogInfoKind,
  catalogInfoVisible
} from './catalog-info-kind';
import { inferOgcLinkFormat } from './layer-info.service';
import { WMSLayer, WmsOnlineResourceLink } from '../types/wms-capabilities';

/**
 * SITNA renders the folder information button only when the group layer has
 * Abstract or MetadataURL. A dataset-only folder has neither, so Abstract is
 * this character and the dialog strips it before render.
 */
const DATASET_ONLY_ABSTRACT = '\u200b';

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function link(kind: 'metadata' | 'download', url: string): WmsOnlineResourceLink {
  return {
    Format: inferOgcLinkFormat(kind, url),
    OnlineResource: { 'xlink:href': url }
  };
}

function asLinks(value: WmsOnlineResourceLink | WmsOnlineResourceLink[] | undefined): WmsOnlineResourceLink[] {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

export function onlineResourceHref(resource: unknown): string {
  if (typeof resource === 'string') {
    return resource.trim();
  }
  if (resource && typeof resource === 'object' && 'xlink:href' in resource) {
    const href = (resource as { 'xlink:href'?: unknown })['xlink:href'];
    return typeof href === 'string' ? href.trim() : '';
  }
  return '';
}

export function applyFolderCatalogInfo(layer: WMSLayer, node: CatalogInfoNode): void {
  const kind = catalogInfoKind(node);
  if (kind !== CatalogInfoKind.Folder || !catalogInfoVisible(kind, node)) {
    return;
  }
  const description = text(node.description);
  const metadata = text(node.metadataURL);
  const dataset = text(node.datasetURL);
  if (description) {
    layer.Abstract = description;
  } else if (!metadata && dataset) {
    layer.Abstract = DATASET_ONLY_ABSTRACT;
  }
  if (metadata) {
    layer.MetadataURL = [link('metadata', metadata)];
  }
  if (dataset) {
    layer.DataURL = [link('download', dataset)];
  }
}

export function findCapabilitiesLayerByTitle(
  layer: WMSLayer | WMSLayer[] | undefined,
  title: string
): WMSLayer | undefined {
  const nodes = Array.isArray(layer) ? layer : layer ? [layer] : [];
  for (const node of nodes) {
    if (node.Title === title) {
      return node;
    }
    const child = findCapabilitiesLayerByTitle(node.Layer, title);
    if (child) {
      return child;
    }
  }
  return undefined;
}

export function presentFolderLayerInfo(
  info: Record<string, unknown>,
  capabilitiesLayer: WMSLayer | undefined,
  describe: (kind: 'metadata' | 'download', format: string) => string
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...info };
  if (typeof next['abstract'] === 'string' && next['abstract'].trim() === '') {
    delete next['abstract'];
  }
  if (next['abstract'] === DATASET_ONLY_ABSTRACT) {
    delete next['abstract'];
  }
  if (Array.isArray(next['metadata'])) {
    next['metadata'] = next['metadata'].map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return entry;
      }
      const item = entry as Record<string, unknown>;
      const href = onlineResourceHref(item['url']);
      return href ? { ...item, url: href } : item;
    });
  }
  const downloads = asLinks(capabilitiesLayer?.DataURL);
  if (downloads.length > 0) {
    next['dataUrl'] = downloads
      .map((entry) => {
        const href = onlineResourceHref(entry.OnlineResource);
        if (!href) {
          return null;
        }
        const format = entry.Format ?? '';
        return {
          url: href,
          format,
          formatDescription: describe('download', format)
        };
      })
      .filter((entry) => entry !== null);
  }
  return next;
}
