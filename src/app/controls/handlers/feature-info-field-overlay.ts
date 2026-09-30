import type { AppLayer, AppNodeInfo, AppTree } from '@api/model/app-cfg';

import {
  buildFeatureInfoRows,
  type FeatureInfoCell,
  type FeatureInfoDisplayRow
} from './feature-info-fields';

export interface FeatureInfoOverlayPlan {
  layerName: string;
  headings: string[];
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

interface ServiceLike {
  layers?: LayerLike[];
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
      const appLayer = layers.find((item) => item.layers?.includes(layer.name!));
      const fields = appLayer?.featureInfoFields;
      if (!appLayer || !fields?.length) {
        continue;
      }
      plans.push({
        layerName: layer.name,
        headings: overlayHeadings(layer.name, appLayer, trees),
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

function overlayHeadings(wmsName: string, layer: AppLayer, trees: AppTree[] | undefined): string[] {
  const headings = new Set<string>();
  if (wmsName) {
    headings.add(wmsName);
  }
  if (layer.title) {
    headings.add(layer.title);
  }
  for (const tree of trees ?? []) {
    const nodes = tree.nodes as Record<string, AppNodeInfo | undefined> | undefined;
    if (!nodes) {
      continue;
    }
    for (const node of Object.values(nodes)) {
      if (node?.resource === layer.id && node.title) {
        headings.add(node.title);
      }
    }
  }
  return [...headings];
}

export function applyFeatureInfoOverlay(
  root: ParentNode,
  plans: FeatureInfoOverlayPlan[]
): void {
  if (!plans.length) {
    return;
  }
  const blocks = root.querySelectorAll('.tc-ctl-finfo-layers > li');
  blocks.forEach((block) => {
    const heading = block.querySelector('h4')?.textContent ?? '';
    const plan = plans.find((item) =>
      item.headings.some((label) => heading.includes(label))
    );
    if (!plan) {
      return;
    }
    const tables = block.querySelectorAll('table');
    tables.forEach((table, index) => {
      const rows = plan.features[index];
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
