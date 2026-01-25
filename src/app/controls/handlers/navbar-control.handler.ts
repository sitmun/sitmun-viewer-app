import { Injectable } from '@angular/core';

import { SitnaApiService } from '../../services/sitna-api.service';
import { ControlHandlerBase } from '../control-handler-base';

/**
 * Handler for the native SITNA navBar control.
 * Simple control with no patches required.
 *
 * Control Type: sitna.navBar
 * Patches: None (native SITNA control)
 * Configuration: Simple div + optional parameters
 */
@Injectable({
  providedIn: 'root'
})
export class NavBarControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.navBar';
  readonly sitnaConfigKey = 'navBar';
  readonly requiredPatches = undefined; // No patches needed

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi);
  }
}
