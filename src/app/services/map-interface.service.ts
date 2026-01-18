import { Injectable } from '@angular/core';

import { DomUtilsService } from './dom-utils.service';
import { UIStateService } from './ui-state.service';

/**
 * Service for managing map UI interface visibility.
 *
 * Replaces SitnaHelper.toInterface() static method.
 * Hides/shows UI tabs based on enabled control buttons.
 * TODO: Add unit tests (map-interface.service.spec.ts)
 */
@Injectable({
  providedIn: 'root'
})
export class MapInterfaceService {
  constructor(
    private uiState: UIStateService,
    private domUtils: DomUtilsService
  ) {}

  /**
   * Update UI interface visibility based on enabled controls.
   * Hides tabs for controls that are not enabled.
   *
   * This method should be called after the map is loaded.
   */
  updateInterface(): void {
    if (!this.uiState.isLegendButtonEnabled()) {
      this.domUtils.hideElementById('legend-tab');
    }
    if (!this.uiState.isOverviewMapButtonEnabled()) {
      this.domUtils.hideElementById('ovmap-tab');
    }
    if (!this.uiState.isToolsButtonEnabled()) {
      this.domUtils.hideElementById('silme-tab');
    }
  }
}
