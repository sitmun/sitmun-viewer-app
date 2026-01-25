/**
 * Shared patch helpers for SITNA controls.
 *
 * Includes:
 * - FeatureStyler and Modify control patches (prevent init errors)
 * - Custom control shell factory (create Web Component-compatible controls)
 *
 * These patches use try/catch guards to safely ignore "undefined" errors
 * that occur when private fields (#strokeColorPicker, #textInput, etc.)
 * haven't been initialized by render() callbacks.
 */

import { PatchManager } from '../../utils/patch-manager';

// ============================================================================
// Custom Control Shell Factory
// ============================================================================

/**
 * Configuration for creating a custom SITNA control shell.
 */
export interface CustomControlShellConfig {
  /** Control name in PascalCase (e.g., "HelloWorld") - used for TC.control registration */
  controlName: string;

  /** CSS class for the control (e.g., "tc-ctl-hw") */
  cssClass: string;

  /** Custom element tag name in kebab-case (e.g., "sitna-hello-world") */
  tagName: string;
}

/**
 * Create and register a custom SITNA control shell.
 *
 * This factory creates a minimal JavaScript class that extends SITNA.control.Control,
 * registers it as a custom element, and adds it to TC.control namespace.
 *
 * Why native JavaScript? SITNA controls are Web Components that extend HTMLElement.
 * TypeScript's class compilation breaks Web Component inheritance, so we must
 * use native JS class syntax via `new Function()`.
 *
 * Usage:
 * ```typescript
 * // Create the shell
 * createCustomControlShell(TC, {
 *   controlName: 'HelloWorld',
 *   cssClass: 'tc-ctl-hw',
 *   tagName: 'sitna-hello-world'
 * });
 *
 * // Inject TypeScript methods onto the prototype
 * const proto = TC.control.HelloWorld.prototype;
 * proto['_initFromTypeScript'] = MyLogicClass._initFromTypeScript;
 * proto['render'] = MyLogicClass.render;
 * // ...
 * ```
 *
 * @param TC - The TC namespace object
 * @param config - Control shell configuration
 * @param getSITNA - Optional getter for SITNA namespace (avoids direct window access). Falls back to window.SITNA when omitted.
 * @returns true if shell was created, false if already exists or SITNA not ready
 */
export function createCustomControlShell(
  TC: any,
  config: CustomControlShellConfig,
  getSITNA?: () => { control?: { Control?: unknown }; [key: string]: unknown }
): boolean {
  const { controlName, cssClass, tagName } = config;

  TC.control = TC.control || {};

  if (TC.control[controlName]) {
    return false;
  }

  const SITNA = getSITNA
    ? getSITNA()
    : ((typeof window !== 'undefined'
        ? (window as unknown as Record<string, unknown>)['SITNA']
        : undefined) as { control?: { Control?: unknown } } | undefined);
  if (!SITNA?.control?.Control) {
    console.warn(
      `[createCustomControlShell] SITNA.control.Control not available for ${controlName}`
    );
    return false;
  }

  // Generate and execute the shell code
  const shellCode = `
    class ${controlName}Control extends SITNA.control.Control {
      constructor() {
        super(...arguments);
        // Call TypeScript initializer if injected
        if (typeof this._initFromTypeScript === 'function') {
          this._initFromTypeScript();
        }
      }

      // Override register to avoid appending the custom element to the DOM.
      async register(map) {
        this.map = map;
        await this.render();
        if (this.options?.active) {
          this.activate();
        }
        return this;
      }

      // Override connectedCallback to prevent custom element from being inserted
      // Instead, we'll render content directly into the parent div
      connectedCallback() {
        // Don't call super.connectedCallback() to prevent default Web Component behavior
        // The control will be rendered via renderData which sets div.innerHTML directly
      }
    }

    // Set CSS class
    ${controlName}Control.prototype.CLASS = '${cssClass}';

    // Register as custom element (required for Web Components)
    if (!customElements.get('${tagName}')) {
      customElements.define('${tagName}', ${controlName}Control);
    }

    // Register in TC.control namespace
    TC.control.${controlName} = ${controlName}Control;
  `;

  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const createShell = new Function('SITNA', 'TC', shellCode);
    createShell(SITNA, TC);
    return !!TC.control[controlName];
  } catch (error) {
    console.error(
      `[createCustomControlShell] Failed to create ${controlName}:`,
      error
    );
    return false;
  }
}

/**
 * Type for a control logic class with static methods.
 * Static methods will be injected onto the control prototype.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ControlLogicClass = Record<string, any>;

/**
 * Inject all methods from a logic class onto a control prototype.
 *
 * This automatically discovers and injects all static methods from the logic class,
 * eliminating the need to manually list each method.
 *
 * Methods that are excluded:
 * - Properties that are not functions
 * - Built-in static properties (length, name, prototype)
 * - Properties starting with uppercase (assumed to be constants)
 *
 * Usage:
 * ```typescript
 * // Create shell and inject logic in one step
 * createCustomControlShell(TC, { controlName: 'HelloWorld', ... });
 * injectControlLogic(TC.control.HelloWorld.prototype, HelloWorldControlLogic);
 * ```
 *
 * @param prototype - The control prototype to inject methods onto
 * @param logicClass - The TypeScript class containing static methods
 * @returns Array of method names that were injected
 */
