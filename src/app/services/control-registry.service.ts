import { Injectable } from '@angular/core';
import {
  ControlHandler,
  SitnaControlConfig
} from '../controls/control-handler.interface';
import { AppCfg, AppTasks } from '@api/model/app-cfg';
import { SitnaControls, SitnaControlOptions } from '@api/model/sitna-cfg';
import { NotificationService } from '../notifications/services/NotificationService';
import { AppConfigService } from './app-config.service';

/**
 * Registry service for control handlers.
 * Manages registration, lookup, and orchestration of control handlers.
 */
@Injectable({
  providedIn: 'root'
})
export class ControlRegistryService {
  /**
   * Map of control type to handler instance.
   */
  private handlers = new Map<string, ControlHandler>();

  constructor(
    private notificationService: NotificationService,
    private appConfigService: AppConfigService
  ) {}

  /**
   * Register a control handler.
   *
   * @param handler - Handler instance to register
   */
  register(handler: ControlHandler): void {
    if (this.handlers.has(handler.controlIdentifier)) {
      console.warn(
        `[ControlRegistry] Handler for '${handler.controlIdentifier}' already registered, replacing`
      );
    }
    this.handlers.set(handler.controlIdentifier, handler);
  }

  /**
   * Register multiple handlers at once.
   *
   * @param handlers - Array of handler instances
   */
  registerAll(handlers: ControlHandler[]): void {
    handlers.forEach((handler) => this.register(handler));
  }

  /**
   * Get handler for a specific control type.
   *
   * @param controlType - Control type identifier (e.g., 'sitna.coordinates')
   * @returns Handler instance or undefined if not found
   */
  getHandler(controlType: string): ControlHandler | undefined {
    return this.handlers.get(controlType);
  }

  /**
   * Check if a handler is registered for a control type.
   *
   * @param controlType - Control type identifier
   * @returns true if handler is registered
   */
  hasHandler(controlType: string): boolean {
    return this.handlers.has(controlType);
  }

  /**
   * Get all registered control types.
   *
   * @returns Array of control type identifiers
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Process all tasks to build SITNA controls configuration.
   * Coordinates loading patches and building configuration.
   *
   * @param tasks - Array of tasks from backend
   * @param context - Full application configuration
   * @returns Promise resolving to SITNA controls configuration
   */
  async processControls(
    tasks: AppTasks[],
    context: AppCfg
  ): Promise<Partial<SitnaControls>> {
    const sitnaControls: Partial<SitnaControls> = {};

    // STEP 0: Apply foundational patches FIRST (before any map initialization)
    // This ensures patches like Layer.getCapabilitiesOnline are applied before layers are loaded
    const layerCatalogHandler = this.getHandler('sitna.layerCatalog');
    if (
      layerCatalogHandler &&
      tasks.some((task) => task['ui-control'] === 'sitna.layerCatalog')
    ) {
      console.log(
        '[ControlRegistry] Applying foundational patches for virtual WMS (preload step)'
      );
      // Apply just the foundational patch early - full patches will be applied later if control is used
      await (layerCatalogHandler as any).applyFoundationPatch?.(context);
    }

    // Step 1: Identify active controls that have handlers
    const activeControls = tasks
      .filter((task) => task['ui-control']?.startsWith('sitna.'))
      .map((task) => ({
        task,
        handler: this.getHandler(task['ui-control'])
      }))
      .filter(({ handler }) => handler !== undefined);

    if (activeControls.length === 0) {
      console.warn(
        '[ControlRegistry] No active controls with registered handlers found'
      );
      // Still set default values for missing controls (e.g., auto-enable attribution if text configured)
      this.setDefaultValuesForMissingControls(sitnaControls, context);
      return sitnaControls;
    }

    console.log(
      `[ControlRegistry] Processing ${
        activeControls.length
      } controls with handlers: ${activeControls
        .map(({ task }) => task['ui-control'])
        .join(', ')}`
    );

    // Build configuration for each control and load patches only for controls that are actually used
    for (const { task, handler } of activeControls) {
      try {
        // First, build configuration to check if control will be used
        const config = handler!.buildConfiguration(task, context);

        if (config !== null) {
          // Control will be used - always load patches (programmatic patches need to be applied)
          // Note: isReady() check was for JS patch loading, but programmatic patches should always be applied
          console.log(
            `[ControlRegistry] Loading patches for ${task['ui-control']} (control will be used)`
          );
          await handler!.loadPatches(context);

          // Use handler's explicit sitnaConfigKey (required for all handlers)
          // Support dynamic config keys via getSitnaConfigKey() method if available
          let controlKey: string;
          if (typeof (handler as any).getSitnaConfigKey === 'function') {
            controlKey = (handler as any).getSitnaConfigKey(task);
          } else if (handler!.sitnaConfigKey) {
            controlKey = handler!.sitnaConfigKey;
          } else {
            console.error(
              `[ControlRegistry] Handler for '${task['ui-control']}' missing sitnaConfigKey`
            );
            continue;
          }
          sitnaControls[controlKey as keyof SitnaControls] = config as any;

          console.log(
            `[ControlRegistry] Configured ${task['ui-control']} as '${controlKey}'`,
            config
          );
        } else {
          console.log(
            `[ControlRegistry] Control ${task['ui-control']} returned null config, skipping (no patches loaded)`
          );
        }
      } catch (error) {
        console.error(
          `[ControlRegistry] Failed to configure ${task['ui-control']}:`,
          error
        );
        // Continue with other controls
      }
    }

    // Post-process: Set default values for controls that are registered but NOT requested
    // Each handler can define its own default value via getDefaultValueWhenMissing()
    this.setDefaultValuesForMissingControls(sitnaControls, context);

    // Post-process: Disable default featureInfo if featureInfo.silme.extension is not requested
    // This matches legacy behavior (line 942 in sitna-helpers.ts)
    this.ensureFeatureInfoDisabled(sitnaControls, tasks);

    // Post-process: Auto-enable hidden native search if searchSilme is configured
    // SearchSilme patch delegates search execution to native search control
    // The patch accesses both controls via getControlsByClass('TC.control.Search')[0] and [1]
    this.ensureHiddenNativeSearchForSilme(sitnaControls, tasks);

    console.log(
      `[ControlRegistry] Successfully configured ${
        Object.keys(sitnaControls).length
      } controls`
    );
    console.log(`[ControlRegistry] Final sitnaControls object:`, sitnaControls);

    // Validate div usage after all controls are processed
    this.validateDivUsage(sitnaControls);

    // Log search-related controls specifically for debugging
    if (sitnaControls.search || sitnaControls.searchSilme) {
      console.log('[ControlRegistry] Search controls in final config:');
      console.log('  - search:', sitnaControls.search);
      console.log('  - searchSilme:', sitnaControls.searchSilme);
    }

    return sitnaControls;
  }

