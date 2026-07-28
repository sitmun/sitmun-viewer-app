/** Persisted heights for tools-panel panes above a splitter (slot id → px). */
export const TOOLS_PANEL_PANE_HEIGHTS_KEY = 'sitmun.toolsPanel.paneHeights';

/** Legacy single Capas height (migrated into paneHeights). */
export const TOOLS_PANEL_WLM_HEIGHT_KEY = 'sitmun.toolsPanel.wlmHeightPx';

export const PANE_HEIGHT_MIN_PX = 48;
/**
 * Fallback Capas entry chrome (path + title + type + tools) when the LI is not
 * laid out yet. Matches CSS row budget (`5.5em` in custom-specific.css).
 * At runtime font-size ~12.8px this is ≈70–71px — one full work-layer row.
 */
export const WLM_ENTRY_EM = 5.5;
/** Capas list `ul` top+bottom margin (5px + 5px). */
export const WLM_LIST_MARGIN_PX = 10;
export const PANE_BELOW_MIN_PX = 80;
/** Measured collapsed tools-panel header (`h2`) height. */
export const COLLAPSED_HEADER_MIN_PX = 40;
/** Fallback Capas min at 16px root (h2 + one entry + list margins). */
export const WLM_HEIGHT_MIN_PX = Math.round(
  COLLAPSED_HEADER_MIN_PX + WLM_ENTRY_EM * 16 + WLM_LIST_MARGIN_PX
);
/** Keep Capas disponibles usable — do not let Capas drag crush it to a header strip. */
export const CATALOG_MIN_REMAINING_PX = 160;
export const SPLITTER_CLASS = 'sitmun-tools-panel-splitter';
export const PANE_RESIZED_CLASS = 'sitmun-pane-resized';
export const CAPAS_SLOT_ID = 'tc-slot-wlm';
export const CATALOG_SLOT_ID = 'tc-slot-toc';

export type PaneHeights = Record<string, number>;

/**
 * Capas entry chrome height: full `li.tc-ctl-wlm-elm` minus expanded details.
 * Path/title/type are siblings of `.tc-ctl-wlm-input` (tools only) — do not
 * measure input alone.
 */
function capasEntryChromeHeightPx(li: HTMLElement, fontSize: number): number {
  const liH = li.getBoundingClientRect().height;
  if (liH <= 0) {
    return WLM_ENTRY_EM * fontSize;
  }
  const info = li.querySelector('.tc-ctl-wlm-info') as HTMLElement | null;
  if (!info) {
    return liH;
  }
  const infoHidden =
    info.classList.contains('tc-hidden') ||
    window.getComputedStyle(info).display === 'none';
  if (infoHidden) {
    return liH;
  }
  const infoH = info.getBoundingClientRect().height;
  return Math.max(WLM_ENTRY_EM * fontSize * 0.5, liH - infoH);
}

/**
 * Height that shows the Capas header plus one work-layer entry chrome
 * (~71px list row at runtime). Used as the Capas drag floor and first-layer
 * open size. Expanded details scroll inside the pane.
 */
export function heightToShowFirstCapasEntry(capas: HTMLElement): number {
  const fontSize = parseFloat(window.getComputedStyle(capas).fontSize) || 16;
  const h2 = capas.querySelector(':scope > h2') as HTMLElement | null;
  const li = capas.querySelector('li.tc-ctl-wlm-elm') as HTMLElement | null;
  const headerH =
    h2 && h2.getBoundingClientRect().height > 0
      ? h2.getBoundingClientRect().height
      : COLLAPSED_HEADER_MIN_PX;
  const entryH = li
    ? capasEntryChromeHeightPx(li, fontSize)
    : WLM_ENTRY_EM * fontSize;
  return Math.round(headerH + entryH + WLM_LIST_MARGIN_PX);
}

export function minHeightForPane(pane: HTMLElement): number {
  return pane.classList.contains('tc-ctl-wlm')
    ? heightToShowFirstCapasEntry(pane)
    : PANE_HEIGHT_MIN_PX;
}

