import { Injectable } from '@angular/core';

import {
  attachToolsPanelSplitter,
  type ToolsPanelSplitterHandles
} from '../utils/tools-panel-splitter';

/**
 * Mounts the Capas / Capas disponibles drag splitter in the tools panel.
 */
@Injectable({
  providedIn: 'root'
})
export class ToolsPanelSplitterService {
  private handles: ToolsPanelSplitterHandles | null = null;

  mount(root: ParentNode = document): void {
    this.unmount();
    this.handles = attachToolsPanelSplitter(root);
  }

  unmount(): void {
    this.handles?.dispose();
    this.handles = null;
  }
}
