export enum CatalogInfoKind {
  Folder = 'folder',
  Layer = 'layer'
}

export interface CatalogInfoNode {
  children?: readonly string[] | null;
  resource?: string | null;
  description?: unknown;
  metadataURL?: unknown;
  datasetURL?: unknown;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function catalogInfoKind(
  node: CatalogInfoNode | null | undefined
): CatalogInfoKind | null {
  if (!node) {
    return null;
  }
  if ((node.children?.length ?? 0) > 0) {
    return CatalogInfoKind.Folder;
  }
  if (text(node.resource)) {
    return CatalogInfoKind.Layer;
  }
  return null;
}

export function catalogInfoVisible(
  kind: CatalogInfoKind,
  node: CatalogInfoNode
): boolean {
  switch (kind) {
    case CatalogInfoKind.Folder:
      return Boolean(
        text(node.description) || text(node.metadataURL) || text(node.datasetURL)
      );
    case CatalogInfoKind.Layer:
      return true;
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}
