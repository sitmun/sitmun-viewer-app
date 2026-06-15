const HIDDEN_CLASS = 'tc-hidden';

const isVisible = (element: Element | null): boolean =>
  !!element && !element.classList.contains(HIDDEN_CLASS);

const isHiddenOrMissing = (element: Element | null): boolean =>
  !element || element.classList.contains(HIDDEN_CLASS);

/**
 * Whether the left-panel tools tab is active for H2 expand/collapse handling.
 * Keep in sync with sitmun-base/script.js.
 *
 * @see https://github.com/sitmun/sitmun-viewer-app/issues/156
 */
export function isLeftPanelToolsTabActive(
  toolsTab: Element | null,
  legendTab: Element | null,
  legend: Element | null
): boolean {
  return (
    isVisible(toolsTab) &&
    isHiddenOrMissing(legendTab) &&
    isHiddenOrMissing(legend)
  );
}
