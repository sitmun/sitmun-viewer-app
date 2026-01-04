import { Injectable } from '@angular/core';
import { ControlHandler, SitnaControlConfig } from '../controls/control-handler.interface';
import { AppCfg, AppTasks } from '@api/model/app-cfg';
import { SitnaControls } from '@api/model/sitna-cfg';

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

  /**
   * Register a control handler.
   * 
   * @param handler - Handler instance to register
   */
  register(handler: ControlHandler): void {
    if (this.handlers.has(handler.controlIdentifier)) {
      console.warn(`[ControlRegistry] Handler for '${handler.controlIdentifier}' already registered, replacing`);
    }
    this.handlers.set(handler.controlIdentifier, handler);
  }

  /**
   * Register multiple handlers at once.
   * 
   * @param handlers - Array of handler instances
   */
  registerAll(handlers: ControlHandler[]): void {
    handlers.forEach(handler => this.register(handler));
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
  async processControls(tasks: AppTasks[], context: AppCfg): Promise<Partial<SitnaControls>> {
    const sitnaControls: Partial<SitnaControls> = {};

    // STEP 0: Apply foundational patches FIRST (before any map initialization)
    // This ensures patches like Layer.getCapabilitiesOnline are applied before layers are loaded
    const layerCatalogHandler = this.getHandler('sitna.layerCatalog');
    if (layerCatalogHandler && tasks.some(task => task['ui-control'] === 'sitna.layerCatalog')) {
      console.log('[ControlRegistry] Applying foundational patches for virtual WMS (preload step)');
      // Apply just the foundational patch early - full patches will be applied later if control is used
      await (layerCatalogHandler as any).applyFoundationPatch?.(context);
    }

    // Step 1: Identify active controls that have handlers
    const activeControls = tasks
      .filter(task => task['ui-control']?.startsWith('sitna.'))
      .map(task => ({
        task,
        handler: this.getHandler(task['ui-control'])
      }))
      .filter(({ handler }) => handler !== undefined);

    if (activeControls.length === 0) {
      console.warn('[ControlRegistry] No active controls with registered handlers found');
      return sitnaControls;
    }

    console.log(
      `[ControlRegistry] Processing ${activeControls.length} controls with handlers: ${
        activeControls.map(({ task }) => task['ui-control']).join(', ')
      }`
    );

    // Build configuration for each control and load patches only for controls that are actually used
    for (const { task, handler } of activeControls) {
      try {
        // First, build configuration to check if control will be used
        const config = handler!.buildConfiguration(task, context);
        
        if (config !== null) {
          // Control will be used - always load patches (programmatic patches need to be applied)
          // Note: isReady() check was for JS patch loading, but programmatic patches should always be applied
          console.log(`[ControlRegistry] Loading patches for ${task['ui-control']} (control will be used)`);
          await handler!.loadPatches(context);
          
          // Use handler's custom key if provided, otherwise generate from ui-control
          const controlKey = handler!.sitnaConfigKey || this.getControlKey(task['ui-control']);
          sitnaControls[controlKey as keyof SitnaControls] = config as any;
          
          console.log(`[ControlRegistry] Configured ${task['ui-control']} as '${controlKey}'`, config);
        } else {
          console.log(`[ControlRegistry] Control ${task['ui-control']} returned null config, skipping (no patches loaded)`);
        }
      } catch (error) {
        console.error(`[ControlRegistry] Failed to configure ${task['ui-control']}:`, error);
        // Continue with other controls
      }
    }

    console.log(`[ControlRegistry] Successfully configured ${Object.keys(sitnaControls).length} controls`);
    console.log(`[ControlRegistry] Final sitnaControls object:`, sitnaControls);
    return sitnaControls;
  }

  /**
   * Convert control type to SITNA configuration key.
   * Examples:
   * - 'sitna.coordinates' -> 'coordinates'
   * - 'sitna.search.silme.extension' -> 'searchSilmeExtension'
   * - 'sitna.layerCatalog' -> 'layerCatalog'
   * 
   * @param uiControl - Control type from backend
   * @returns Configuration key for SITNA
   */
  private getControlKey(uiControl: string): string {
    // Remove 'sitna.' prefix
    let key = uiControl.replace('sitna.', '');
    
    // Convert dots to camelCase
    // 'search.silme.extension' -> 'searchSilmeExtension'
    const parts = key.split('.');
    if (parts.length > 1) {
      key = parts[0] + parts.slice(1).map(
        part => part.charAt(0).toUpperCase() + part.slice(1)
      ).join('');
    }
    
    return key;
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
    this.handlers.forEach(handler => handler.cleanup?.());
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
      handlersWithPatches: handlers.filter(h => h.requiredPatches && h.requiredPatches.length > 0).length
    };
  }
}

