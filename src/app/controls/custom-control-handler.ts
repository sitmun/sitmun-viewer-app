import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { ControlHandlerBase } from './control-handler-base';
import type { BootstrapEligibilityOptions } from './control-handler.interface';
import { SitnaApiService } from '../services/sitna-api.service';
import type { TCNamespace } from '../types/sitna.types';
import {
  CustomControlShellConfig,
  createCustomControlShell,
  injectControlLogic,
  ControlLogicClass
} from './utils/sitna-patch-helpers';

/**
 * Abstract base class for custom SITNA control handlers.
 *
 * Provides reusable functionality for:
 * - Control registration tracking
 * - Control shell creation and registration
 * - TypeScript method injection onto prototype
 * - Bootstrap (early registration)
 * - Load patches pattern
 * - Readiness checking
 * - Cleanup
 *
 * Subclasses must implement:
 * - `getControlName()`: Returns the control name (e.g., "HelloWorld")
 * - `getControlShellConfig()`: Returns the shell configuration
 * - `buildConfiguration()`: Builds control configuration (inherited from ControlHandlerBase)
 *
 * The prototype wrappers (logic) must be injected via constructor, making the dependency
 * explicit and allowing logic files to be located anywhere.
 *
 * @example
 * ```typescript
 * import { prototypeWrappers } from './my-custom-control.logic';
 *
 * export class MyCustomControlHandler extends CustomControlHandler {
 *   readonly controlIdentifier = 'sitna.myCustom';
 *   readonly sitnaConfigKey = 'myCustom';
 *
 *   constructor(
 *     sitnaApi: SitnaApiService,
 *     prototypeWrappers: ControlLogicClass = prototypeWrappers
 *   ) {
 *     super(sitnaApi, prototypeWrappers);
 *   }
 *
 *   protected getControlName(): string {
 *     return 'MyCustom';
 *   }
 *
 *   protected getControlShellConfig(): CustomControlShellConfig {
 *     return {
 *       controlName: 'MyCustom',
 *       cssClass: 'tc-ctl-mycustom',
 *       tagName: 'sitna-my-custom'
 *     };
 *   }
 *
 *   buildConfiguration(task: AppTasks, context: AppCfg): SitnaControlConfig | null {
 *     const defaultConfig = this.getDefaultConfig();
 *     return this.mergeWithParameters(defaultConfig, task.parameters);
 *   }
 * }
 * ```
 */
export abstract class CustomControlHandler extends ControlHandlerBase {
  /** Track if control class has been registered */
  private controlRegistered = false;

  /** Prototype wrappers containing the control logic methods to inject */
  protected readonly prototypeWrappers: ControlLogicClass;

  constructor(sitnaApi: SitnaApiService, prototypeWrappers: ControlLogicClass) {
    super(sitnaApi);
    this.prototypeWrappers = prototypeWrappers;
  }

  /**
   * Get the control name in PascalCase (e.g., "HelloWorld").
   * Used for TC.control namespace registration.
   */
  protected abstract getControlName(): string;

  /**
   * Get the control shell configuration.
   * Defines the control name, CSS class, and custom element tag name.
   */
  protected abstract getControlShellConfig(): CustomControlShellConfig;

  /** Run bootstrap when the control is requested by a task or enabled by default. */
  needsBootstrap(
    tasks: AppTasks[],
    options: BootstrapEligibilityOptions
  ): boolean {
    return (
      tasks.some((t) => t['ui-control'] === this.controlIdentifier) ||
      options.isEnabledByDefault(this.controlIdentifier)
    );
  }

  /**
   * Bootstrap: register the custom control class early, before map initialization.
   */
  async applyBootstrap(_context: AppCfg): Promise<void> {
    await this.registerCustomControl();
  }

  /**
   * Register the custom control.
   */
  override async loadPatches(_context: AppCfg): Promise<void> {
    await this.registerCustomControl();
  }

  /**
   * Register the custom control class.
   * Creates the JS shell via factory and injects TypeScript methods.
   * Safe to call multiple times - will skip if already registered.
   */
  protected async registerCustomControl(): Promise<void> {
    if (this.controlRegistered) {
      return;
    }

    await this.withTCAsync(async (TC: TCNamespace) => {
      const controlName = this.getControlName();
      const shellConfig = this.getControlShellConfig();

      // Ensure TC.control namespace exists
      TC.control = TC.control || {};

      // Check if already registered
      if (TC.control[controlName]) {
        this.injectTypeScriptMethods(TC, controlName, this.prototypeWrappers);
        this.controlRegistered = true;
        return;
      }

      const created = createCustomControlShell(TC, shellConfig, () =>
        this.sitnaApi.getSITNA()
      );

      if (created) {
        // Inject TypeScript methods onto the prototype
        this.injectTypeScriptMethods(TC, controlName, this.prototypeWrappers);
        this.controlRegistered = true;
      } else {
        console.warn(
          `[${this.constructor.name}] Failed to create control shell for ${controlName}`
        );
      }
    });
  }

  /**
   * Inject prototype wrapper methods that delegate to control logic instances.
   * Each control instance gets its own logic instance for better testability.
   */
  private injectTypeScriptMethods(
    TC: TCNamespace,
    controlName: string,
    prototypeWrappers: ControlLogicClass
  ): void {
    const controlClass = TC.control[controlName];
    if (!controlClass) {
      console.warn(
        `[${this.constructor.name}] Cannot inject methods: control ${controlName} not found`
      );
      return;
    }

    const proto = controlClass.prototype as Record<string, unknown>;
    if (!proto) {
      console.warn(
        `[${this.constructor.name}] Cannot inject methods: prototype not found for ${controlName}`
      );
      return;
    }

    // Use the utility to inject all wrapper methods
    injectControlLogic(proto, prototypeWrappers);
  }

  /**
   * Check if control is ready.
   * Verifies that the control class exists in TC.control namespace.
   */
  override isReady(): boolean {
    const TC = this.sitnaApi.getTC();
    const controlName = this.getControlName();
    return !!TC?.control?.[controlName];
  }

  /**
   * Clean up resources.
   * Resets the registration flag.
   */
  override cleanup(): void {
    super.cleanup();
    this.controlRegistered = false;
  }

  /**
   * Check if control has been registered.
   * Useful for debugging and testing.
   */
  protected isControlRegistered(): boolean {
    return this.controlRegistered;
  }
}
