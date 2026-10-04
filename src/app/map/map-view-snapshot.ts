export type MapExtent = [number, number, number, number];

export interface LayerDelta {
  id: string;
  opacity?: number;
  visible?: boolean;
  sublayers?: string[];
}

export interface MapViewSnapshot {
  ext: MapExtent;
  base?: string;
  layers?: LayerDelta[];
  order?: string[];
  draw?: unknown;
  feature?: unknown;
  vw3?: unknown;
}

export interface LayerOnMap {
  profileLayerId?: string;
  opacity?: number;
  visible?: boolean;
  sublayers?: string[];
}

export interface ProfileLayerRef {
  id: string;
  title: string;
  sublayers?: string[];
}

const NO_BASE_MAP_LAYER_ID = 'sitmun-no-base-map';

export function encodeMapState(snapshot: MapViewSnapshot): string {
  const binary = unescape(encodeURIComponent(JSON.stringify(snapshot)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function decodeMapState(token: string): MapViewSnapshot | null {
  try {
    const padded = token.replace(/-/g, '+').replace(/_/g, '/');
    const pad =
      padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
    const json = decodeURIComponent(escape(atob(padded + pad)));
    const value = JSON.parse(json) as MapViewSnapshot;
    if (!isExtent(value?.ext)) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

export function buildMapStateUrl(href: string, token: string): string {
  const hashAt = href.indexOf('#');
  if (hashAt >= 0) {
    const prefix = href.slice(0, hashAt + 1);
    const fragment = href.slice(hashAt + 1);
    const queryAt = fragment.indexOf('?');
    const path = queryAt >= 0 ? fragment.slice(0, queryAt) : fragment;
    const params = new URLSearchParams(
      queryAt >= 0 ? fragment.slice(queryAt + 1) : ''
    );
    params.set('mapState', token);
    return `${prefix}${path}?${params.toString()}`;
  }
  const url = new URL(href);
  url.searchParams.set('mapState', token);
  url.hash = '';
  return url.toString();
}

export function snapshotFrom(input: {
  extent: MapExtent;
  baseLayerId?: string;
  defaultBaseLayerId?: string;
  layers?: LayerDelta[];
  order?: string[];
  draw?: unknown;
  feature?: unknown;
  vw3?: unknown;
}): MapViewSnapshot {
  const snapshot: MapViewSnapshot = { ext: input.extent };
  if (
    input.baseLayerId &&
    input.baseLayerId !== input.defaultBaseLayerId
  ) {
    snapshot.base = input.baseLayerId;
  }
  if (input.layers && input.layers.length > 0) {
    snapshot.layers = input.layers;
  }
  if (input.order && input.order.length > 0) {
    snapshot.order = input.order;
  }
  if (input.draw !== undefined) {
    snapshot.draw = input.draw;
  }
  if (input.feature !== undefined) {
    snapshot.feature = input.feature;
  }
  if (input.vw3 !== undefined) {
    snapshot.vw3 = input.vw3;
  }
  return snapshot;
}

export function profileLayerIdForBase(
  layers: ProfileLayerRef[],
  sitnaBaseId: string | undefined
): string | undefined {
  if (!sitnaBaseId || sitnaBaseId === NO_BASE_MAP_LAYER_ID) {
    return undefined;
  }
  return layers.find((layer) => layer.title === sitnaBaseId)?.id;
}

export function sitnaBaseIdForProfile(
  layers: ProfileLayerRef[],
  profileLayerId: string
): string | undefined {
  return layers.find((layer) => layer.id === profileLayerId)?.title;
}

export function layerOrder(
  onMapProfileLayerIds: string[],
  defaultProfileLayerIds: string[],
  catalogProfileLayerIds: string[] = []
): string[] | undefined {
  const onMap = onMapProfileLayerIds.filter((id) => id.length > 0);
  const defaults = new Set(defaultProfileLayerIds);
  const extras = onMap.filter((id) => !defaults.has(id));
  const extraPart =
    catalogProfileLayerIds.length === 0
      ? extras
      : [...extras].sort((left, right) => {
          const rank = (id: string) => {
            const index = catalogProfileLayerIds.indexOf(id);
            return index === -1 ? Number.MAX_SAFE_INTEGER : index;
          };
          const delta = rank(left) - rank(right);
          return delta !== 0 ? delta : onMap.indexOf(left) - onMap.indexOf(right);
        });
  const implied = [
    ...defaultProfileLayerIds.filter((id) => onMap.includes(id)),
    ...extraPart
  ];
  if (
    onMap.length === implied.length &&
    onMap.every((id, index) => id === implied[index])
  ) {
    return undefined;
  }
  return onMap;
}

export function layerDeltas(
  onMap: LayerOnMap[],
  defaults: LayerOnMap[]
): LayerDelta[] | undefined {
  const deltas: LayerDelta[] = [];
  const defaultById = new Map(
    defaults
      .filter((layer) => layer.profileLayerId)
      .map((layer) => [layer.profileLayerId as string, layer])
  );
  const seen = new Set<string>();

  for (const layer of onMap) {
    const id = layer.profileLayerId;
    if (!id) {
      continue;
    }
    seen.add(id);
    const baseline = defaultById.get(id);
    const delta = diffLayer(id, layer, baseline);
    if (delta) {
      deltas.push(delta);
    }
  }

  for (const baseline of defaults) {
    const id = baseline.profileLayerId;
    if (!id || seen.has(id)) {
      continue;
    }
    deltas.push({ id, visible: false });
  }

  return deltas.length > 0 ? deltas : undefined;
}

export interface MapSnapshotTarget {
  setExtent?: (
    extent: MapExtent,
    options: { animate: boolean },
    callback?: (extent: MapExtent) => void
  ) => void;
  setBaseLayer?: (id: string) => void;
  layers?: Array<{ isBase?: boolean }>;
  insertLayer?: (
    layer: { isBase?: boolean },
    index: number
  ) => void | Promise<void>;
  workLayers?: Array<{
    isBase?: boolean;
    options?: { profileLayerId?: string; layerNames?: string | string[] };
    setOpacity?: (opacity: number) => void;
    setVisibility?: (visible: boolean) => void;
    setLayerNames?: (names: string[]) => void;
  }>;
  view3D?: {
    cameraControls?: { setCameraState?: (state: unknown) => void };
  };
  on3DView?: boolean;
  controls?: Array<{ set3D?: () => void }>;
}

export function applyMapSnapshot(
  map: MapSnapshotTarget,
  snapshot: MapViewSnapshot,
  sitnaBaseId?: string
): void {
  try {
    map.setExtent?.(snapshot.ext, { animate: false });
  } catch {
    // A rejected extent must not drop the rest of the snapshot.
  }
  if (sitnaBaseId) {
    try {
      map.setBaseLayer?.(sitnaBaseId);
    } catch {
      // The shared background is no longer in the profile.
    }
  }
  for (const delta of snapshot.layers ?? []) {
    const layer = map.workLayers?.find(
      (candidate) => candidate.options?.profileLayerId === delta.id
    );
    if (!layer) {
      continue;
    }
    try {
      if (delta.opacity != null && layer.setOpacity) {
        layer.setOpacity(delta.opacity);
      }
      if (delta.visible != null && layer.setVisibility) {
        layer.setVisibility(delta.visible);
      }
      if (delta.sublayers && layer.setLayerNames) {
        layer.setLayerNames(delta.sublayers);
      }
    } catch {
      // This layer is gone or rejects the change. Later layers still apply.
    }
  }
}

export async function applyLayerOrder(
  map: MapSnapshotTarget,
  order: string[] | undefined
): Promise<void> {
  if (!order?.length || !map.insertLayer || !map.layers) {
    return;
  }
  const baseCount = map.layers.filter((layer) => layer.isBase).length;
  let slot = 0;
  for (const id of order) {
    const layer = map.workLayers?.find(
      (candidate) => candidate.options?.profileLayerId === id
    );
    if (!layer) {
      continue;
    }
    const target = baseCount + slot;
    slot += 1;
    if (map.layers.indexOf(layer) === target) {
      continue;
    }
    try {
      await map.insertLayer(layer, target);
    } catch {
      // Skip a layer that can no longer be moved and keep the rest of the order.
    }
  }
}

export function profileLayerIdsToAdd(
  snapshot: MapViewSnapshot,
  presentProfileLayerIds: string[]
): string[] {
  const present = new Set(presentProfileLayerIds);
  return (snapshot.layers ?? [])
    .filter((layer) => layer.visible !== false && !present.has(layer.id))
    .map((layer) => layer.id);
}

export function sharedControlStates(snapshot: MapViewSnapshot): unknown[] {
  return [...controlStates(snapshot.draw), ...controlStates(snapshot.feature)];
}

export async function applySharedView3D(
  map: MapSnapshotTarget,
  camera: unknown
): Promise<void> {
  if (camera == null) {
    return;
  }
  if (!map.on3DView) {
    const enter3D = map.controls?.find(
      (control) => typeof control.set3D === 'function'
    )?.set3D;
    enter3D?.();
  }
  if (!map.view3D?.cameraControls?.setCameraState) {
    await waitForCamera(map);
  }
  map.view3D?.cameraControls?.setCameraState?.(camera);
}

function controlStates(value: unknown): unknown[] {
  const list = Array.isArray(value) ? value : value == null ? [] : [value];
  return list.filter(
    (item) =>
      !!item &&
      typeof item === 'object' &&
      typeof (item as { id?: unknown }).id === 'string'
  );
}

function waitForCamera(map: MapSnapshotTarget): Promise<void> {
  return new Promise((resolve) => {
    const started = Date.now();
    const timer = setInterval(() => {
      if (map.view3D?.cameraControls?.setCameraState || Date.now() - started > 2000) {
        clearInterval(timer);
        resolve();
      }
    }, 50);
  });
}

function diffLayer(
  id: string,
  layer: LayerOnMap,
  baseline: LayerOnMap | undefined
): LayerDelta | null {
  if (!baseline) {
    return compactDelta(id, layer, true);
  }
  const delta: LayerDelta = { id };
  let changed = false;
  const baselineOpacity = baseline.opacity ?? 1;
  if (layer.opacity != null && layer.opacity !== baselineOpacity) {
    delta.opacity = layer.opacity;
    changed = true;
  }
  if (layer.visible != null && layer.visible !== baseline.visible) {
    delta.visible = layer.visible;
    changed = true;
  }
  if (
    layer.sublayers &&
    !sameList(layer.sublayers, baseline.sublayers ?? [])
  ) {
    delta.sublayers = layer.sublayers;
    changed = true;
  }
  return changed ? delta : null;
}

function compactDelta(
  id: string,
  layer: LayerOnMap,
  includeVisibility: boolean
): LayerDelta {
  const delta: LayerDelta = { id };
  if (layer.opacity != null) {
    delta.opacity = layer.opacity;
  }
  if (includeVisibility && layer.visible != null) {
    delta.visible = layer.visible;
  }
  if (layer.sublayers && layer.sublayers.length > 0) {
    delta.sublayers = layer.sublayers;
  }
  return delta;
}

function sameList(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

function isExtent(value: unknown): value is MapExtent {
  return (
    Array.isArray(value) &&
    value.length === 4 &&
    value.every((item) => typeof item === 'number')
  );
}
