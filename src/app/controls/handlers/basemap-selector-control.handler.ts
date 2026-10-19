import { inject, Injectable } from '@angular/core';

import type { AppCfg, AppTasks } from '@api/model/app-cfg';

import { SitnaApiService } from '../../services/sitna-api.service';
import { SitnaCapabilitiesInterceptor } from '../../services/sitna-capabilities-interceptor.service';
import { ControlHandlerBase } from '../control-handler-base';
import { BootstrapEligibilityOptions } from '../control-handler.interface';

/**
 * Handler for the native SITNA basemapSelector control.
 *
 * Control Type: sitna.basemapSelector
 * Patches: None of its own; participates in the shared {@link SitnaCapabilitiesInterceptor}
 * bootstrap so basemap-only apps still get virtual/real GetCapabilities post-processing.
 * Configuration: Simple div + optional parameters
 */
@Injectable({
  providedIn: 'root'
})
export class BasemapSelectorControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.basemapSelector';
  readonly sitnaConfigKey = 'basemapSelector';
  readonly requiredPatches = undefined;

  private readonly capabilitiesInterceptor = inject(SitnaCapabilitiesInterceptor);

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi);
  }

  /** Run bootstrap only when basemapSelector is requested by a task. */
  needsBootstrap(
    tasks: AppTasks[],
    _options: BootstrapEligibilityOptions
  ): boolean {
    return tasks.some((t) => t['ui-control'] === 'sitna.basemapSelector');
  }

  /**
   * Bootstrap: install the shared SITNA capabilities interceptor so basemap raster layers get
   * the same virtual/real GetCapabilities post-processing as layer-catalog raster layers.
   * Idempotent across handlers via {@link SitnaCapabilitiesInterceptor#ensurePatched}.
   */
  async applyBootstrap(context: AppCfg): Promise<void> {
    await this.capabilitiesInterceptor.ensurePatched(context);
  }
}
