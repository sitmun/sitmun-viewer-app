/**
 * Shared patch helpers for SITNA controls.
 * Centralizes FeatureStyler and Modify control patches to prevent errors
 * when methods are called before DOM elements are initialized.
 *
 * These patches use try/catch guards to safely ignore "undefined" errors
 * that occur when private fields (#strokeColorPicker, #textInput, etc.)
 * haven't been initialized by render() callbacks.
 */

import { PatchManager } from '../../utils/patch-manager';

/** Options for applying patches. */
export interface PatchOptions {
  /** If provided, registers cleanup callbacks. */
  patchManager?: PatchManager;
}

/** Result from applying patches. */
export interface PatchResult {
  /** Cleanup function to restore original methods. */
  cleanup: () => void;
  /** Whether any patches were applied. */
  applied: boolean;
}

/**
 * Check if an error is due to undefined private fields (not yet initialized).
 */
function isUndefinedFieldError(error: any): boolean {
  const msg = error?.message;
  return (
    msg?.includes('Cannot set properties of undefined') ||
    msg?.includes("setting 'value'") ||
    msg?.includes("reading 'value'") ||
    msg?.includes("reading 'style'")
  );
}

/**
 * Create a wrapped method that catches undefined field errors.
 * Returns `this` on such errors to allow method chaining to continue.
 */
function wrapWithTryCatch<T extends (...args: any[]) => any>(
  original: T,
  methodName: string
): T {
  const wrapped = function (this: any, ...args: any[]) {
    try {
      return original.apply(this, args);
    } catch (error: any) {
      if (isUndefinedFieldError(error)) {
        // Private field not initialized yet - safe to ignore
        return this;
      }
      throw error;
    }
  } as T;
  (wrapped as any).__sitmunWrapped = true;
  (wrapped as any).__sitmunMethodName = methodName;
  return wrapped;
}

/**
 * Apply patches to FeatureStyler prototype methods.
 * Patches 6 methods that can fail when called before render() completes:
 * - setStrokeColorWatch
 * - setFillColorWatch
 * - setStrokeWidthWatch
 * - setFillOpacityWatch
 * - setRadiusWatch
 * - setStrokeColor
 *
 * @param TC - The TC namespace object
 * @param options - Patch options (patchManager for cleanup registration)
 * @returns Patch result with cleanup function and applied status
 */
export function applyFeatureStylerPatches(
  TC: any,
  options: PatchOptions = {}
): PatchResult {
  const FeatureStylerProto = TC?.control?.FeatureStyler?.prototype;
  if (!FeatureStylerProto) {
    return { cleanup: () => undefined, applied: false };
  }

  // Track original methods for cleanup
  const originals: Record<string, any> = {};
  let anyApplied = false;

  // Methods to patch with their names
  const methodsToWrap = [
    'setStrokeColorWatch',
    'setFillColorWatch',
    'setStrokeWidthWatch',
    'setFillOpacityWatch',
    'setRadiusWatch',
    'setStrokeColor'
  ];

  for (const methodName of methodsToWrap) {
    const original = FeatureStylerProto[methodName];
    // Skip if method doesn't exist or is already wrapped
    if (!original || (original as any).__sitmunWrapped) {
      continue;
    }
    originals[methodName] = original;
    FeatureStylerProto[methodName] = wrapWithTryCatch(original, methodName);
    anyApplied = true;
  }

  // Mark as patched (global flag for backwards compatibility)
  if (anyApplied) {
    (FeatureStylerProto as any).__sitmunFeatureStylerPatched = true;
  }

  // Create cleanup function
  const cleanup = () => {
    for (const [methodName, original] of Object.entries(originals)) {
      FeatureStylerProto[methodName] = original;
    }
    if (anyApplied) {
      delete (FeatureStylerProto as any).__sitmunFeatureStylerPatched;
    }
  };

  // Register cleanup if patchManager provided
  if (options.patchManager && anyApplied) {
    options.patchManager.add(cleanup);
  }

  return { cleanup, applied: anyApplied };
}

/**
 * Apply patches to Modify control prototype.
 * Patches renderPromise to wrap .then() callbacks with try/catch,
 * preventing errors when #textInput is undefined.
 *
 * @param TC - The TC namespace object
 * @param options - Patch options (patchManager for cleanup registration)
 * @returns Patch result with cleanup function and applied status
 */
export function applyModifyPatches(
  TC: any,
  options: PatchOptions = {}
): PatchResult {
  const ModifyProto = TC?.control?.Modify?.prototype;
  if (!ModifyProto) {
    return { cleanup: () => undefined, applied: false };
  }

  // Skip if already patched
  if ((ModifyProto as any).__sitmunModifyPatched) {
    return { cleanup: () => undefined, applied: false };
  }

  const originalRenderPromise = ModifyProto.renderPromise;
  if (!originalRenderPromise) {
    return { cleanup: () => undefined, applied: false };
  }

  // Wrap renderPromise to intercept .then() callbacks
  ModifyProto.renderPromise = function () {
    const self = this as any;
    const promise = originalRenderPromise.call(self);

    if (promise && typeof promise.then === 'function') {
      const originalThen = promise.then.bind(promise);
      promise.then = function (onFulfilled?: any, onRejected?: any) {
        const wrappedOnFulfilled = onFulfilled
          ? function (value: any) {
              try {
                return onFulfilled.call(self, value);
              } catch (error: any) {
                if (isUndefinedFieldError(error)) {
                  // Private field #textInput not initialized - safe to ignore
                  return value;
                }
                throw error;
              }
            }
          : undefined;
        return originalThen(wrappedOnFulfilled, onRejected);
      };
    }

    return promise;
  };

  (ModifyProto as any).__sitmunModifyPatched = true;

  // Create cleanup function
  const cleanup = () => {
    ModifyProto.renderPromise = originalRenderPromise;
    delete (ModifyProto as any).__sitmunModifyPatched;
  };

  // Register cleanup if patchManager provided
  if (options.patchManager) {
    options.patchManager.add(cleanup);
  }

  return { cleanup, applied: true };
}
