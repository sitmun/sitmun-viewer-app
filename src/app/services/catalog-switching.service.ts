import { Injectable } from '@angular/core';

import { AppCfg, AppTree } from '@api/model/app-cfg';

import { ConfigLookupService } from './config-lookup.service';
import { SitnaApiService } from './sitna-api.service';

/**
 * Service for managing layer catalog switching functionality.
 * TODO: Add unit tests (catalog-switching.service.spec.ts)
 *
 * Catalog state shape matches LayerCatalogsForModalState from types/sitna-globals.types.
 */

/**
 * Utility class for managing catalog switching functionality.
 * Handles global state, UI injection, event handling, and catalog switching logic.
 */
@Injectable({
  providedIn: 'root'
})
export class CatalogSwitchingService {
  private pendingSelectedTreeId: string | null = null;

  constructor(private readonly sitnaApi: SitnaApiService) {}

  /**
   * Setup global state for catalog switching.
   * Builds catalogs array from trees and sets up window.layerCatalogsForModal.
   * Uses tree ID as the catalog identifier (not index or root node ID).
   *
   * Logic:
   * - If 1 tree: use that tree's ID as currentTreeId
   * - If multiple trees: check global state for existing currentTreeId, validate it exists, fallback to first tree if not
   */
  setupGlobalState(
    rootNodeIds: string[],
    configLookup: ConfigLookupService
  ): void {
    // Get actual trees from rootNodeIds
    const trees = rootNodeIds
      .map((nodeId) => configLookup.findTreeContainingNode(nodeId))
      .filter((tree): tree is AppTree => tree !== undefined);

    if (trees.length === 0) {
      console.warn('[CatalogSwitching] No trees found for catalog setup');
      return;
    }

    // Build catalogs array from trees - use tree ID as identifier
    const catalogs = trees.map((tree) => ({
      id: tree.id,
      catalog: tree.title
    }));

    // Determine current tree ID based on tree count
    let currentTreeId: string;

    if (trees.length === 1) {
      // Single tree: always use its ID
      currentTreeId = trees[0].id;
    } else {
      // Multiple trees: check for existing selection in global state
      const existingModal = this.sitnaApi.getGlobal('layerCatalogsForModal');
      const existingTreeId = existingModal?.currentTreeId;

      // Validate existing tree ID exists in available trees (string compare for API number/string)
      if (
        existingTreeId &&
        trees.some((tree) => String(tree.id) === String(existingTreeId))
      ) {
        currentTreeId = existingTreeId;
      } else {
        // Fallback to the first tree
        currentTreeId = trees[0].id;
      }
    }

    this.sitnaApi.setGlobal('layerCatalogsForModal', {
      currentTreeId: currentTreeId,
      catalogs: catalogs,
      rootNodeIds: rootNodeIds
    });
  }

  /**
   * Get current selected tree ID from global state.
   */
  getCurrentTreeId(): string | undefined {
    return this.sitnaApi.getGlobal('layerCatalogsForModal')?.currentTreeId;
  }

  /**
   * Get root node ID of currently selected tree.
   * Returns null if no tree is selected or tree not found.
   */
  getSelectedTreeRootNode(context: AppCfg): string | null {
    const currentTreeId = this.getCurrentTreeId();
    if (!currentTreeId) {
      return null;
    }

    const selectedTree = context.trees.find(
      (tree: AppTree) => String(tree.id) === String(currentTreeId)
    );
    return selectedTree ? selectedTree.rootNode : null;
  }

  /**
   * Get tooltip text for the changeTopic button showing current topic.
   */
  getCurrentTopicTooltip(): string {
    const layerCatalogsForModal = this.sitnaApi.getGlobal(
      'layerCatalogsForModal'
    );
    if (
      !layerCatalogsForModal ||
      !layerCatalogsForModal.catalogs ||
      layerCatalogsForModal.catalogs.length === 0
    ) {
      return 'Change topic organization';
    }

    const currentTreeId = layerCatalogsForModal.currentTreeId;
    const currentCatalogInfo = layerCatalogsForModal.catalogs.find(
      (c: any) => c.id === currentTreeId
    );
    const currentTopicName = currentCatalogInfo?.catalog || 'Unknown topic';

    return `Current topic: ${currentTopicName}`;
  }

  /**
   * Update the changeTopic button tooltip with current topic name.
   */
  updateChangeTopicButtonTooltip(): void {
    const changeCatalogButton = document.querySelector(
      '#change-catalog-sitmun'
    ) as HTMLElement;
    if (changeCatalogButton) {
      const tooltip = this.getCurrentTopicTooltip();
      changeCatalogButton.setAttribute('title', tooltip);
    }
  }

