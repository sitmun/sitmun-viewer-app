import { Injectable } from '@angular/core';
import {
  ControlHandler,
  SitnaControlConfig
} from '../controls/control-handler.interface';
import { AppCfg, AppTasks } from '@api/model/app-cfg';
import { SitnaControls, SitnaControlOptions } from '@api/model/sitna-cfg';
import { NotificationService } from '../notifications/services/NotificationService';
import { AppConfigService } from './app-config.service';
import { ControlHandlerBase } from '../controls/control-handler-base';

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
      // Apply just the foundational patch early - full patches will be applied later if control is used
      await (layerCatalogHandler as any).applyFoundationPatch?.(context);
    }

    // Step 1: Identify active controls that have handlers
    const activeControlsWithHandlers = tasks
      .filter((task) => task['ui-control']?.startsWith('sitna.'))
      .map((task) => ({
        task,
        handler: this.getHandler(task['ui-control'])
      }))
      .filter(
        (item): item is { task: AppTasks; handler: ControlHandler } =>
          item.handler !== undefined
      );

    const activeControls: Array<{ task: AppTasks; handler: ControlHandler }> =
      activeControlsWithHandlers;

    if (activeControls.length === 0) {
      // Still set default values for missing controls (e.g., auto-enable attribution if text configured)
      this.setDefaultValuesForMissingControls(sitnaControls, context);
      return sitnaControls;
    }

    // Build configuration for each control and load patches only for controls that are actually used
    for (const { task, handler } of activeControls) {
      try {
        // First, build configuration to check if control will be used
        const config = handler!.buildConfiguration(task, context);

        if (config !== null) {
          // Control will be used - load patches only if needed
          // Check if handler has patches to load (requiredPatches defined) or overrides loadPatches
          const hasPatches =
            handler!.requiredPatches !== undefined &&
            handler!.requiredPatches.length > 0;
          const hasCustomLoadPatches =
            handler!.loadPatches !== ControlHandlerBase.prototype.loadPatches;

          if (hasPatches || hasCustomLoadPatches) {
            await handler!.loadPatches(context);
          }

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
        }
      } catch (error) {
        console.error(
          `[ControlRegistry] Failed to configure ${task['ui-control']}:`,
          error
        );
        // Continue with other controls
      }
    }

    // Post-process: Resolve control dependencies
    // This ensures dependent controls (e.g., Modify for DrawMeasureModify) are enabled
    this.resolveControlDependencies(sitnaControls, activeControls, context);

    // Post-process: Set default values for controls that are registered but NOT requested
    // Each handler can define its own default value via getDefaultValueWhenMissing()
    this.setDefaultValuesForMissingControls(sitnaControls, context);

    // Post-process: Disable default featureInfo if featureInfo.silme.extension is not requested
    // This matches legacy behavior from sitna-helpers.ts (now integrated into this service)
    this.ensureFeatureInfoDisabled(sitnaControls, tasks);

    // Validate div usage after all controls are processed
    this.validateDivUsage(sitnaControls);

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
   * - Controls listed in enabledByDefault are automatically enabled with their default config
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

      // Only process if control is not already configured by backend
      // Note: undefined = not configured by backend (we can enable it)
      //       false = explicitly disabled by backend (we respect that)
      //       any object = enabled by backend (we respect that)
      const currentValue = sitnaControls[controlKey as keyof SitnaControls];
      if (currentValue === undefined) {
        // Check if this control should be enabled by default
        // Only enable if backend hasn't configured it (either enabled or disabled)
        if (this.appConfigService.isEnabledByDefault(controlIdentifier)) {
          // Build configuration using handler with minimal task
          // This will use the default config from controlDefaults in app-config.json
          const minimalTask: AppTasks = {
            id: '',
            'ui-control': controlIdentifier,
            parameters: {}
          };

          try {
            const config = handler.buildConfiguration(minimalTask, context);
            if (config !== null) {
              sitnaControls[controlKey as keyof SitnaControls] = config as any;
              console.log(
                `[ControlRegistry] Auto-enabled '${controlIdentifier}' (listed in enabledByDefault)`
              );
              continue;
            }
          } catch (error) {
            console.warn(
              `[ControlRegistry] Failed to build default config for '${controlIdentifier}':`,
              error
            );
          }
        }

        // Fall back to handler's getDefaultValueWhenMissing() method
        // This method MUST return a value (never undefined)
        const defaultValue = (handler as any).getDefaultValueWhenMissing?.();

        if (defaultValue !== undefined) {
          sitnaControls[controlKey as keyof SitnaControls] = defaultValue;
        } else {
          // This should never happen - all handlers must return a value
          console.warn(
            `[ControlRegistry] Handler '${controlIdentifier}' returned undefined from getDefaultValueWhenMissing(). This is not allowed.`
          );
        }
      }
    }
  }

  /**
   * Resolve control dependencies by auto-enabling required controls.
   * When a control declares dependencies (e.g., DrawMeasureModify depends on Modify),
   * this method ensures those dependencies are enabled in the controls configuration.
   *
   * @param sitnaControls - The configured controls object (modified in place)
   * @param activeControls - Array of active controls with their handlers
   * @param context - Full application configuration context
   */
  private resolveControlDependencies(
    sitnaControls: Partial<SitnaControls>,
    activeControls: Array<{ task: AppTasks; handler: ControlHandler }>,
    context: AppCfg
  ): void {
    for (const { handler } of activeControls) {
      if (handler.dependencies && handler.dependencies.length > 0) {
        for (const depIdentifier of handler.dependencies) {
          const depHandler = this.getHandler(depIdentifier);
          if (depHandler) {
            // Get the SITNA config key for the dependency
            let depConfigKey: string;
            if (typeof (depHandler as any).getSitnaConfigKey === 'function') {
              depConfigKey = (depHandler as any).getSitnaConfigKey();
            } else if (depHandler.sitnaConfigKey) {
              depConfigKey = depHandler.sitnaConfigKey;
            } else {
              continue;
            }

            // Check if dependency is already configured
            const currentValue =
              sitnaControls[depConfigKey as keyof SitnaControls];
            if (currentValue === undefined) {
              // Auto-enable dependency by building its configuration
              const depConfig = depHandler.buildConfiguration(
                { 'ui-control': depIdentifier } as AppTasks,
                context
              );
              if (depConfig !== null) {
                sitnaControls[depConfigKey as keyof SitnaControls] =
                  depConfig as any;
              }
            }
          } else {
            console.warn(
              `[ControlRegistry] No handler found for dependency '${depIdentifier}' required by '${handler.controlIdentifier}'`
            );
          }
        }
      }
    }
  }

  /**
   * Ensure featureInfo is disabled if featureInfo.silme.extension is not requested.
   * This matches legacy behavior from sitna-helpers.ts (now integrated into this service)
   * where featureInfo = false is set when the control is not present to prevent default SITNA behavior.
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
