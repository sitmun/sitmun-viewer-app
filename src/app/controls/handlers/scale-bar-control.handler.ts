import { Injectable } from '@angular/core';

import { SitnaApiService } from '../../services/sitna-api.service';
import { ControlHandlerBase } from '../control-handler-base';

/**
 * Handler for the native SITNA scale bar control.
 * Simple control with no patches required.
 *
 * Control Type: sitna.scaleBar
 * Patches: None (native SITNA control)
 * Configuration: Simple div + optional parameters
 */
@Injectable({
  providedIn: 'root'
})
export class ScaleBarControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.scaleBar';
  readonly sitnaConfigKey = 'scaleBar';
  readonly requiredPatches = undefined; // No patches needed

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi);
  }
}