  /**
   * Handle catalog switching.
   * Updates the current catalog and triggers control rebuild.
   * @param selectedTreeId - The tree ID of the selected catalog
   */
  switchCatalog(selectedTreeId: string): void {
    const layerCatalogsForModal = this.sitnaApi.getGlobal(
      'layerCatalogsForModal'
    );
    if (!layerCatalogsForModal) {
      console.warn(
        '[CatalogSwitching] layerCatalogsForModal not found, cannot switch catalog'
      );
      return;
    }

    if (selectedTreeId === layerCatalogsForModal.currentTreeId) {
      return;
    }

    // Update current tree ID BEFORE calling updateCatalog
    // This ensures the value is set when buildConfiguration is called again
    layerCatalogsForModal.currentTreeId = selectedTreeId;

    // Update button tooltip immediately
    this.updateChangeTopicButtonTooltip();

    const abstractMapObject = this.sitnaApi.getGlobal('abstractMapObject');
    if (
      abstractMapObject &&
      typeof abstractMapObject.updateCatalog === 'function'
    ) {
      abstractMapObject.updateCatalog();
    } else {
      console.warn(
        '[CatalogSwitching] abstractMapObject.updateCatalog not available, catalog switch may require manual reload'
      );
    }
  }

  /**
   * Inject catalog switching button into control header.
   * This is called from the renderData patch.
   */
  injectCatalogSwitchingButton(control: any, handler: any): void {
    const layerCatalogsForModal = this.sitnaApi.getGlobal(
      'layerCatalogsForModal'
    );

    // Only inject if multiple catalogs exist
    if (
      !layerCatalogsForModal ||
      !layerCatalogsForModal.catalogs ||
      layerCatalogsForModal.catalogs.length <= 1
    ) {
      return;
    }

    if (!control.div) {
      return;
    }

    // Find h2 element
    const h2Element = control.div.querySelector('h2');
    if (!h2Element) {
      console.warn(
        '[CatalogSwitching] h2 element not found, cannot inject catalog switching button'
      );
      return;
    }

    // Check if button already exists (avoid duplicates)
    if (control.div.querySelector('#change-catalog-sitmun')) {
      console.warn(
        '[CatalogSwitching] catalog switching button already exists, cannot inject catalog switching button'
      );
      return;
    }

    // Create catalog switching button
    const changeCatalogButton = document.createElement('button');
    changeCatalogButton.id = 'change-catalog-sitmun';
    changeCatalogButton.className = 'tc-button tc-ctl-lcat-btn-change-topic';

    // Set tooltip with current topic name
    const currentTopicTooltip = this.getCurrentTopicTooltip();
    changeCatalogButton.setAttribute('title', currentTopicTooltip);
    changeCatalogButton.textContent =
      control.getLocaleString('changeTopic') || 'Change topic';

    // Find first non-empty text node in h2 and insert button after it
    let insertAfterNode: Node | null = null;
    for (let i = 0; i < h2Element.childNodes.length; i++) {
      const node = h2Element.childNodes[i];
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        insertAfterNode = node;
        break;
      }
    }

    if (insertAfterNode) {
      // Insert after the text node
      if (insertAfterNode.nextSibling) {
        h2Element.insertBefore(
          changeCatalogButton,
          insertAfterNode.nextSibling
        );
      } else {
        h2Element.appendChild(changeCatalogButton);
      }
    } else {
      // Fallback: insert at beginning if no text node found
      h2Element.insertBefore(changeCatalogButton, h2Element.firstChild);
    }

    // Create projects panel if it doesn't exist
    let projectsPanel = document.querySelector(
      '#catalog-projects'
    ) as HTMLElement;
    if (!projectsPanel) {
      projectsPanel = document.createElement('div');
      projectsPanel.id = 'catalog-projects';
      projectsPanel.className = 'tc-ctl-lcat-proj tc-hidden';

      // Append to body for proper fixed positioning (modal overlay)
      // Fixed positioning works better when element is direct child of body
      document.body.appendChild(projectsPanel);
    }

    // Always attach handlers so the (possibly new) button gets its click listener after map reload.
    // Panel delegation is attached only once to avoid stacking (see attachCatalogSwitchingHandlers).
    this.attachCatalogSwitchingHandlers(
      control,
      changeCatalogButton,
      projectsPanel,
      handler.sitnaApi
    );

