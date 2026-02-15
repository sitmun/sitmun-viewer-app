import type { AppCfg } from '@api/model/app-cfg';

/**
 * Typed app globals hosted by SitnaApiService (replaces window.abstractMapObject / window.layerCatalogsForModal).
 */

/** Reference from catalog-switching to the current map component. */
export interface AbstractMapRef {
  updateCatalog?(): void;
}

/** State for the layer catalogs modal (topic switching). */
export interface LayerCatalogsForModalState {
  currentTreeId: string;
  catalogs: Array<{ id: string; catalog: string }>;
  rootNodeIds: string[];
}

export interface SitnaGlobals {
  abstractMapObject?: AbstractMapRef | null;
  layerCatalogsForModal?: LayerCatalogsForModalState | null;
  /** Active map config; used by virtual WMS patch so tree uses current language. */
  currentAppCfg?: AppCfg | null;
  /** Current map language (e.g. "en"); used in virtual WMS URLs to avoid cached GetCapabilities from another language. */
  currentMapLang?: string | null;
}
