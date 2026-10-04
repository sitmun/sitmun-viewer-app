import { Injectable } from '@angular/core';

import { AppCfg, AppNodeInfo } from '@api/model/app-cfg';

import { environment } from '../../../environments/environment';
import {
  applyLayerOrder,
  applyMapSnapshot,
  applySharedView3D,
  buildMapStateUrl,
  decodeMapState,
  encodeMapState,
  layerDeltas,
  layerOrder,
  LayerOnMap,
  MapExtent,
  MapViewSnapshot,
  profileLayerIdForBase,
  profileLayerIdsToAdd,
  sharedControlStates,
  sitnaBaseIdForProfile,
  snapshotFrom
} from '../../map/map-view-snapshot';
import { SitnaApiService } from '../../services/sitna-api.service';
import { ControlHandlerBase } from '../control-handler-base';

const SHORT_URL_PATH = '/api/config/client/short-url';

@Injectable({
  providedIn: 'root'
})
export class ShareControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.share';
  readonly sitnaConfigKey = 'share';
  readonly requiredPatches = undefined;
  private appCfg: AppCfg | null = null;

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi);
  }

  override async loadPatches(context: AppCfg): Promise<void> {
    this.appCfg = context;
    const TC = this.sitnaApi.getTC() as {
      control?: { MapInfo?: { prototype?: SitnaMapInfo } };
      Consts?: { msgType?: { ERROR?: string } };
    } | null;
    const proto = TC?.control?.MapInfo?.prototype;
    if (!proto || proto.__sitmunMapStateLink) {
      return;
    }
    proto.__sitmunMapStateLink = true;
    const handler = this;
    const errorType = TC?.Consts?.msgType?.ERROR;

    proto.generateLink = async function generateLink(this: SitnaMapInfo) {
      const snapshot = handler.capture(this);
      const url = buildMapStateUrl(
        window.location.href,
        encodeMapState(snapshot)
      );
      this.manageMaxLengthExceed?.({
        browser: url.length > 2048,
        qr: url.length > 16000
      });
      return url;
    };

    proto.shortenedLink = async function shortenedLink(this: SitnaMapInfo) {
      const url = await this.generateLink();
      const response = await fetch(`${environment.apiUrl}${SHORT_URL_PATH}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if (!response.ok) {
        const key = shortUrlFailureKey(response.status);
        const message = this.getLocaleString?.(key) || key;
        this.map?.toast?.(message, { type: errorType });
        throw new Error(message);
      }
      const body = (await response.json()) as { url?: string };
      if (!body.url) {
        throw new Error('short-url response has no url');
      }
      return body.url;
    };
  }

  capture(control: SitnaMapInfo): MapViewSnapshot {
    const extent = readExtent(control.map);
    const layers = this.appCfg?.layers ?? [];
    const baseLayerId = profileLayerIdForBase(
      layers,
      control.map?.baseLayer?.id ?? control.map?.getBaseLayer?.()?.id
    );
    const defaultBaseLayerId = profileLayerIdForBase(
      layers,
      control.map?.options?.defaultBaseLayer
    );
    const onMap = (control.map?.workLayers ?? [])
      .map(toLayerOnMap)
      .filter((layer): layer is LayerOnMap => layer != null);
    const feature =
      control.includeControls === false
        ? control.caller?.exportState?.()
        : undefined;
    const draw = drawingStates(control.map);
    const vw3 =
      control.map?.on3DView && control.map.view3D?.cameraControls?.getCameraState
        ? control.map.view3D.cameraControls.getCameraState()
        : undefined;
    const onMapIds = onMap.flatMap((layer) =>
      layer.profileLayerId ? [layer.profileLayerId] : []
    );
    const order = layerOrder(
      onMapIds,
      defaultProfileLayerIds(this.appCfg),
      catalogProfileLayerIds(this.appCfg)
    );
    return snapshotFrom({
      extent,
      baseLayerId,
      defaultBaseLayerId,
      layers: layerDeltas(onMap, defaultWorkingLayers(this.appCfg)),
      order,
      draw,
      feature,
      vw3
    });
  }

  async restore(
    map: SitnaMapInfo['map'],
    token: string | null,
    ensureLayers?: (profileLayerIds: string[]) => Promise<void>
  ): Promise<boolean> {
    const snapshot = token ? decodeMapState(token) : null;
    if (!snapshot || !map) {
      return false;
    }
    const present = (map.workLayers ?? [])
      .map((layer) => layer.options?.profileLayerId)
      .filter((id): id is string => !!id);
    const missing = profileLayerIdsToAdd(snapshot, present);
    if (ensureLayers) {
      for (const id of missing) {
        try {
          await ensureLayers([id]);
        } catch {
          // The catalog no longer has this layer. The others still load.
        }
      }
    }
    const sitnaBaseId = snapshot.base
      ? sitnaBaseIdForProfile(this.appCfg?.layers ?? [], snapshot.base)
      : undefined;
    applyMapSnapshot(map, snapshot, sitnaBaseId);
    try {
      await applyLayerOrder(map, snapshot.order);
    } catch {
      // Order is optional once the layers that still exist are on the map.
    }
    try {
      const panel = syncLoadedLayerList(map);
      watchLoadedLayerList(map, panel.length);
    } catch {
      // The loaded-layer list can render after the map state is applied.
    }
    for (const state of sharedControlStates(snapshot)) {
      try {
        map.importControlStates?.([state]);
      } catch {
        // A drawing, measurement, or imported file from the link is gone.
      }
    }
    try {
      await applySharedView3D(map, snapshot.vw3);
    } catch {
      // The 3D camera is optional. The flat view stays.
    }
    return true;
  }
}

function shortUrlFailureKey(status: number): string {
  if (status === 400) {
    return 'shortUrlRejected';
  }
  if (status === 403) {
    return 'shortUrlForbidden';
  }
  return 'shortUrlFailed';
}

function drawingStates(map: SitnaMapInfo['map']): unknown[] | undefined {
  const states: unknown[] = [];
  for (const control of map?.controls ?? []) {
    let state: unknown;
    try {
      state = control.exportState?.();
    } catch {
      continue;
    }
    if (isDrawState(state)) {
      states.push(state);
    }
  }
  return states.length > 0 ? states : undefined;
}

function isDrawState(state: unknown): boolean {
  if (!state || typeof state !== 'object') {
    return false;
  }
  const record = state as { layer?: unknown; layers?: unknown };
  if (record.layer != null) {
    return true;
  }
  return Array.isArray(record.layers) && record.layers.length > 0;
}

function defaultProfileLayerIds(cfg: AppCfg | null): string[] {
  if (!cfg) {
    return [];
  }
  const nodes = new Map<string, AppNodeInfo>();
  const childIds = new Set<string>();
  const parentOf = new Map<string, string>();
  for (const tree of cfg.trees ?? []) {
    const treeNodes = (tree.nodes ?? {}) as Record<string, AppNodeInfo>;
    for (const [id, node] of Object.entries(treeNodes)) {
      if (!node) {
        continue;
      }
      nodes.set(id, node);
      for (const childId of node.children ?? []) {
        childIds.add(childId);
        parentOf.set(childId, id);
      }
    }
  }
  const ids: string[] = [];
  const seen = new Set<string>();
  const seenRadioGroups = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string): void => {
    if (visited.has(id)) {
      return;
    }
    visited.add(id);
    const node = nodes.get(id);
    if (!node) {
      return;
    }
    if (node.loadByDefault === true && node.resource && !node.action) {
      const parentId = parentOf.get(id);
      const parent = parentId ? nodes.get(parentId) : undefined;
      const radioParent =
        parentId && parent && isRadioFolder(parent) ? parentId : undefined;
      const skipRadio = !!radioParent && seenRadioGroups.has(radioParent);
      if (!skipRadio && !seen.has(node.resource)) {
        if (radioParent) {
          seenRadioGroups.add(radioParent);
        }
        seen.add(node.resource);
        ids.push(node.resource);
      }
    }
    for (const childId of node.children ?? []) {
      visit(childId);
    }
  };
  for (const id of nodes.keys()) {
    if (!childIds.has(id)) {
      visit(id);
    }
  }
  return ids;
}

function catalogProfileLayerIds(cfg: AppCfg | null): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const tree of cfg?.trees ?? []) {
    for (const raw of Object.values(tree.nodes ?? {})) {
      const node = raw as AppNodeInfo;
      const id = node?.resource;
      if (!id || node.action || seen.has(id)) {
        continue;
      }
      seen.add(id);
      ids.push(id);
    }
  }
  return ids;
}

function isRadioFolder(node: AppNodeInfo): boolean {
  return !!node.isRadio && !node.resource && !node.action;
}

function defaultWorkingLayers(cfg: AppCfg | null): LayerOnMap[] {
  return defaultProfileLayerIds(cfg).map((profileLayerId) => ({
    profileLayerId,
    visible: true
  }));
}

function readExtent(map: SitnaMapInfo['map']): MapExtent {
  const extent = map?.getExtent?.();
  if (
    Array.isArray(extent) &&
    extent.length === 4 &&
    extent.every((value) => typeof value === 'number')
  ) {
    return extent as MapExtent;
  }
  return [0, 0, 0, 0];
}

function toLayerOnMap(layer: SitnaWorkLayer): LayerOnMap | null {
  const id = layer.options?.profileLayerId;
  if (!id) {
    return null;
  }
  const names = layer.options?.layerNames;
  return {
    profileLayerId: id,
    opacity: layer.getOpacity?.(),
    visible: layer.getVisibility?.(),
    sublayers: Array.isArray(names) ? names : names ? [names] : undefined
  };
}

function syncLoadedLayerList(map: SitnaMapInfo['map']): string[] {
  const panel: string[] = [];
  for (const control of map?.controls ?? []) {
    if (typeof control.getLayerUIElements !== 'function') {
      continue;
    }
    const raw = control.getLayerUIElements();
    if (!raw || typeof raw.length !== 'number') {
      continue;
    }
    const items = Array.from(raw).filter((item) =>
      item.classList?.contains('tc-ctl-wlm-elm')
    );
    const parent = items[0]?.parentElement;
    if (!parent) {
      continue;
    }
    const byId = new Map(
      items.flatMap((item) =>
        item.dataset['layerId']
          ? [[item.dataset['layerId'], item] as const]
          : []
      )
    );
    let previous: HTMLElement | null = null;
    for (const layer of map?.workLayers ?? []) {
      const item = layer.id ? byId.get(layer.id) : undefined;
      if (!item) {
        continue;
      }
      if (previous) {
        if (previous.nextElementSibling !== item) {
          previous.insertAdjacentElement('afterend', item);
        }
      } else if (parent.firstElementChild !== item) {
        parent.insertBefore(item, parent.firstChild);
      }
      previous = item;
      const profileLayerId = layer.options?.profileLayerId;
      if (profileLayerId) {
        panel.push(profileLayerId);
      }
    }
  }
  return panel;
}

function watchLoadedLayerList(
  map: SitnaMapInfo['map'],
  alreadyPlaced: number
): void {
  const expected = (map?.workLayers ?? []).filter(
    (layer) => layer.options?.profileLayerId
  ).length;
  if (alreadyPlaced >= expected) {
    return;
  }
  const root = map?.controls?.find((control) =>
    control.div?.classList.contains('tc-ctl-wlm')
  )?.div;
  if (!root) {
    return;
  }
  const observer = new MutationObserver(() => {
    const panel = syncLoadedLayerList(map);
    if (panel.length < expected) {
      return;
    }
    observer.disconnect();
  });
  observer.observe(root, { childList: true, subtree: true });
}

interface SitnaWorkLayer {
  id?: string;
  isBase?: boolean;
  options?: { profileLayerId?: string; layerNames?: string | string[] };
  getOpacity?: () => number;
  getVisibility?: () => boolean;
  setOpacity?: (opacity: number) => void;
  setVisibility?: (visible: boolean) => void;
  setLayerNames?: (names: string[]) => void;
}

interface SitnaMapInfo {
  __sitmunMapStateLink?: boolean;
  includeControls?: boolean;
  caller?: { exportState?: () => unknown };
  manageMaxLengthExceed?: (flags: { browser: boolean; qr: boolean }) => void;
  getLocaleString?: (key: string) => string;
  generateLink: () => Promise<string>;
  shortenedLink?: () => Promise<string>;
  map?: {
    getExtent?: () => unknown;
    getBaseLayer?: () => { id?: string } | null;
    baseLayer?: { id?: string } | null;
    options?: { defaultBaseLayer?: string };
    layers?: Array<{ isBase?: boolean }>;
    insertLayer?: (
      layer: { isBase?: boolean },
      index: number
    ) => void | Promise<void>;
    workLayers?: SitnaWorkLayer[];
    controls?: Array<{
      exportState?: () => unknown;
      set3D?: () => void;
      getLayerUIElements?: () => ArrayLike<HTMLElement>;
      div?: HTMLElement;
    }>;
    importControlStates?: (states: unknown[]) => void;
    on3DView?: boolean;
    view3D?: {
      cameraControls?: {
        getCameraState?: () => unknown;
        setCameraState?: (state: unknown) => void;
      };
    };
    toast?: (message: string, options?: { type?: string }) => void;
    setExtent?: MapSnapshotTargetSetExtent;
    setBaseLayer?: (id: string) => void;
  };
}

type MapSnapshotTargetSetExtent = (
  extent: MapExtent,
  options: { animate: boolean },
  callback?: (extent: MapExtent) => void
) => void;
