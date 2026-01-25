import { Injectable } from '@angular/core';

import { SitnaApiService } from '../../services/sitna-api.service';
import { ControlHandlerBase } from '../control-handler-base';

/**
 * Handler for the native SITNA WFSEdit control.
 * Allows users to edit WFS layer features (create, modify, delete).
 *
 * Control Type: sitna.WFSEdit
 * Patches: None (native SITNA control)
 * Configuration: div + optional parameters
 *
 * Supported options (from SITNA 4.8):
 * - div?: HTMLElement | string - Element to create the control in
 * - downloadElevation?: ElevationOptions | boolean - Enable elevation download (default: false)
 * - highlightChanges?: boolean - Highlight modified features (default: true)
 * - showOriginalFeatures?: boolean - Show original features alongside modified (default: false)
 * - snapping?: boolean - Enable vertex snapping during editing (default: true)
 * - styles?: StyleOptions - Style options for edited features by geometry type
 */
@Injectable({
  providedIn: 'root'
})
export class WFSEditControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.WFSEdit';
  readonly sitnaConfigKey = 'WFSEdit';
  readonly requiredPatches = undefined; // No patches needed

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi);
  }
}