    // Update tooltip after button is created (in case catalog was already selected)
    this.updateChangeTopicButtonTooltip();
  }

  /**
   * Attach event handlers for catalog switching.
   * This is called after the button is injected to ensure handlers are attached to existing elements.
   */
  attachCatalogSwitchingHandlers(
    control: any,
    changeCatalogButton: HTMLElement,
    projectsPanel: HTMLElement,
    sitnaApi: SitnaApiService
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const service = this;
    const TC = sitnaApi.getTC();
    const layerCatalogsForModal = this.sitnaApi.getGlobal(
      'layerCatalogsForModal'
    );

    if (
      !layerCatalogsForModal ||
      !layerCatalogsForModal.catalogs ||
      layerCatalogsForModal.catalogs.length <= 1
    ) {
      return;
    }

    // Button click: always attach (button is recreated on map reload)
    changeCatalogButton.addEventListener('click', function (e: Event) {
      e.preventDefault();
      e.stopPropagation();

      // Toggle projects panel
      projectsPanel.classList.toggle(TC.Consts.classes.HIDDEN);

      // Render projects template if panel is being shown and not yet rendered
      if (
        !projectsPanel.classList.contains(TC.Consts.classes.HIDDEN) &&
        !projectsPanel.querySelector('.tc-ctl-lcat-proj-content')
      ) {
        service.renderProjectsPanel(control, projectsPanel);
      }
    });

    // Panel delegation: attach only once (panel persists across map reloads; avoid stacking)
    if ((projectsPanel as any).__delegationAttached) {
      return;
    }
    (projectsPanel as any).__delegationAttached = true;

    projectsPanel.addEventListener('click', function (e: Event) {
      const target = e.target as HTMLElement;

      // Check if click is on catalog item first (before checking buttons)
      // This ensures catalog selection works even if clicking on label or other child elements
      const catalogElement = target.closest(
        '.tc-ctl-lcat-proj-catalog'
      ) as HTMLElement;
      if (catalogElement) {
        // Don't process if clicking on buttons inside the catalog item
        if (target.closest('button')) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        // Remove selection from previously selected item
        const selected = projectsPanel.querySelector(
          '.tc-ctl-lcat-proj-selected'
        );
        if (selected && selected !== catalogElement) {
          selected.classList.remove('tc-ctl-lcat-proj-selected');
        }

        // Add selection to clicked item
        catalogElement.classList.add('tc-ctl-lcat-proj-selected');

        // Store pending selection (source of truth for Accept)
        const catalogIdInput = catalogElement.querySelector(
          '.tc-ctl-lcat-proj-catalog-id'
        ) as HTMLInputElement;
        service.pendingSelectedTreeId = catalogIdInput?.value ?? null;
        return;
      }

      // Close button
      if (
        target.classList.contains('tc-modal-close') ||
        target.closest('.tc-modal-close')
      ) {
        e.preventDefault();
        e.stopPropagation();
        service.pendingSelectedTreeId = null;
        projectsPanel.classList.add(TC.Consts.classes.HIDDEN);
        return;
      }

      // Accept button
      if (
        target.classList.contains('tc-ctl-lcat-proj-accept') ||
        target.closest('.tc-ctl-lcat-proj-accept')
      ) {
        e.preventDefault();
        e.stopPropagation();
        const treeId = service.pendingSelectedTreeId;
        if (treeId != null) {
          // switchCatalog reads layerCatalogsForModal fresh from global state
          // and skips if the selected tree is already current
          service.switchCatalog(treeId);
        }
        service.pendingSelectedTreeId = null;
        projectsPanel.classList.add(TC.Consts.classes.HIDDEN);
        return;
      }

      // Cancel button
      if (
        target.classList.contains('tc-ctl-lcat-proj-cancel') ||
        target.closest('.tc-ctl-lcat-proj-cancel')
      ) {
        e.preventDefault();
        e.stopPropagation();
        service.pendingSelectedTreeId = null;
        projectsPanel.classList.add(TC.Consts.classes.HIDDEN);
        return;
      }
    });
  }

  /**
   * Render the projects panel with catalog list.
   */
  renderProjectsPanel(control: any, projectsPanel: Element): void {
    const layerCatalogsForModal = this.sitnaApi.getGlobal(
      'layerCatalogsForModal'
    );
    if (!layerCatalogsForModal || !layerCatalogsForModal.catalogs) {
      return;
    }

    // Load and render the projects template
    const templateKey = control.CLASS + '-proj';
    control
      .getRenderedHtml(templateKey, {
        catalogs: layerCatalogsForModal.catalogs,
        title: 'Catalog Selection'
      })
      .then((html: string) => {
        const template = document.createElement('template');
        template.innerHTML = html;
        const content = template.content || (template as any);
        projectsPanel.innerHTML = '';
        projectsPanel.appendChild(content.cloneNode(true));

        // Mark current catalog as selected (by tree ID)
        const currentTreeId = layerCatalogsForModal.currentTreeId;
        const catalogItems = projectsPanel.querySelectorAll(
          '.tc-ctl-lcat-proj-catalog'
        );
        catalogItems.forEach((item: Element) => {
          const catalogIdInput = item.querySelector(
            '.tc-ctl-lcat-proj-catalog-id'
          ) as HTMLInputElement;
          if (catalogIdInput && catalogIdInput.value === currentTreeId) {
            item.classList.add('tc-ctl-lcat-proj-selected');
          }
        });

        this.pendingSelectedTreeId = String(
          layerCatalogsForModal.currentTreeId
        );
      })
      .catch((error: any) => {
        console.error(
          '[CatalogSwitching] Error rendering projects panel:',
          error
        );
      });
  }
}
