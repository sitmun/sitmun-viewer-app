import { inject } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import {
  ControlHandler,
  SitnaControlConfig,
  ControlLoadOptions
} from './control-handler.interface';
import { AppConfigService } from '../services/app-config.service';
import { SitnaApiService } from '../services/sitna-api.service';
import { PatchManager, createPatchManager } from '../utils/patch-manager';

/**
 * Base class for control handlers providing common functionality.
 * Implements patterns from sitna-sandbox's BaseScenarioComponent.
 */
export abstract class ControlHandlerBase implements ControlHandler {
  abstract readonly controlIdentifier: string;
  abstract readonly requiredPatches?: string[];

  /**
   * Patch manager for lifecycle management.
   */
  protected readonly patchManager: PatchManager = createPatchManager();

  /**
   * Cache of load promises to prevent duplicate loads.
   */
  private loadPromiseCache = new Map<string, Promise<void>>();

  /**
   * App config service for getting default configurations.
   */
  protected readonly appConfigService = inject(AppConfigService);

  constructor(protected sitnaApi: SitnaApiService) {}

  /**
   * Load patches required by this control.
   * Default implementation does nothing - patches must be applied programmatically.
   * Override for custom loading logic (e.g., programmatic patches using meld).
   *
   * @param _context
   */
  async loadPatches(_context: AppCfg): Promise<void> {
    // Default: no patches to load (all patches must be applied programmatically)
    return Promise.resolve();
  }

  /**
   * Build configuration for this control.
   * Default: merge getDefaultConfig() with task.parameters.
   * Override when context, side effects, or different semantics are needed.
   */
  buildConfiguration(
    task: AppTasks,
    _context: AppCfg
  ): SitnaControlConfig | null {
    const defaultConfig = this.getDefaultConfig();
    return this.mergeWithParameters(defaultConfig, task.parameters);
  }

  /**
   * Clean up patches and resources.
   */
  cleanup(): void {
    this.patchManager.restoreAll();
    this.loadPromiseCache.clear();
  }

  /**
   * Ensure a control is loaded with proper dependency management.
   * Ported from BaseScenarioComponent.ensureControlLoaded().
   *
   * @param options - Control loading options
   * @returns Promise that resolves when control is loaded
   */
  protected async ensureControlLoaded(
    options: ControlLoadOptions
  ): Promise<void> {
    const { checkLoaded, dependencies, loadScript, controlName } = options;

    // Return cached promise if already loading
    const cachedPromise = this.loadPromiseCache.get(controlName);
    if (cachedPromise) {
      return cachedPromise;
    }

    // Check if already loaded
    if (checkLoaded) {
      const isLoaded = await checkLoaded();
      if (isLoaded) {
        return Promise.resolve();
      }
    }

    // Create loading promise
    const loadPromise = (async () => {
      // Wait for dependencies
      if (dependencies) {
        await this.resolveDependencies(dependencies);
      }

      // Load the script
      loadScript();

      // Wait a tick for script to execute
      await new Promise((resolve) => setTimeout(resolve, 0));
    })();

    // Cache the promise
    this.loadPromiseCache.set(controlName, loadPromise);

    try {
      await loadPromise;
    } finally {
      // Remove from cache after completion
      this.loadPromiseCache.delete(controlName);
    }
  }

  /**
   * Execute callback with TC namespace (synchronous).
   *
   * TC is guaranteed available after app bootstrap and guard checks.
   * Use this for synchronous operations that only need TC access.
   *
   * @param callback - Function to execute with TC namespace
   */
  protected withTC(callback: (TC: any) => void): void {
    const TC = this.sitnaApi.getTC();
    callback(TC);
  }

  /**
   * Execute async callback with TC namespace.
   *
   * TC is guaranteed available after app bootstrap and guard checks.
   * Use when callback contains await statements (HTTP calls, etc).
   *
   * @param callback - Async function to execute with TC namespace
   * @returns Promise that resolves when callback completes
   */
  protected withTCAsync(callback: (TC: any) => Promise<void>): Promise<void> {
    const TC = this.sitnaApi.getTC();
    return callback(TC);
  }

  /**
   * Resolve dependencies before loading control.
   *
   * Dependencies are checked synchronously (TC/SITNA are immediately available),
   * but the method signature remains async for compatibility with ensureControlLoaded().
   *
   * @param dependencies - Dependency specification
   */
  private async resolveDependencies(
    dependencies: string | string[] | (() => void | Promise<void>)
  ): Promise<void> {
    if (typeof dependencies === 'function') {
      await dependencies();
      return;
    }

    const depArray = Array.isArray(dependencies)
      ? dependencies
      : [dependencies];

    for (const dep of depArray) {
      if (dep === 'TC') {
        this.sitnaApi.getTC(); // Throws if missing
      } else if (dep.includes('.')) {
        // It's a property path like 'TC.control.Search'
        this.sitnaApi.getTCProperty(dep); // Throws if missing
      } else {
        // It's a global variable
        this.checkGlobal(dep);
      }
    }
  }

  /**
   * Check if a global variable is available (synchronous).
   *
   * @param globalName - Name of global variable
   * @throws Error if global is not available
   */
  private checkGlobal(globalName: string): void {
    if (!this.sitnaApi.isGlobalDefined(globalName)) {
      throw new Error(
        `Global variable '${globalName}' not available. Check script loading order.`
      );
    }
  }

  /**
   * Check if parameters object is empty or undefined.
   *
   * @param params - Parameters to check
   * @returns true if empty or undefined
   */
  protected areParametersEmpty(params: any): boolean {
    return !params || Object.keys(params).length === 0;
  }

  /**
   * Get default control configuration from app-config.json.
   *
   * @returns Default configuration object from app-config.json, or empty object if not found
   */
  protected getDefaultConfig(): Record<string, any> {
    // Get configuration from app-config.json
    const configDefault = this.appConfigService.getControlDefault(
      this.controlIdentifier
    );

    // Return config default or empty object
    // Use Record<string, any> to preserve all properties (div, displayElevation, etc.)
    return configDefault || {};
  }

  /**
   * Merge default configuration with task parameters.
   *
   * @param defaults - Default configuration
   * @param params - Task parameters from backend
   * @returns Merged configuration
   */
  protected mergeWithParameters(
    defaults: any,
    params: any
  ): SitnaControlConfig {
    return this.areParametersEmpty(params)
      ? defaults
      : { ...defaults, ...params };
  }

  /**
   * Default value when a control is not requested by backend configuration.
   * Most controls are disabled when missing, so this returns false.
   * Override in handlers that need auto-enable logic.
   */
  getDefaultValueWhenMissing(): SitnaControlConfig | boolean {
    return false;
  }
}
