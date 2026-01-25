import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';
import { SitnaBaseLayer } from '@api/model/sitna-cfg';

import { ConfigLookupService } from '../../services/config-lookup.service';
import { SitnaApiService } from '../../services/sitna-api.service';
import { UIStateService } from '../../services/ui-state.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

/**
 * Handler for the native SITNA overviewMap control.
 * Resolves layer from application situation-map: uses first layer from the group.
 * Falls back to first basemap from backgrounds when situation-map is not configured.
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
    sitnaApi: SitnaApiService,
    private configLookup: ConfigLookupService,
    private uiStateService: UIStateService
  ) {
    super(sitnaApi);
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
    const situationMapId = context.application?.['situation-map'];

    if (!situationMapId) {
      // No situation-map: use first basemap from backgrounds
      const defaultLayer = this.resolveFirstBasemap(context);
      if (defaultLayer) {
        return {
          div: defaultConfig['div'],
          layer: defaultLayer
        };
      }
      // No basemaps available: disable control
      return null;
    }

    // Situation-map exists: try to resolve (legacy lines 536-568)
    const resolvedLayer = this.resolveLayerFromSituationMap(context);
    if (resolvedLayer) {
      return {
        div: defaultConfig['div'],
        layer: resolvedLayer
      };
    }

    // Resolution failed: try first basemap as fallback
    const fallbackLayer = this.resolveFirstBasemap(context);
    if (fallbackLayer) {
      return {
        div: defaultConfig['div'],
        layer: fallbackLayer
      };
    }

    // No basemaps available: disable control
    return null;
  }

  /**
   * Resolve first basemap from backgrounds configuration.
   * Used as fallback when situation-map is not configured.
   */
  private resolveFirstBasemap(context: AppCfg): SitnaBaseLayer | null {
    if (!context.backgrounds?.length) {
      return null;
    }

    // Get first background
    const firstBackground = context.backgrounds[0];
    const group =
      this.configLookup.findGroup(firstBackground.id) ||
      context.groups.find((g) => g.id === firstBackground.id);

    if (!group?.layers?.length) {
      return null;
    }

    // Get first layer from first background group
    const layerId = group.layers[0];
    const layer =
      this.configLookup.findLayer(layerId) ||
      context.layers.find((l) => l.id === layerId);

    if (!layer) {
      return null;
    }

    // Get service
    const service =
      this.configLookup.findService(layer.service) ||
      context.services.find((s) => s.id === layer.service);

    if (!service?.url) {
      return null;
    }

    // Build SitnaBaseLayer matching LayerCatalog.addLayerToMap structure
    const result: SitnaBaseLayer = {
      id: layer.title,
      title: layer.title,
      url: service.url,
      type: service.type,
      layerNames: layer.layers
    };
    return result;
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

    // Build SitnaBaseLayer matching LayerCatalog.addLayerToMap structure
    const result: SitnaBaseLayer = {
      id: layer.title,
      title: layer.title,
      url: service.url,
      type: service.type,
      layerNames: layer.layers
    };
    return result;
  }

  override isReady(): boolean {
    return true;
  }
}