export function clampPaneHeight(
  requestedPx: number,
  panelContentHeightPx: number,
  options: { minPx: number; reserveBelowPx: number; splitterPx?: number }
): number {
  const splitterPx = options.splitterPx ?? 6;
  const maxPx = Math.max(
    options.minPx,
    panelContentHeightPx - options.reserveBelowPx - splitterPx
  );
  if (!Number.isFinite(requestedPx)) {
    return options.minPx;
  }
  return Math.min(maxPx, Math.max(options.minPx, Math.round(requestedPx)));
}

export function readPaneHeights(
  storage: Pick<Storage, 'getItem'> | null | undefined
): PaneHeights {
  if (!storage) {
    return {};
  }
  const out: PaneHeights = {};
  const raw = storage.getItem(TOOLS_PANEL_PANE_HEIGHTS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as PaneHeights;
      if (parsed && typeof parsed === 'object') {
        for (const [id, value] of Object.entries(parsed)) {
          if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
            out[id] = Math.round(value);
          }
        }
      }
    } catch {
      // ignore corrupt JSON
    }
  }
  // One-time migrate Capas-only key.
  if (out['tc-slot-wlm'] == null) {
    const legacy = storage.getItem(TOOLS_PANEL_WLM_HEIGHT_KEY);
    const value = legacy != null ? Number(legacy) : NaN;
    if (Number.isFinite(value) && value > 0) {
      out['tc-slot-wlm'] = Math.round(value);
    }
  }
  return out;
}

export function writePaneHeight(
  storage: Pick<Storage, 'getItem' | 'setItem'> | null | undefined,
  paneId: string,
  heightPx: number
): void {
  if (!storage || !paneId) {
    return;
  }
  const next = { ...readPaneHeights(storage), [paneId]: Math.round(heightPx) };
  storage.setItem(TOOLS_PANEL_PANE_HEIGHTS_KEY, JSON.stringify(next));
}

export function applyPaneHeight(pane: HTMLElement, heightPx: number): void {
  const rounded = Math.round(heightPx);
  pane.style.setProperty('--sitmun-pane-height', `${rounded}px`);
  pane.style.height = `${rounded}px`;
  pane.style.flex = '0 0 auto';
  pane.classList.add(PANE_RESIZED_CLASS);
}

export function clearPaneHeight(pane: HTMLElement): void {
  pane.style.removeProperty('--sitmun-pane-height');
  pane.style.removeProperty('height');
  pane.style.removeProperty('flex');
  pane.classList.remove(PANE_RESIZED_CLASS);
}

/** Mounted SITNA controls in the tools panel (slot hosts that became `.tc-ctl`). */
export function listLoadedToolsPanes(content: HTMLElement): HTMLElement[] {
  return Array.from(content.children).filter(
    (el): el is HTMLElement =>
      el instanceof HTMLElement &&
      el.classList.contains('tc-ctl') &&
      !el.classList.contains(SPLITTER_CLASS)
  );
}

/**
 * Expanded mounted controls (Capas + catalog are co-visible; other tools-panel
 * controls still use accordion). Used when restoring Capas height.
 */
export function listSplitToolsPanes(content: HTMLElement): HTMLElement[] {
  return listLoadedToolsPanes(content).filter(
    (el) => !el.classList.contains('tc-collapsed')
  );
}

function isCollapsedPane(pane: HTMLElement): boolean {
  return pane.classList.contains('tc-collapsed');
}

function reserveBelowPx(panesBelow: HTMLElement[]): number {
  return panesBelow.reduce((sum, pane) => {
    if (isCollapsedPane(pane)) {
      return sum + COLLAPSED_HEADER_MIN_PX;
    }
    if (
      pane.id === CATALOG_SLOT_ID ||
      pane.classList.contains('tc-ctl-lcat')
    ) {
      return sum + CATALOG_MIN_REMAINING_PX;
    }
    return sum + minHeightForPane(pane);
  }, 0);
}

