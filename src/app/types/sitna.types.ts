/**
 * Type definitions for SITNA API and TC namespace.
 * These types provide IDE autocompletion and type safety when working with SITNA controls.
 */

/**
 * SITNA Map instance.
 */
export interface SitnaMap {
  baseLayer?: SitnaLayer | null;
  layers?: SitnaLayer[];
  options?: Record<string, unknown>;
  addControl(
    control: SitnaControl,
    options?: Record<string, unknown>
  ): Promise<void>;
  removeControl(control: SitnaControl): void;
  trigger(eventType: string, data?: unknown): void;
  on(eventType: string, handler: (...args: unknown[]) => void): void;
  off(eventType: string, handler: (...args: unknown[]) => void): void;
}

/**
 * SITNA Layer instance.
 */
export interface SitnaLayer {
  id?: string;
  title?: string;
  url?: string;
  type?: string;
  options?: Record<string, unknown>;
}

/**
 * Base interface for SITNA controls.
 * All custom controls should extend SITNA.control.Control.
 */
export interface SitnaControl {
  /** CSS class for the control element */
  CLASS: string;

  /** Reference to the map instance */
  map?: SitnaMap;

  /** Control's root DOM element */
  div?: HTMLElement;

  /** Control options passed during instantiation */
  options?: Record<string, unknown>;

  /** Handlebars template paths keyed by CLASS */
  template?: Record<string, string>;

  /**
   * Get localized string from SITNA locale files.
   * @param key - Translation key (e.g., 'helloWorld.title')
   * @returns Translated string or empty string if not found
   */
  getLocaleString(key: string): string;

  /**
   * Load Handlebars templates for this control.
   * Override to specify custom template paths.
   */
  loadTemplates(): Promise<void>;

  /**
   * Render the control using its template.
   * @param callback - Optional callback after render completes
   */
  render(callback?: () => void): Promise<unknown>;

  /**
   * Render data using Handlebars template.
   * @param data - Data object to pass to template
   * @param callback - Optional callback after render completes
   */
  renderData(
    data: Record<string, unknown>,
    callback?: () => void
  ): Promise<unknown>;

  /**
   * Internal method to set the first render promise.
   * Used by SITNA to track control initialization.
   */
  _set1stRenderPromise(promise: Promise<unknown>): Promise<unknown>;
}

/**
 * Constructor type for SITNA controls.
 */
export interface SitnaControlConstructor {
  new (...args: unknown[]): SitnaControl;
  prototype: SitnaControl;
}

/**
 * SITNA control namespace containing built-in controls.
 */
export interface SitnaControlNamespace {
  Control: SitnaControlConstructor;
  FeatureInfo?: SitnaControlConstructor;
  LayerCatalog?: SitnaControlConstructor;
  Search?: SitnaControlConstructor;
  PrintMap?: SitnaControlConstructor;
  Popup?: SitnaControlConstructor;
  HelloWorld?: SitnaControlConstructor;
  [key: string]: SitnaControlConstructor | undefined;
}

/**
 * TC namespace (internal SITNA namespace).
 */
export interface TCNamespace {
  control: TCControlNamespace;
  layer?: TCLayerNamespace;
  wrap?: TCWrapNamespace;
  Map?: TCMapConstructor;
  Util?: TCUtil;
  Consts?: TCConsts;
}

/**
 * TC control namespace.
 */
export interface TCControlNamespace {
  FeatureInfo?: TCControlConstructor;
  LayerCatalog?: TCControlConstructor;
  Search?: TCControlConstructor;
  PrintMap?: TCControlConstructor;
  Popup?: TCControlConstructor;
  HelloWorld?: TCControlConstructor;
  [key: string]: TCControlConstructor | undefined;
}

/**
 * TC control constructor with prototype access.
 */
export interface TCControlConstructor {
  new (...args: unknown[]): unknown;
  prototype: Record<string, unknown>;
}

/**
 * TC Map constructor.
 */
export interface TCMapConstructor {
  new (...args: unknown[]): SitnaMap;
  prototype: SitnaMap & {
    addControl: (
      control: SitnaControl,
      options?: Record<string, unknown>
    ) => Promise<void>;
    trigger: (eventType: string, data?: unknown) => void;
    [key: string]: unknown;
  };
}

/**
 * TC layer namespace.
 */
export interface TCLayerNamespace {
  Raster?: {
    new (...args: unknown[]): SitnaLayer;
    prototype: SitnaLayer & Record<string, unknown>;
  };
  [key: string]: unknown;
}

/**
 * TC wrap namespace (internal wrappers).
 */
export interface TCWrapNamespace {
  layer?: TCLayerNamespace;
  Map?: {
    prototype: Record<string, unknown>;
  };
  [key: string]: unknown;
}

/**
 * TC Utility functions.
 */
export interface TCUtil {
  extend(deep: boolean, target: unknown, ...sources: unknown[]): unknown;
  reqGetMapOnCapabilities(url: string): string | null;
  regex: {
    PROTOCOL: RegExp;
    [key: string]: RegExp;
  };
  [key: string]: unknown;
}

/**
 * TC Constants.
 */
export interface TCConsts {
  event: {
    FEATURESADD: string;
    LAYERADD: string;
    LAYERREMOVE: string;
    [key: string]: string;
  };
  classes: {
    LOADING: string;
    HIDDEN: string;
    [key: string]: string;
  };
  [key: string]: unknown;
}

/**
 * SITNA global namespace.
 */
export interface SitnaNamespace {
  control: SitnaControlNamespace;
  Cfg?: Record<string, unknown>;
  Map?: SitnaMapConstructor;
}

/**
 * SITNA Map constructor.
 */
export interface SitnaMapConstructor {
  new (
    element: HTMLElement | string,
    options?: Record<string, unknown>
  ): SitnaMap;
}

/**
 * Extended SITNA namespace with control property.
 * Use this when you need to access SITNA.control which may not be in the api-sitna types.
 */
export type SitnaWithControl = {
  control: SitnaControlNamespace;
  Cfg?: Record<string, unknown>;
  Map?: SitnaMapConstructor;
  [key: string]: unknown;
};
