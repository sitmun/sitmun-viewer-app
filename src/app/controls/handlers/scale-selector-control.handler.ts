import { Injectable } from '@angular/core';

import { SitnaApiService } from '../../services/sitna-api.service';
import { ControlHandlerBase } from '../control-handler-base';

/**
 * Handler for the native SITNA scale selector control.
 * Simple control with no patches required.
 *
 * Control Type: sitna.scaleSelector
 * Patches: None (native SITNA control)
 * Configuration: Simple div + optional parameters
 */
@Injectable({
  providedIn: 'root'
})
export class ScaleSelectorControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.scaleSelector';
  readonly sitnaConfigKey = 'scaleSelector';
  readonly requiredPatches = undefined; // No patches needed

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi);
  }
}
