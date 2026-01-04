import { Injectable } from '@angular/core';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';
import { AppCfg, AppTasks } from '@api/model/app-cfg';
import { TCNamespaceService } from '../../services/tc-namespace.service';

/**
 * Handler for legacy Silme search extension.
 * Custom search control for SITMUN-specific search.
 * 
 * Control Type: sitna.search.silme.extension
 * Patches: Applied programmatically (not loaded from JS files)
 * Configuration: Custom Silme control for entity search
 */
@Injectable({
  providedIn: 'root'
})
export class SearchSilmeControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.search.silme.extension';
  readonly sitnaConfigKey = 'searchSilme'; // Match old system
  readonly requiredPatches = undefined; // Patches applied programmatically

  constructor(
    tcNamespaceService: TCNamespaceService
  ) {
    super(tcNamespaceService);
  }

  /**
   * Build configuration for SearchSilme control.
   * Uses default div and merges with backend parameters.
   */
  buildConfiguration(task: AppTasks, context: AppCfg): SitnaControlConfig | null {
    const defaultConfig = this.getDefaultConfig();
    
    // Merge with parameters, which may include:
    // - searchUrl: URL for search endpoint
    // - searchFields: Fields to search on
    // - etc.
    return this.mergeWithParameters(defaultConfig, task.parameters);
  }

  /**
   * Check if SearchSilme control is ready.
   */
  override isReady(): boolean {
    if (!super.isReady()) {
      return false;
    }

    const TC = this.tcNamespaceService.getTC();
    return !!(TC?.control?.SearchSilme);
  }
}