  /**
   * Set default values for controls that are registered but NOT requested in backend tasks.
   * Each handler must define a default value via getDefaultValueWhenMissing().
   * 
   * This approach ensures:
   * - All controls are explicitly set to a value (never undefined)
   * - Most controls are disabled (false) when not requested
   * - Special controls (like attribution) can implement auto-enable logic
   * - Handlers can check app-config.json for meaningful data (not just structural properties like div)
   *
   * @param sitnaControls - The configured controls object (modified in place)
   * @param context - Full application configuration context
   */
  private setDefaultValuesForMissingControls(
    sitnaControls: Partial<SitnaControls>,
    context: AppCfg
  ): void {
    // Iterate through all registered handlers
    for (const [controlIdentifier, handler] of this.handlers.entries()) {
      // Get the SITNA config key for this handler
      let controlKey: string;
      if (typeof (handler as any).getSitnaConfigKey === 'function') {
        controlKey = (handler as any).getSitnaConfigKey();
      } else if (handler.sitnaConfigKey) {
        controlKey = handler.sitnaConfigKey;
      } else {
        // Skip handlers without a config key
        continue;
      }
      
      // Only process if control is not already configured (no backend task)
      const currentValue = sitnaControls[controlKey as keyof SitnaControls];
      if (currentValue === undefined) {
        // Call handler's getDefaultValueWhenMissing() method
        // This method MUST return a value (never undefined)
        const defaultValue = (handler as any).getDefaultValueWhenMissing?.();
        
        if (defaultValue !== undefined) {
          sitnaControls[controlKey as keyof SitnaControls] = defaultValue;
          console.log(
            `[ControlRegistry] Set default for missing control '${controlKey}':`,
            defaultValue
          );
        } else {
          // This should never happen - all handlers must return a value
          console.warn(
            `[ControlRegistry] Handler '${controlIdentifier}' returned undefined from getDefaultValueWhenMissing(). This is not allowed.`
          );
        }
      } else {
        // Control is already configured - log for debugging
        if (controlKey === 'searchSilme') {
          console.log(
            `[ControlRegistry] searchSilme already configured, skipping default value. Current value:`,
            currentValue
          );
        }
      }
    }
  }

