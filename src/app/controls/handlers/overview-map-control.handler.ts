import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';
import { SitnaBaseLayer } from '@api/model/sitna-cfg';

import { ConfigLookupService } from '../../services/config-lookup.service';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { UIStateService } from '../../services/ui-state.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

/**
 * Handler for the native SITNA overviewMap control.
 * Requires layer resolution from situation-map configuration.
 *
 * Control Type: sitna.overviewMap
 * Patches: None (native SITNA control)
 * Configuration: div + layer (string or SitnaBaseLayer object)
 */
@Injectable({
  providedIn: 'root'
})
export class OverviewMapControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.overviewMap';
  readonly sitnaConfigKey = 'overviewMap';
  readonly requiredPatches = undefined;

  constructor(
    tcNamespaceService: TCNamespaceService,
    private configLookup: ConfigLookupService,
    private uiStateService: UIStateService
  ) {
    super(tcNamespaceService);
  }

  buildConfiguration(
    task: AppTasks,
    context: AppCfg
  ): SitnaControlConfig | null {
    // Initialize ConfigLookupService before use
    this.configLookup.initialize(context);

    // Enable UI button (matches legacy line 582-584)
    this.uiStateService.enableOverviewMapButton();

    const defaultConfig = this.getDefaultConfig();

    // If parameters provided, use AS-IS without merge (legacy line 579)
    if (!this.areParametersEmpty(task.parameters)) {
      return task.parameters;
    }

    // Parameters empty - check situation-map (legacy line 535)
    if (!context.application?.['situation-map']) {
      // No situation-map: use default 'mapabase' (legacy lines 573-576)
      return {
        div: defaultConfig.div,
        layer: 'mapabase'
      };
    }

    // Situation-map exists: try to resolve (legacy lines 536-568)
    const resolvedLayer = this.resolveLayerFromSituationMap(context);
    if (resolvedLayer) {
      return {
        div: defaultConfig.div,
        layer: resolvedLayer
      };
    }

    // Resolution failed: disable control (legacy behavior)
    return null;
  }

  /**
   * Resolve layer configuration from situation-map.
   * Matches legacy logic from lines 536-568.
   */
  private resolveLayerFromSituationMap(context: AppCfg): SitnaBaseLayer | null {
    const situationMapId = context.application?.['situation-map'];
    if (!situationMapId) {
      return null;
    }

    // Find group (legacy lines 537-542)
    const group =
      this.configLookup.findGroup(situationMapId) ||
      context.groups.find((g) => g.id === situationMapId);

    if (!group?.layers?.length) {
      return null;
    }

    // Get first layer from group (legacy line 548)
    const layerId = group.layers[0];
    const layer =
      this.configLookup.findLayer(layerId) ||
      context.layers.find((l) => l.id === layerId);

    if (!layer) {
      return null;
    }

    // Get service (legacy lines 553-559)
    const service =
      this.configLookup.findService(layer.service) ||
      context.services.find((s) => s.id === layer.service);

    // Validate service has URL
    if (!service?.url) {
      return null;
    }

    // Build SitnaBaseLayer (legacy lines 563-567)
    return {
      id: layer.title,
      url: service.url,
      layerNames: layer.layers
    };
  }

  override isReady(): boolean {
    return true;
  }
}
