import { Injectable } from '@angular/core';

import { SitnaApiService } from '../../services/sitna-api.service';
import { ControlHandlerBase } from '../control-handler-base';

/**
 * Handler for the native SITNA streetView control.
 * Simple control with no patches required.
 *
 * Control Type: sitna.streetView
 * Patches: None (native SITNA control)
 * Configuration: Simple div + optional parameters (e.g., googleMapsKey, viewDiv)
 */
@Injectable({
  providedIn: 'root'
})
export class StreetViewControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.streetView';
  readonly sitnaConfigKey = 'streetView';
  readonly requiredPatches = undefined; // No patches needed

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi);
  }
}