export function injectControlLogic(
  prototype: Record<string, unknown>,
  logicClass: ControlLogicClass
): string[] {
  if (!prototype) {
    console.warn('[injectControlLogic] No prototype provided');
    return [];
  }

  // Skip if already injected
  if (prototype['_methodsInjected']) {
    return [];
  }

  const injected: string[] = [];

  // Built-in static properties to skip
  const skipProperties = new Set(['length', 'name', 'prototype']);

  // Get all  property names from the logic class
  const propertyNames = Object.getOwnPropertyNames(logicClass);

  for (const name of propertyNames) {
    // Skip built-in properties
    if (skipProperties.has(name)) {
      continue;
    }

    // Skip properties starting with uppercase (constants like DEFAULT_TITLE)
    if (name[0] === name[0].toUpperCase() && name[0] !== '_') {
      continue;
    }

    const value = logicClass[name];

    // Only inject functions
    if (typeof value === 'function') {
      prototype[name] = value;
      injected.push(name);
    }
  }

  // Mark as injected to prevent double-injection
  prototype['_methodsInjected'] = true;

  return injected;
}

// ============================================================================
// Generic Prototype Wrappers Factory
// ============================================================================

/**
 * Base interface for custom control instances.
 * Extend this interface for control-specific properties.
 */
export interface BaseCustomControlInstance {
  /** Container div element */
  div: HTMLElement | null;

  /** Reference to the SITNA map */
  map: unknown;

  /** Template paths or compiled templates */
  template: Record<string, string> | null;

  /** CSS class for this control */
  CLASS: string;

  /** Reference to the logic instance (managed by wrappers) */
  _logic?: ControlLogicBase;

  /** Get localized string from SITNA i18n */
  getLocaleString(key: string): string;

  /** Render data using Handlebars template */
  renderData(
    data: Record<string, unknown>,
    callback?: () => void
  ): Promise<void>;
}

/**
 * Base interface for control logic classes.
 * Implement this interface for type-safe logic classes.
 */
export interface ControlLogicBase {
  /** Initialize control state */
  init(): void;

  /** Load Handlebars templates */
  loadTemplates(): Promise<void>;

  /** Render the control */
  render(callback?: () => void): Promise<void>;

  /** Add event listeners to UI elements */
  addUIEventListeners(): void;
}

/**
 * Constructor type for logic classes.
 */
export type LogicConstructor<T extends BaseCustomControlInstance> = new (
  control: T
) => ControlLogicBase;

/**
 * Create reusable prototype wrappers for a custom SITNA control.
 *
 * This factory generates the standard lifecycle methods that SITNA expects
 * (loadTemplates, render, addUIEventListeners) and delegates them to
 * a logic class instance.
 *
 * Benefits:
 * - Ensures consistent wrapper pattern
 * - Type-safe via generic constraints
 *
 * Usage:
 * ```typescript
 * // In your control logic file:
 * export const prototypeWrappers = createPrototypeWrappers<MyControlInstance>(
 *   MyControlLogic
 * );
 *
 * // In your handler:
 * injectControlLogic(proto, prototypeWrappers);
 * ```
 *
 * @param LogicClass - The TypeScript class that implements ControlLogicBase
 * @returns Object with prototype methods to inject
 */
export function createPrototypeWrappers<T extends BaseCustomControlInstance>(
  LogicClass: LogicConstructor<T>
) {
  return {
    /**
     * Initialize from TypeScript - creates logic instance and calls init.
     */
    _initFromTypeScript(this: T & { _logic?: ControlLogicBase }): void {
      this._logic = new LogicClass(this as T);
      this._logic.init();
    },

    /**
     * Load templates - delegates to logic instance.
     * Creates logic instance if it doesn't exist.
     */
    async loadTemplates(
      this: T & { _logic?: ControlLogicBase }
    ): Promise<void> {
      if (!this._logic) {
        this._logic = new LogicClass(this as T);
      }
      return this._logic.loadTemplates();
    },

    /**
     * Render - delegates to logic instance.
     * Creates logic instance if it doesn't exist.
     */
    async render(
      this: T & { _logic?: ControlLogicBase },
      callback?: () => void
    ): Promise<void> {
      if (!this._logic) {
        this._logic = new LogicClass(this as T);
      }
      return this._logic.render(callback);
    },

    /**
     * Add UI event listeners - delegates to logic instance.
     * Creates logic instance if it doesn't exist.
     */
    addUIEventListeners(this: T & { _logic?: ControlLogicBase }): void {
      if (!this._logic) {
        this._logic = new LogicClass(this as T);
      }
      this._logic.addUIEventListeners();
    }
  };
}

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
