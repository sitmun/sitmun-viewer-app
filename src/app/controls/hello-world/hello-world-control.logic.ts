/**
 * HelloWorld Control Logic - TypeScript implementation.
 *
 * This file contains all the business logic for the HelloWorld control.
 * Uses an instance-based approach for better testability.
 *
 * @see hello-world-control.handler.ts for wiring logic
 */

import {
  BaseCustomControlInstance,
  ControlLogicBase,
  createPrototypeWrappers
} from '../utils/sitna-patch-helpers';

// ============================================================================
// Configuration Constants
// ============================================================================

/** Path to the Handlebars template */
export const TEMPLATE_PATH =
  'assets/js/patch/templates/hello-world-control/HelloWorld.hbs';

// ============================================================================
// Interfaces
// ============================================================================

/**
 * Interface representing a HelloWorld control instance (the SITNA control).
 * Extends BaseCustomControlInstance with control-specific properties.
 */
export interface HelloWorldControlInstance extends BaseCustomControlInstance {
  /** Reference to the SITNA map (typed for HelloWorld) */
  map: {
    baseLayer?: {
      title?: string;
    };
  } | null;

  /** Bound click handler */
  _handleButtonClick: () => void;
}

// ============================================================================
// Logic Class (Instance-based for testability)
// ============================================================================

/**
 * HelloWorld control logic class.
 *
 * Instance-based design for better testability:
 * - Can mock the control instance in tests
 * - Can inject dependencies if needed
 * - Each control gets its own logic instance
 *
 * Implements ControlLogicBase for compatibility with createPrototypeWrappers.
 *
 * @example
 * ```typescript
 * // In tests:
 * const mockControl = createMockControl();
 * const logic = new HelloWorldControlLogic(mockControl);
 * await logic.render();
 * expect(mockControl.renderData).toHaveBeenCalled();
 * ```
 */
export class HelloWorldControlLogic implements ControlLogicBase {
  constructor(private readonly control: HelloWorldControlInstance) {}

  private counter = 0;

  /**
   * Initialize control state.
   * Called from the JS shell constructor via _initFromTypeScript.
   */
  init(): void {
    // Bind the click handler
    this.control._handleButtonClick = this.handleButtonClick.bind(this);
  }

  /**
   * Load Handlebars template for this control.
   */
  async loadTemplates(): Promise<void> {
    this.control.template = {};
    this.control.template[this.control.CLASS] = TEMPLATE_PATH;
  }

  /**
   * Render the control using the Handlebars template.
   * @param callback - Optional callback after render completes
   */
  async render(callback?: () => void): Promise<void> {
    const data = {
      title: 'helloWorld.title',
      message: 'helloWorld.message',
      buttonLabel: 'helloWorld.buttonLabel'
    };

    return this.control.renderData(data, () => {
      this.addUIEventListeners();
      if (callback) {
        callback();
      }
    });
  }

  /**
   * Add event listeners to UI elements.
   */
  addUIEventListeners(): void {
    const rootElement = this.control.div;
    rootElement
      ?.querySelector('.tc-ctl-hw-btn')
      ?.addEventListener('click', this.control._handleButtonClick);
  }

  /**
   * Handle button click event.
   */
  handleButtonClick(): void {
    const mapTitle = this.control.map?.baseLayer?.title || 'the active basemap';

    this.counter++;
    window.alert(
      `Hello from SITNA! You are viewing ${mapTitle} ${this.counter} times.`
    );
  }
}

// ============================================================================
// Prototype Wrappers (generated via factory)
// ============================================================================

/**
 * Prototype wrappers for injection onto SITNA control.
 * Generated via createPrototypeWrappers factory for consistency.
 */
export const prototypeWrappers =
  createPrototypeWrappers<HelloWorldControlInstance>(HelloWorldControlLogic);
