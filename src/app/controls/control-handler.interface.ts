import { AppCfg, AppTasks } from '@api/model/app-cfg';

/**
 * Configuration object returned by control handlers.
 * Can contain any properties needed by SITNA controls.
 * Common properties are explicitly defined for type safety.
 */
export interface SitnaControlConfig extends Record<string, any> {
  div?: string;
  layers?: any[];
  enableSearch?: boolean;
  collapsed?: boolean;
  searchUrl?: string;
  searchFields?: string[];
  minLength?: number;
}

/**
 * Base interface for all control handlers.
 * Each handler is responsible for loading patches and building configuration
 * for a specific SITNA control type.
 */
export interface ControlHandler {
  /**
   * Unique identifier matching TaskUI.name from backend.
   * Examples: 'sitna.coordinates', 'sitna.search'
   */
  readonly controlIdentifier: string;

  /**
   * Optional: Override the SITNA configuration key.
   * If not provided, the key is auto-generated from controlIdentifier.
   * Examples: 'layerCatalog', 'search', 'coordinates'
   */
  readonly sitnaConfigKey?: string;

  /**
   * Optional patch files required by this control.
   * Paths relative to assets directory.
   */
  readonly requiredPatches?: string[];

  /**
   * Optional dependencies on other controls.
   * These controls will be automatically enabled when this control is configured.
   * Example: ['sitna.modify'] for DrawMeasureModify
   */
  readonly dependencies?: string[];

  /**
   * Load required patches for this control.
   * Should be idempotent - safe to call multiple times.
   *
   * @param context - Full application configuration context (required, must not be null)
   * @returns Promise that resolves when patches are ready
   */
  loadPatches(context: AppCfg): Promise<void>;

  /**
   * Build SITNA configuration for this control.
   * Called after patches are loaded.
   *
   * @param task - Task data from backend containing parameters
   * @param context - Full application configuration context
   * @returns Configuration object for SITNA, or null to disable control
   */
  buildConfiguration(
    task: AppTasks,
    context: AppCfg
  ): SitnaControlConfig | null;

  /**
   * Check if control is ready to use.
   * Verifies that patches are loaded and configuration can be built.
   *
   * @returns true if control is ready
   */
  isReady(): boolean;

  /**
   * Clean up any resources (patches, event listeners, etc.)
   * Called when control is no longer needed.
   */
  cleanup?(): void;
}

/**
 * Options for loading a control script.
 */
export interface ControlLoadOptions {
  /**
   * Function to check if control is already loaded.
   */
  checkLoaded?: () => boolean | Promise<boolean>;

  /**
   * Dependencies to wait for before loading.
   * Can be a string ('TC'), array of strings, or async function.
   */
  dependencies?: string | string[] | (() => Promise<void>);

  /**
   * Function that loads the actual script (via require or dynamic import).
   */
  loadScript: () => void;

  /**
   * Name of the control being loaded (for logging/debugging).
   */
  controlName: string;
}
