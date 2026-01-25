import { Injectable } from '@angular/core';

import { SitnaApiService } from '../../services/sitna-api.service';
import { ControlHandlerBase } from '../control-handler-base';

/**
 * Handler for the native SITNA scale control.
 * Simple control with no patches required.
 *
 * Control Type: sitna.scale
 * Patches: None (native SITNA control)
 * Configuration: Simple div + optional parameters
 */
@Injectable({
  providedIn: 'root'
})
export class ScaleControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.scale';
  readonly sitnaConfigKey = 'scale';
  readonly requiredPatches = undefined; // No patches needed

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi);
  }
}
