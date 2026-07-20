import { Injectable } from '@angular/core';

import { AppCfg, AppTree } from '@api/model/app-cfg';

import { ConfigLookupService } from './config-lookup.service';
import { SitnaApiService } from './sitna-api.service';

/**
 * Service for managing layer catalog switching functionality.
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
   * - Trees are sorted by association order ASC (missing order → 0)
   * - If 1 tree: use that tree's ID as currentTreeId
   * - If multiple trees: keep existing currentTreeId when still valid, else lowest-order tree
   */
  setupGlobalState(
    rootNodeIds: string[],
    configLookup: ConfigLookupService
  ): void {
    const trees = rootNodeIds
      .map((nodeId) => configLookup.findTreeContainingNode(nodeId))
      .filter((tree): tree is AppTree => tree !== undefined)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    if (trees.length === 0) {
      console.warn('[CatalogSwitching] No trees found for catalog setup');
      return;
    }

    const catalogs = trees.map((tree) => ({
      id: tree.id,
      catalog: tree.title
    }));

    let currentTreeId: string;

    if (trees.length === 1) {
      currentTreeId = trees[0].id;
    } else {
      const existingModal = this.sitnaApi.getGlobal('layerCatalogsForModal');
      const existingTreeId = existingModal?.currentTreeId;

      if (
        existingTreeId &&
        trees.some((tree) => String(tree.id) === String(existingTreeId))
      ) {
        currentTreeId = existingTreeId;
      } else {
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

  getCurrentTopicTitle(): string {
    const layerCatalogsForModal = this.sitnaApi.getGlobal(
      'layerCatalogsForModal'
    );
    if (
      !layerCatalogsForModal?.catalogs ||
      layerCatalogsForModal.catalogs.length === 0
    ) {
      return '';
    }

    const currentTreeId = layerCatalogsForModal.currentTreeId;
    const currentCatalogInfo = layerCatalogsForModal.catalogs.find(
      (c: { id: string }) => String(c.id) === String(currentTreeId)
    );
    return currentCatalogInfo?.catalog ?? '';
  }

  /**
   * Localized tooltip for the change-topic button (falls back without control).
   */
  getCurrentTopicTooltip(control?: { getLocaleString?: (key: string) => string }): string {
    const title = this.getCurrentTopicTitle();
    if (!title) {
      return this.resolveLocaleString(control, 'changeTopic', 'Change topic');
    }

    const template = this.resolveLocaleString(
      control,
      'currentTopic',
      'Current topic: {title}'
    );
    return template.replace(/\{title\}/g, title);
  }

  /** Prefer SITNA locale; ignore unresolved keys echoed back as the key itself. */
  private resolveLocaleString(
    control: { getLocaleString?: (key: string) => string } | undefined,
    key: string,
    fallback: string
  ): string {
    const value = control?.getLocaleString?.(key);
    if (!value || value === key) {
      return fallback;
    }
    return value;
  }

  /**
   * Update the changeTopic button tooltip with the current topic name.
   */
  updateChangeTopicButtonTooltip(control?: {
    div?: ParentNode;
    getLocaleString?: (key: string) => string;
  }): void {
    const root = control?.div ?? document;
    const changeCatalogButton = root.querySelector(
      '#change-catalog-sitmun'
    ) as HTMLElement | null;
    if (changeCatalogButton) {
      const tooltip = this.getCurrentTopicTooltip(control);
      changeCatalogButton.setAttribute('title', tooltip);
      changeCatalogButton.setAttribute('aria-label', tooltip);
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

    if (String(selectedTreeId) === String(layerCatalogsForModal.currentTreeId)) {
      return;
    }

    layerCatalogsForModal.currentTreeId = selectedTreeId;

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
   * Current tree name is exposed via button title / aria-label (no header badge).
   * This is called from the renderData patch.
   */
  injectCatalogSwitchingButton(control: any, handler: any): void {
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

    if (!control.div) {
      return;
    }

    const h2Element = control.div.querySelector('h2');
    if (!h2Element) {
      console.warn(
        '[CatalogSwitching] h2 element not found, cannot inject catalog switching button'
      );
      return;
    }

    this.removeTopicBadge(h2Element);

    const existingButton = control.div.querySelector(
      '#change-catalog-sitmun'
    ) as HTMLElement | null;
    if (existingButton) {
      this.normalizeChangeTopicButton(existingButton);
      this.updateChangeTopicButtonTooltip(control);
      return;
    }

    const changeCatalogButton = document.createElement('button');
    changeCatalogButton.type = 'button';
    changeCatalogButton.id = 'change-catalog-sitmun';
    this.normalizeChangeTopicButton(changeCatalogButton);

    const currentTopicTooltip = this.getCurrentTopicTooltip(control);
    changeCatalogButton.setAttribute('title', currentTopicTooltip);
    changeCatalogButton.setAttribute('aria-label', currentTopicTooltip);

    this.insertAfterTitleText(h2Element, changeCatalogButton);

    let projectsPanel = document.querySelector(
      '#catalog-projects'
    ) as HTMLElement;
    if (!projectsPanel) {
      projectsPanel = document.createElement('div');
      projectsPanel.id = 'catalog-projects';
      projectsPanel.className = 'tc-ctl-lcat-proj tc-hidden';
      document.body.appendChild(projectsPanel);
    }

    this.attachCatalogSwitchingHandlers(
      control,
      changeCatalogButton,
      projectsPanel,
      handler.sitnaApi
    );

    this.updateChangeTopicButtonTooltip(control);
  }

  /** Icon-only toolbar control; never reuse search/tc-button chrome or visible label text. */
  private normalizeChangeTopicButton(button: HTMLElement): void {
    button.classList.add('tc-ctl-lcat-btn-change-topic');
    button.classList.remove('tc-button', 'tc-ctl-lcat-btn-search');
    // Inline SVG with explicit stroke (not currentColor) so stale `color:transparent` CSS cannot hide it.
    button.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" ' +
      'stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true" focusable="false">' +
      '<polyline points="16 3 21 3 21 8"/>' +
      '<line x1="4" y1="20" x2="21" y2="3"/>' +
      '<polyline points="21 16 21 21 16 21"/>' +
      '<line x1="15" y1="15" x2="3" y2="3"/>' +
      '</svg>';
  }

  private removeTopicBadge(h2Element: HTMLElement): void {
    h2Element
      .querySelectorAll('[data-sitmun-lcat-topic], .tc-ctl-lcat-topic')
      .forEach((badge) => badge.remove());
  }

  private insertAfterTitleText(
    h2Element: HTMLElement,
    element: HTMLElement
  ): void {
    let insertAfterNode: Node | null = null;
    for (let i = 0; i < h2Element.childNodes.length; i++) {
      const node = h2Element.childNodes[i];
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        insertAfterNode = node;
        break;
      }
    }

    if (insertAfterNode) {
      if (insertAfterNode.nextSibling) {
        h2Element.insertBefore(element, insertAfterNode.nextSibling);
      } else {
        h2Element.appendChild(element);
      }
    } else {
      h2Element.insertBefore(element, h2Element.firstChild);
    }
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

    changeCatalogButton.addEventListener('click', function (e: Event) {
      e.preventDefault();
      e.stopPropagation();

      projectsPanel.classList.toggle(TC.Consts.classes.HIDDEN);

      if (
        !projectsPanel.classList.contains(TC.Consts.classes.HIDDEN) &&
        !projectsPanel.querySelector('.tc-ctl-lcat-proj-content')
      ) {
        service.renderProjectsPanel(control, projectsPanel);
      }
    });

    if ((projectsPanel as any).__delegationAttached) {
      return;
    }
    (projectsPanel as any).__delegationAttached = true;

    projectsPanel.addEventListener('click', function (e: Event) {
      const target = e.target as HTMLElement;

      const catalogElement = target.closest(
        '.tc-ctl-lcat-proj-catalog'
      ) as HTMLElement;
      if (catalogElement) {
        if (target.closest('button')) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        const selected = projectsPanel.querySelector(
          '.tc-ctl-lcat-proj-selected'
        );
        if (selected && selected !== catalogElement) {
          selected.classList.remove('tc-ctl-lcat-proj-selected');
        }

        catalogElement.classList.add('tc-ctl-lcat-proj-selected');

        const catalogIdInput = catalogElement.querySelector(
          '.tc-ctl-lcat-proj-catalog-id'
        ) as HTMLInputElement;
        service.pendingSelectedTreeId = catalogIdInput?.value ?? null;
        return;
      }

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

      if (
        target.classList.contains('tc-ctl-lcat-proj-accept') ||
        target.closest('.tc-ctl-lcat-proj-accept')
      ) {
        e.preventDefault();
        e.stopPropagation();
        const treeId = service.pendingSelectedTreeId;
        if (treeId != null) {
          service.switchCatalog(treeId);
        }
        service.pendingSelectedTreeId = null;
        projectsPanel.classList.add(TC.Consts.classes.HIDDEN);
        return;
      }

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

        const currentTreeId = layerCatalogsForModal.currentTreeId;
        const catalogItems = projectsPanel.querySelectorAll(
          '.tc-ctl-lcat-proj-catalog'
        );
        catalogItems.forEach((item: Element) => {
          const catalogIdInput = item.querySelector(
            '.tc-ctl-lcat-proj-catalog-id'
          ) as HTMLInputElement;
          if (
            catalogIdInput &&
            String(catalogIdInput.value) === String(currentTreeId)
          ) {
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
