import { Injectable } from '@angular/core';

import { SitnaApiService } from '../../services/sitna-api.service';
import { ControlHandlerBase } from '../control-handler-base';

/**
 * Handler for the native SITNA fullScreen control.
 * Simple control with no patches required.
 *
 * Control Type: sitna.fullScreen
 * Patches: None (native SITNA control)
 * Configuration: Simple div + optional parameters
 */
@Injectable({
  providedIn: 'root'
})
export class FullScreenControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.fullScreen';
  readonly sitnaConfigKey = 'fullScreen';
  readonly requiredPatches = undefined; // No patches needed

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi);
  }
}
