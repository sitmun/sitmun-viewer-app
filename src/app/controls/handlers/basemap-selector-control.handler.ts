import { Injectable } from '@angular/core';

import { SitnaApiService } from '../../services/sitna-api.service';
import { ControlHandlerBase } from '../control-handler-base';

/**
 * Handler for the native SITNA basemapSelector control.
 * Simple control with no patches required.
 *
 * Control Type: sitna.basemapSelector
 * Patches: None (native SITNA control)
 * Configuration: Simple div + optional parameters
 */
@Injectable({
  providedIn: 'root'
})
export class BasemapSelectorControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.basemapSelector';
  readonly sitnaConfigKey = 'basemapSelector';
  readonly requiredPatches = undefined; // No patches needed

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi);
  }
}
