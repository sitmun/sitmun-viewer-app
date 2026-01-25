import { Injectable } from '@angular/core';

import { SitnaApiService } from '../../services/sitna-api.service';
import { ControlHandlerBase } from '../control-handler-base';

/**
 * Handler for the native SITNA coordinates control.
 *
 * Control Type: sitna.coordinates
 * Configuration: Simple div + optional parameters
 */
@Injectable({
  providedIn: 'root'
})
export class CoordinatesControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.coordinates';
  readonly sitnaConfigKey = 'coordinates';
  readonly requiredPatches = undefined;

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi);
  }
}
