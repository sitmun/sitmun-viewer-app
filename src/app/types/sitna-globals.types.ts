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
}
