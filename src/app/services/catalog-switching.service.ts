import { Injectable } from '@angular/core';
import { AppCfg, AppTree } from '@api/model/app-cfg';
import { ConfigLookupService } from './config-lookup.service';
import { TCNamespaceService } from './tc-namespace.service';

/**
 * Service for managing layer catalog switching functionality.
 * TODO: Add unit tests (catalog-switching.service.spec.ts)
 *
 * Global state interface for catalog switching modal.
 */
interface LayerCatalogsForModal {
  currentTreeId: string;
  catalogs: Array<{ id: string; catalog: string }>;
  rootNodeIds: string[];
}

/**
 * Utility class for managing catalog switching functionality.
 * Handles global state, UI injection, event handling, and catalog switching logic.
 */
@Injectable({
  providedIn: 'root'
})
export class CatalogSwitchingService {
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
      const existingModal = this.getGlobalState();
      const existingTreeId = existingModal?.currentTreeId;

      // Validate existing tree ID exists in available trees
      if (existingTreeId && trees.some((tree) => tree.id === existingTreeId)) {
        currentTreeId = existingTreeId;
      } else {
        // Fallback to the first tree
        currentTreeId = trees[0].id;
      }
    }

    // Set global variable for modal (expected by catalog switching patches)
    this.setGlobalState({
      currentTreeId: currentTreeId,
      catalogs: catalogs,
      rootNodeIds: rootNodeIds
    });
  }

  /**
   * Get current selected tree ID from global state.
   */
  getCurrentTreeId(): string | undefined {
    return this.getGlobalState()?.currentTreeId;
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
      (tree: AppTree) => tree.id === currentTreeId
    );
    return selectedTree ? selectedTree.rootNode : null;
  }

  /**
   * Get tooltip text for the changeTopic button showing current topic.
   */
  getCurrentTopicTooltip(): string {
    const layerCatalogsForModal = this.getGlobalState();
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
    const layerCatalogsForModal = this.getGlobalState();
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

    // Trigger catalog update via AbstractMapComponent if available
    const abstractMapObject = (window as any).abstractMapObject;
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
    const layerCatalogsForModal = this.getGlobalState();

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

    // Attach event handlers immediately after injecting button
    // Check if handlers already added (avoid duplicates)
    if (!(changeCatalogButton as any).__catalogSwitchingHandlersAdded) {
      this.attachCatalogSwitchingHandlers(
        control,
        changeCatalogButton,
        projectsPanel,
        handler.tcNamespaceService
      );
      (changeCatalogButton as any).__catalogSwitchingHandlersAdded = true;
    }

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
    tcNamespaceService: TCNamespaceService
  ): void {
    const service = this;
    const TC = tcNamespaceService.getTC();
    const layerCatalogsForModal = this.getGlobalState();

    if (
      !layerCatalogsForModal ||
      !layerCatalogsForModal.catalogs ||
      layerCatalogsForModal.catalogs.length <= 1
    ) {
      return;
    }

    // Click handler for catalog switching button
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

    // Use event delegation for panel buttons (they may not exist until template is rendered)
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
        return;
      }

      // Close button
      if (
        target.classList.contains('tc-modal-close') ||
        target.closest('.tc-modal-close')
      ) {
        e.preventDefault();
        e.stopPropagation();
        projectsPanel.classList.add(TC.Consts.classes.HIDDEN);
        projectsPanel
          .querySelectorAll('.tc-ctl-lcat-proj-selected')
          .forEach((item: Element) => {
            item.classList.remove('tc-ctl-lcat-proj-selected');
          });
        return;
      }

      // Accept button
      if (
        target.classList.contains('tc-ctl-lcat-proj-accept') ||
        target.closest('.tc-ctl-lcat-proj-accept')
      ) {
        e.preventDefault();
        e.stopPropagation();
        const selectedProject = projectsPanel.querySelector(
          '.tc-ctl-lcat-proj-selected'
        );
        if (selectedProject) {
          const catalogIdInput = selectedProject.querySelector(
            '.tc-ctl-lcat-proj-catalog-id'
          ) as HTMLInputElement;
          if (catalogIdInput) {
            const treeId = catalogIdInput.value; // Tree ID is stored as string
            if (treeId !== layerCatalogsForModal.currentTreeId) {
              service.switchCatalog(treeId);
            }
          }
        }
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
        projectsPanel.classList.add(TC.Consts.classes.HIDDEN);
        projectsPanel
          .querySelectorAll('.tc-ctl-lcat-proj-selected')
          .forEach((item: Element) => {
            item.classList.remove('tc-ctl-lcat-proj-selected');
          });
        return;
      }
    });
  }

  /**
   * Render the projects panel with catalog list.
   */
  renderProjectsPanel(control: any, projectsPanel: Element): void {
    const layerCatalogsForModal = this.getGlobalState();
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

        // Re-attach event handlers for newly rendered elements
        const closeButton = projectsPanel.querySelector('.tc-modal-close');
        const acceptButton = projectsPanel.querySelector(
          '.tc-ctl-lcat-proj-accept'
        );
        const cancelButton = projectsPanel.querySelector(
          '.tc-ctl-lcat-proj-cancel'
        );
        const catalogItemsNew = projectsPanel.querySelectorAll(
          '.tc-ctl-lcat-proj-catalog'
        );

        const service = this;

        if (closeButton) {
          closeButton.addEventListener('click', function () {
            projectsPanel.classList.add('tc-hidden');
            projectsPanel
              .querySelectorAll('.tc-ctl-lcat-proj-selected')
              .forEach((item: Element) => {
                item.classList.remove('tc-ctl-lcat-proj-selected');
              });
          });
        }

        if (acceptButton) {
          acceptButton.addEventListener('click', () => {
            const selectedProject = projectsPanel.querySelector(
              '.tc-ctl-lcat-proj-selected'
            );
            if (selectedProject) {
              const catalogIdInput = selectedProject.querySelector(
                '.tc-ctl-lcat-proj-catalog-id'
              ) as HTMLInputElement;
              if (catalogIdInput) {
                const treeId = catalogIdInput.value; // Tree ID is stored as string
                if (treeId !== layerCatalogsForModal.currentTreeId) {
                  service.switchCatalog(treeId);
                }
              }
            }
            projectsPanel.classList.add('tc-hidden');
          });
        }

        if (cancelButton) {
          cancelButton.addEventListener('click', function () {
            projectsPanel.classList.add('tc-hidden');
            projectsPanel
              .querySelectorAll('.tc-ctl-lcat-proj-selected')
              .forEach((item: Element) => {
                item.classList.remove('tc-ctl-lcat-proj-selected');
              });
          });
        }

        catalogItemsNew.forEach((catalogElement: Element) => {
          catalogElement.addEventListener('click', function (e: Event) {
            e.preventDefault();
            e.stopPropagation();

            const selected = projectsPanel.querySelector(
              '.tc-ctl-lcat-proj-selected'
            );
            if (selected && selected !== catalogElement) {
              selected.classList.remove('tc-ctl-lcat-proj-selected');
            }
            catalogElement.classList.add('tc-ctl-lcat-proj-selected');
          });
        });
      })
      .catch((error: any) => {
        console.error(
          '[CatalogSwitching] Error rendering projects panel:',
          error
        );
      });
  }

  /**
   * Get global state object.
   */
  private getGlobalState(): LayerCatalogsForModal | undefined {
    return (window as any).layerCatalogsForModal;
  }

  /**
   * Set global state object.
   */
  private setGlobalState(state: LayerCatalogsForModal): void {
    (window as any).layerCatalogsForModal = state;
  }
}
