import { Injectable } from '@angular/core';

import { SitnaApiService } from '../../services/sitna-api.service';
import { ControlHandlerBase } from '../control-handler-base';

/**
 * Handler for the native SITNA share control.
 * Simple control with no patches required.
 *
 * Control Type: sitna.share
 * Patches: None (native SITNA control)
 * Configuration: Simple div + optional parameters
 */
@Injectable({
  providedIn: 'root'
})
export class ShareControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.share';
  readonly sitnaConfigKey = 'share';
  readonly requiredPatches = undefined; // No patches needed

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi);
  }
}
