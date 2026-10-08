import { inject } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import {
  ControlHandler,
  SitnaControlConfig
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
