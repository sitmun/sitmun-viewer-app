import type { AppLayer, AppNodeInfo, AppTree } from '@api/model/app-cfg';

import {
  buildFeatureInfoRows,
  type FeatureInfoCell,
  type FeatureInfoDisplayRow
} from './feature-info-fields';

export interface FeatureInfoOverlayPlan {
  layerName: string;
  profileLayerId: string;
  features: FeatureInfoDisplayRow[][];
}

interface FeatureLike {
  getData?: () => unknown;
  data?: unknown;
}

interface LayerLike {
  name?: string;
  features?: FeatureLike[];
}

interface MapLayerLike {
  names?: string[];
  options?: { nodeId?: string };
  getDisgregatedLayerNames?: () => string[];
}

interface ServiceLike {
  layers?: LayerLike[];
  mapLayers?: MapLayerLike[];
}

export function planFeatureInfoOverlay(
  services: ServiceLike[] | undefined,
  layers: AppLayer[] | undefined,
  locale: string,
  trees?: AppTree[]
): FeatureInfoOverlayPlan[] {
  if (!services?.length || !layers?.length) {
    return [];
  }
  const plans: FeatureInfoOverlayPlan[] = [];
  for (const service of services) {
    for (const layer of service.layers ?? []) {
      if (!layer.name) {
        continue;
      }
      const appLayer = resolveAppLayer(layer.name, service, layers, trees);
      const fields = appLayer?.featureInfoFields;
      if (!appLayer || !fields?.length || !layer.features?.length) {
        continue;
      }
      plans.push({
        layerName: layer.name,
        profileLayerId: appLayer.id,
        features: (layer.features ?? []).map((feature) => {
          const data =
            typeof feature.getData === 'function' ? feature.getData() : feature.data;
          const record =
            data && typeof data === 'object'
              ? (data as Record<string, unknown>)
              : {};
          return buildFeatureInfoRows(record, fields, locale);
        })
      });
    }
  }
  return plans;
}

function sameLayerName(left: string, right: string): boolean {
  return left.localeCompare(right, undefined, { sensitivity: 'accent' }) === 0;
}

function mapLayerNames(mapLayer: MapLayerLike): string[] {
  const configured = mapLayer.names ?? [];
  let leaves: string[] = [];
  try {
    leaves = mapLayer.getDisgregatedLayerNames?.() ?? [];
  } catch {
    leaves = [];
  }
  return [...configured, ...leaves];
}

function owningMapLayer(gfiName: string, service: ServiceLike): MapLayerLike | undefined {
  return (service.mapLayers ?? []).find((mapLayer) =>
    mapLayerNames(mapLayer).some((name) => sameLayerName(name, gfiName))
  );
}

function profileLayerIdForNode(
  nodeId: string | undefined,
  trees: AppTree[] | undefined
): string | undefined {
  if (!nodeId) {
    return undefined;
  }
  for (const tree of trees ?? []) {
    const node = (tree.nodes as Record<string, AppNodeInfo | undefined> | undefined)?.[nodeId];
    if (node?.resource?.startsWith('layer/')) {
      return node.resource;
    }
  }
  return undefined;
}

function resolveAppLayer(
  gfiName: string,
  service: ServiceLike,
  layers: AppLayer[],
  trees: AppTree[] | undefined
): AppLayer | undefined {
  const owner = owningMapLayer(gfiName, service);
  const profileLayerId = profileLayerIdForNode(owner?.options?.nodeId, trees);
  if (profileLayerId) {
    const byId = layers.find((item) => item.id === profileLayerId);
    if (byId) {
      return byId;
    }
  }
  const parentNames = owner?.names?.length ? owner.names : [gfiName];
  const matches = layers.filter((item) =>
    parentNames.some((name) => item.layers?.some((layerName) => sameLayerName(layerName, name)))
  );
  return matches.length === 1 ? matches[0] : undefined;
}

export function applyFeatureInfoOverlay(
  root: ParentNode,
  plans: FeatureInfoOverlayPlan[],
  services?: ServiceLike[]
): void {
  if (!plans.length) {
    return;
  }
  const blocks = root.querySelectorAll('.tc-ctl-finfo-layers > li');
  const rendered = (services ?? []).flatMap((service) => service.layers ?? []);
  blocks.forEach((block, index) => {
    const layerName = rendered[index]?.name;
    const plan = layerName
      ? plans.find((item) => sameLayerName(item.layerName, layerName))
      : undefined;
    if (!plan) {
      return;
    }
    const tables = block.querySelectorAll('table');
    tables.forEach((table, tableIndex) => {
      const rows = plan.features[tableIndex];
      if (rows) {
        rewriteTable(table, rows);
      }
    });
  });
}

function rewriteTable(table: HTMLTableElement, rows: FeatureInfoDisplayRow[]): void {
  const body = table.tBodies[0] ?? table;
  const previous = new Map<string, string>();
  const preserved: HTMLTableRowElement[] = [];
  Array.from(body.querySelectorAll('tr')).forEach((row) => {
    const header = row.querySelector('th');
    const cell = row.querySelector('td');
    const label = header?.textContent?.trim() ?? '';
    if (label.includes('ℹ️') || label.includes('Més informació')) {
      preserved.push(row);
      return;
    }
    const path = header?.getAttribute('data-feature-path') || label;
    if (path && cell) {
      previous.set(path, cell.innerHTML);
    }
  });
  body.replaceChildren();
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.textContent = row.label;
    th.setAttribute('data-feature-path', row.path);
    const td = document.createElement('td');
    td.innerHTML = cellHtml(row, previous);
    tr.append(th, td);
    body.append(tr);
  });
  preserved.forEach((row) => body.append(row));
}

function cellHtml(row: FeatureInfoDisplayRow, previous: Map<string, string>): string {
  if (row.cell.kind === 'auto') {
    return previous.get(row.path) ?? escapeText(fallbackText(row.cell.value));
  }
  return renderExplicit(row.cell);
}

function renderExplicit(cell: Exclude<FeatureInfoCell, { kind: 'auto' }>): string {
  switch (cell.kind) {
    case 'text':
      return escapeText(cell.text);
    case 'link':
      return `<a href="${escapeText(cell.href)}" target="_blank" rel="noopener noreferrer">${escapeText(cell.text)}</a>`;
    case 'image':
      return `<img src="${escapeText(cell.src)}" alt="">`;
    default: {
      const unreachable: never = cell;
      return unreachable;
    }
  }
}

function fallbackText(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toLocaleString();
  }
  if (value == null) {
    return '';
  }
  return String(value);
}

function escapeText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
