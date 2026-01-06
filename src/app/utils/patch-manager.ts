/**
 * Unified patch manager for managing AOP patches and monkey patches.
 * Supports both single restore functions and arrays of restore functions.
 */

export interface PatchManager {
  /**
   * Add a restore function or array of restore functions to the manager.
   * @param restore - Single function or array of functions to restore patches
   */
  add: (restore: (() => void) | Array<() => void>) => void;

  /**
   * Restore all patches and clear the manager.
   */
  restoreAll: () => void;

  /**
   * Clear the manager without restoring patches.
   */
  clear: () => void;
}

/**
 * Create a unified patch manager that supports both single restore functions
 * and arrays of restore functions.
 *
 * This consolidates the functionality from the sitna-sandbox project.
 *
 * @returns A patch manager instance
 *
 * @example
 * ```typescript
 * const patchManager = createPatchManager();
 *
 * // Add single restore function
 * patchManager.add(() => { window.fetch = originalFetch; });
 *
 * // Add array of restore functions
 * const restores = patchSitnaMapMethods({ ... });
 * patchManager.add(restores);
 *
 * // Clean up on destroy
 * patchManager.restoreAll();
 * ```
 */
export function createPatchManager(): PatchManager {
  const patches: Array<() => void> = [];

  return {
    add: (restore: (() => void) | Array<() => void>): void => {
      if (Array.isArray(restore)) {
        // Array of restore functions (from meld patches)
        patches.push(...restore);
      } else {
        // Single restore function (from monkey patches)
        patches.push(restore);
      }
    },
    restoreAll: (): void => {
      patches.forEach((restore) => {
        try {
          restore();
        } catch (error: unknown) {
          // Direct console usage is intentional: This utility may be called during cleanup
          // before Angular services are available or after they've been destroyed.
          // eslint-disable-next-line no-console
          console.error('Error restoring patch:', error);
        }
      });
      patches.length = 0;
    },
    clear: (): void => {
      patches.length = 0;
    }
  };
}
