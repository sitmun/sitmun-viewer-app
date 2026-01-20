import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { TCNamespaceService } from '../../services/tc-namespace.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

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

  constructor(tcNamespaceService: TCNamespaceService) {
    super(tcNamespaceService);
  }

  /**
   * Build configuration for WFSEdit control.
   * Merges default div with task parameters, passing through all WFSEdit options.
   */
  buildConfiguration(
    task: AppTasks,
    _context: AppCfg
  ): SitnaControlConfig | null {
    const defaultConfig = this.getDefaultConfig();
    return this.mergeWithParameters(defaultConfig, task.parameters);
  }

  /**
   * Native control is always ready (no patches to load).
   */
  override isReady(): boolean {
    return true;
  }
}