/** Capas ↔ Capas disponibles pair (ignores BMS / xdata / other tools-panel slots). */
export function findCapasCatalogPair(
  content: HTMLElement
): { capas: HTMLElement; catalog: HTMLElement; belowPanes: HTMLElement[] } | null {
  const panes = listLoadedToolsPanes(content);
  const capasIdx = panes.findIndex(
    (el) => el.id === CAPAS_SLOT_ID || el.classList.contains('tc-ctl-wlm')
  );
  const catalogIdx = panes.findIndex(
    (el) => el.id === CATALOG_SLOT_ID || el.classList.contains('tc-ctl-lcat')
  );
  if (capasIdx < 0 || catalogIdx < 0 || catalogIdx <= capasIdx) {
    return null;
  }
  return {
    capas: panes[capasIdx]!,
    catalog: panes[catalogIdx]!,
    belowPanes: panes.slice(capasIdx + 1)
  };
}

/** Capas splitter is usable only while Capas is expanded. */
export function isCapasSplitterUsable(capas: HTMLElement): boolean {
  return !isCollapsedPane(capas);
}

/** True when Capas has at least one work-layer row (not the empty placeholder). */
export function capasHasLoadedLayers(capas: HTMLElement): boolean {
  return capas.querySelector('li.tc-ctl-wlm-elm') != null;
}

function createSplitter(above: HTMLElement, below: HTMLElement): HTMLElement {
  const splitter = document.createElement('div');
  splitter.className = SPLITTER_CLASS;
  splitter.setAttribute('role', 'separator');
  splitter.setAttribute('aria-orientation', 'horizontal');
  splitter.setAttribute('aria-controls', above.id || '');
  splitter.setAttribute(
    'aria-label',
    `Resize ${above.id || 'panel'} and ${below.id || 'panel below'}`
  );
  splitter.tabIndex = 0;
  splitter.dataset['sitmunSplitAbove'] = above.id;
  return splitter;
}

function wireSplitter(
  splitter: HTMLElement,
  above: HTMLElement,
  belowPanes: HTMLElement[],
  content: HTMLElement,
  panel: HTMLElement,
  storage: Pick<Storage, 'getItem' | 'setItem'> | null | undefined
): () => void {
  let dragging = false;
  let startY = 0;
  let startHeight = 0;

  const clamp = (requested: number) =>
    clampPaneHeight(requested, content.getBoundingClientRect().height, {
      minPx: minHeightForPane(above),
      reserveBelowPx: reserveBelowPx(belowPanes),
      splitterPx: splitter.getBoundingClientRect().height || 6
    });

  const onPointerMove = (event: PointerEvent) => {
    if (!dragging) {
      return;
    }
    const delta = event.clientY - startY;
    const next = clamp(startHeight + delta);
    applyPaneHeight(above, next);
    splitter.setAttribute('aria-valuenow', String(next));
  };

  const endDrag = (event: PointerEvent) => {
    if (!dragging) {
      return;
    }
    dragging = false;
    splitter.classList.remove('sitmun-tools-panel-splitter-active');
    try {
      splitter.releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }
    const height = above.getBoundingClientRect().height;
    writePaneHeight(storage, above.id, height);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
  };

  const onPointerDown = (event: PointerEvent) => {
    if (panel.classList.contains('tc-collapsed-right')) {
      return;
    }
    // Empty Capas must not be resized — that locks a white gap under the header.
    if (!capasHasLoadedLayers(above)) {
      return;
    }
    // Paired stack: Capas + catalog stay co-visible. Only expand Capas if the
    // user had collapsed its header; never collapse the catalog for drag.
    if (isCollapsedPane(above)) {
      above.classList.remove('tc-collapsed');
    }
    event.preventDefault();
    dragging = true;
    startY = event.clientY;
    startHeight = Math.max(
      above.getBoundingClientRect().height,
      minHeightForPane(above)
    );
    splitter.classList.add('sitmun-tools-panel-splitter-active');
    splitter.setPointerCapture(event.pointerId);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (panel.classList.contains('tc-collapsed-right')) {
      return;
    }
    if (isCollapsedPane(above)) {
      above.classList.remove('tc-collapsed');
    }
    const step = event.shiftKey ? 32 : 12;
    let requested: number | null = null;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      requested = above.getBoundingClientRect().height - step;
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      requested = above.getBoundingClientRect().height + step;
    } else if (event.key === 'Home') {
      requested = minHeightForPane(above);
    } else if (event.key === 'End') {
      requested = content.getBoundingClientRect().height;
    }
    if (requested == null) {
      return;
    }
    event.preventDefault();
    const next = clamp(requested);
    applyPaneHeight(above, next);
    writePaneHeight(storage, above.id, next);
    splitter.setAttribute('aria-valuenow', String(next));
  };

  splitter.addEventListener('pointerdown', onPointerDown);
  splitter.addEventListener('keydown', onKeyDown);

  return () => {
    dragging = false;
    splitter.removeEventListener('pointerdown', onPointerDown);
    splitter.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
    splitter.classList.remove('sitmun-tools-panel-splitter-active');
  };
}

