/**
 * Drop Capas (WLM) rows whose layer is no longer on the map.
 * SITNA `updateLayerTree` inserts the LI asynchronously after legend/HTML
 * render; if `map.removeLayer` wins that race, LAYERREMOVE finds no LI and a
 * zombie row appears later.
 */
export function removeOrphanWorkLayerElements(
  root: ParentNode,
  getLayer: (layerId: string) => unknown
): string[] {
  const removed: string[] = [];
  root.querySelectorAll('li.tc-ctl-wlm-elm[data-layer-id]').forEach((node) => {
    const li = node as HTMLElement;
    const layerId = li.dataset['layerId'];
    if (!layerId || !getLayer(layerId)) {
      removed.push(layerId ?? '');
      li.remove();
    }
  });
  return removed;
}

/** Mirrors SITNA WorkLayerManager path assembly before template render. */
export function simulateSitnaWorkLayerPaths(
  names: string[],
  getPath: (layerName: string) => string[]
): string[][] {
  const path = names.map((name) => getPath(name).slice());
  path.forEach((segments) => segments.shift());
  return path;
}

function pathsEqual(a: string[], b: string[]): boolean {
  return (
    a.length === b.length && a.every((segment, index) => segment === b[index])
  );
}

/**
 * Catalog composites load one logical layer with multiple internal WMS names.
 * SITNA builds one display path per internal name; collapse to the first breadcrumb
 * so composites match single-layer Loaded Layers UX.
 */
export function collapseCatalogCompositeWorkLayerPath(
  path: string[][],
  options: { nodeId?: string; layerNameCount: number }
): string[][] {
  if (!options.nodeId || options.layerNameCount <= 1 || path.length <= 1) {
    return path;
  }

  const firstMeaningful =
    path.find((segments) => segments.length > 0) ?? path[0];
  if (!firstMeaningful) {
    return [[]];
  }

  const allEquivalent = path.every(
    (segments) =>
      segments.length === 0 || pathsEqual(segments, firstMeaningful)
  );

  return allEquivalent ? [firstMeaningful] : [firstMeaningful];
}