  /**
   * Ensure featureInfo is disabled if featureInfo.silme.extension is not requested.
   * This matches legacy behavior (line 942 in sitna-helpers.ts) where featureInfo = false
   * is set when the control is not present to prevent default SITNA behavior.
   *
   * @param sitnaControls - The configured controls object (modified in place)
   * @param tasks - Array of tasks from backend
   */
  private ensureFeatureInfoDisabled(
    sitnaControls: Partial<SitnaControls>,
    tasks: AppTasks[]
  ): void {
    // Check if featureInfo.silme.extension is requested
    const hasFeatureInfoSilme = tasks.some(
      (task) => task['ui-control'] === 'sitna.featureInfo.silme.extension'
    );

    // If not requested and featureInfo is not already configured, disable it
    if (!hasFeatureInfoSilme && sitnaControls.featureInfo === undefined) {
      sitnaControls.featureInfo = false;
      console.log(
        '[ControlRegistry] Disabled default featureInfo (featureInfo.silme.extension not requested)'
      );
    }
  }


  /**
   * Auto-enable a hidden native search control if searchSilme is configured.
   * The SearchSilme patch delegates actual search execution to the native control.
   * It accesses controls via getControlsByClass('TC.control.Search')[0] (native) and [1] (Silme).
   * 
   * We configure the native search with div: null to prevent DOM rendering,
   * but it still provides the backend search functionality.
   *
   * @param sitnaControls - The configured controls object (modified in place)
   * @param tasks - Array of tasks from backend
   */
  private ensureHiddenNativeSearchForSilme(
    sitnaControls: Partial<SitnaControls>,
    tasks: AppTasks[]
  ): void {
    // Check if searchSilme is configured (truthy value)
    const hasSearchSilme = !!sitnaControls.searchSilme;

    // Check if native search is already configured (truthy value)
    const hasNativeSearch = !!sitnaControls.search;

    // If searchSilme is configured but native search is not, enable it in hidden mode
    if (hasSearchSilme && !hasNativeSearch) {
      // Copy searchSilme configuration to native search, but remove the div
      // This gives the native search the same search types, URLs, and parameters
      // but prevents it from rendering in the DOM
      const searchSilmeConfig = sitnaControls.searchSilme as any;
      const nativeSearchConfig = { ...searchSilmeConfig };
      delete nativeSearchConfig.div; // Remove div to hide the control
      delete nativeSearchConfig.type; // Remove type so it uses native Search class
      
      sitnaControls.search = nativeSearchConfig;
      console.log(
        '[ControlRegistry] Auto-enabled hidden native search control with searchSilme configuration (required for delegation)'
      );
    }
  }

  /**
   * Validate that no two controls are using the same div.
   * Shows warning toasts for any conflicts detected.
   *
   * @param sitnaControls - The configured controls object
   */
  private validateDivUsage(sitnaControls: Partial<SitnaControls>): void {
    const divUsage = new Map<string, string[]>();

    // Iterate through all configured controls
    for (const [controlKey, config] of Object.entries(sitnaControls)) {
      // Extract div from config (handle both string and object configs)
      const div =
        typeof config === 'object' && config !== null ? config.div : null;

      if (div && typeof div === 'string') {
        if (!divUsage.has(div)) {
          divUsage.set(div, []);
        }
        divUsage.get(div)!.push(controlKey);
      }
    }

    // Show warnings for duplicates
    for (const [div, controls] of divUsage.entries()) {
      if (controls.length > 1) {
        this.notificationService.warning(
          `Configuration conflict: Multiple controls are using the same div '${div}': ${controls.join(
            ', '
          )}. Only the first will be rendered correctly.`
        );
      }
    }
  }

  /**
   * Unregister a handler for a control type.
   *
   * @param controlType - Control type identifier
   * @returns true if handler was unregistered
   */
  unregister(controlType: string): boolean {
    const handler = this.handlers.get(controlType);
    if (handler) {
      handler.cleanup?.();
      return this.handlers.delete(controlType);
    }
    return false;
  }

  /**
   * Unregister all handlers and clean up.
   */
  unregisterAll(): void {
    this.handlers.forEach((handler) => handler.cleanup?.());
    this.handlers.clear();
  }

  /**
   * Get statistics about registered handlers.
   *
   * @returns Object with handler statistics
   */
  getStatistics(): {
    totalHandlers: number;
    handlerTypes: string[];
    handlersWithPatches: number;
  } {
    const handlers = Array.from(this.handlers.values());

    return {
      totalHandlers: handlers.length,
      handlerTypes: Array.from(this.handlers.keys()),
      handlersWithPatches: handlers.filter(
        (h) => h.requiredPatches && h.requiredPatches.length > 0
      ).length
    };
  }
}