export type ToolsPanelSplitterHandles = {
  /** Re-pair splitters (also runs on expand/collapse / resize). */
  sync: () => void;
  dispose: () => void;
};

/**
 * Insert a drag splitter between Capas (`#tc-slot-wlm`) and Capas disponibles
 * (`#tc-slot-toc`) whenever both controls are mounted.
 */
export function attachToolsPanelSplitter(
  root: ParentNode,
  storage: Pick<Storage, 'getItem' | 'setItem'> | null | undefined = typeof localStorage !==
  'undefined'
    ? localStorage
    : null
): ToolsPanelSplitterHandles | null {
  const panel = root.querySelector('.tc-tools-panel') as HTMLElement | null;
  const content = panel?.querySelector(':scope > .tc-panel-content') as HTMLElement | null;
  if (!panel || !content) {
    return null;
  }

  const disposers: Array<() => void> = [];
  let observer: MutationObserver | null = null;
  let capasObserver: MutationObserver | null = null;
  let scheduled = false;
  /** Tracks Capas empty→non-empty so the first loaded layer can open the pane. */
  let previousHasLayers = false;

  const tearDownSplitters = () => {
    for (const dispose of disposers.splice(0)) {
      dispose();
    }
    content.querySelectorAll(`.${SPLITTER_CLASS}`).forEach((el) => el.remove());
  };

  const observe = () => {
    observer?.observe(content, {
      childList: true,
      subtree: false,
      attributes: true,
      attributeFilter: ['class'],
      attributeOldValue: true
    });
  };

  const sync = () => {
    observer?.disconnect();
    try {
      tearDownSplitters();
      const panes = listLoadedToolsPanes(content);
      const pair = findCapasCatalogPair(content);

      // Only Capas is resized; clear heights on every other tools-panel slot.
      for (const pane of panes) {
        if (pane !== pair?.capas) {
          clearPaneHeight(pane);
        }
      }

      if (!pair) {
        previousHasLayers = false;
        panel.classList.remove('sitmun-tools-split-active');
        return;
      }

      const { capas, catalog, belowPanes } = pair;
      const hasLayers = capasHasLoadedLayers(capas);
      const firstLayerReveal = hasLayers && !previousHasLayers;
      // Capas starts collapsed; first work-layer row is display:none until open.
      // Opening on 0→1 makes the layer visible without requiring a splitter drag.
      let didAutoExpand = false;
      if (firstLayerReveal && isCollapsedPane(capas)) {
        capas.classList.remove('tc-collapsed');
        didAutoExpand = true;
      }
      previousHasLayers = hasLayers;

      const capasExpanded = isCapasSplitterUsable(capas);
      const stored = readPaneHeights(storage);
      const storedHeight = capas.id ? stored[capas.id] : undefined;
      // Always drop locked height when Capas is collapsed or empty (whitespace fix).
      if (!capasExpanded || !hasLayers) {
        clearPaneHeight(capas);
      }

      // No splitter until Capas has layers — dragging empty Capas created the gap.
      if (!hasLayers) {
        panel.classList.remove('sitmun-tools-split-active');
        return;
      }

      panel.classList.add('sitmun-tools-split-active');
      const splitter = createSplitter(capas, catalog);
      capas.after(splitter);

      // Always lock Capas while expanded with layers so detail expand scrolls
      // inside the pane instead of pushing the splitter.
      if (capasExpanded) {
        const minPx = minHeightForPane(capas);
        const contentH = content.getBoundingClientRect().height;
        const reserve = reserveBelowPx(belowPanes);
        let requested: number;
        if (storedHeight != null) {
          requested = storedHeight;
        } else if (didAutoExpand || firstLayerReveal) {
          // First work layer: open to one full entry chrome (LI minus details).
          requested = minPx;
        } else if (capas.classList.contains(PANE_RESIZED_CLASS)) {
          requested = capas.getBoundingClientRect().height || minPx;
        } else {
          // Freeze current layout (or first-row floor) so content growth cannot
          // drive the pane; do not persist until the user drags.
          requested = Math.max(capas.getBoundingClientRect().height || 0, minPx);
        }
        const next = clampPaneHeight(requested, contentH, {
          minPx,
          reserveBelowPx: reserve,
          splitterPx: 6
        });
        applyPaneHeight(capas, next);
        splitter.setAttribute('aria-valuenow', String(next));
      }

      disposers.push(
        wireSplitter(splitter, capas, belowPanes, content, panel, storage)
      );
    } finally {
      observe();
      capasObserver?.disconnect();
      capasObserver = null;
      const capasEl = findCapasCatalogPair(content)?.capas;
      if (capasEl) {
        capasObserver = new MutationObserver(() => scheduleSync());
        capasObserver.observe(capasEl, { childList: true, subtree: true });
      }
    }
  };

  const scheduleSync = () => {
    if (scheduled) {
      return;
    }
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      sync();
    });
  };

  const hasClassToken = (className: string, token: string): boolean =>
    className.split(/\s+/).filter(Boolean).includes(token);

  /** Ignore our own resize class / splitter DOM so drag is not torn down mid-gesture. */
  const onMutations = (mutations: MutationRecord[]) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        const nodes = [
          ...Array.from(mutation.addedNodes),
          ...Array.from(mutation.removedNodes)
        ];
        if (
          nodes.some(
            (node) =>
              node instanceof HTMLElement &&
              node.classList.contains('tc-ctl') &&
              !node.classList.contains(SPLITTER_CLASS)
          )
        ) {
          scheduleSync();
          return;
        }
        continue;
      }
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const el = mutation.target;
        if (!(el instanceof HTMLElement)) {
          continue;
        }
        const prev = mutation.oldValue ?? '';
        const next = el.getAttribute('class') ?? '';
        if (
          hasClassToken(prev, 'tc-collapsed') !== hasClassToken(next, 'tc-collapsed') ||
          hasClassToken(prev, 'tc-ctl') !== hasClassToken(next, 'tc-ctl')
        ) {
          scheduleSync();
          return;
        }
      }
    }
  };

  observer = new MutationObserver(onMutations);
  sync();

  const onResize = () => scheduleSync();
  window.addEventListener('resize', onResize);

  return {
    sync,
    dispose: () => {
      observer?.disconnect();
      observer = null;
      capasObserver?.disconnect();
      capasObserver = null;
      window.removeEventListener('resize', onResize);
      tearDownSplitters();
      for (const pane of listLoadedToolsPanes(content)) {
        clearPaneHeight(pane);
      }
      panel.classList.remove('sitmun-tools-split-active');
    }
  };
}
