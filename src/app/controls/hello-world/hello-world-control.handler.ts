import { Injectable } from '@angular/core';

import { SitnaApiService } from '../../services/sitna-api.service';
import { CustomControlHandler } from '../custom-control-handler';
import { prototypeWrappers } from './hello-world-control.logic';
import { CustomControlShellConfig } from '../utils/sitna-patch-helpers';

/**
 * Handler for the HelloWorld custom control.
 * Demonstrates how to register a custom SITNA control with TypeScript logic.
 *
 * Control Type: sitna.helloWorld
 * Architecture:
 *   - Shell: Created via createCustomControlShell() factory
 *   - Logic: ./hello-world-control.logic.ts (same folder)
 *   - Handler: This file (extends CustomControlHandler for registration)
 *
 * The logic is explicitly injected via constructor, making the dependency clear.
 *
 * @see HelloWorldControlLogic for business logic implementation
 * @see CustomControlHandler for base registration functionality
 */
@Injectable({
  providedIn: 'root'
})
export class HelloWorldControlHandler extends CustomControlHandler {
  readonly controlIdentifier = 'sitna.helloWorld';
  readonly sitnaConfigKey = 'helloWorld';
  readonly requiredPatches = undefined;

  constructor(sitnaApi: SitnaApiService) {
    // Explicitly inject prototypeWrappers from the logic file
    // This makes the dependency location clear and explicit
    super(sitnaApi, prototypeWrappers);
  }

  /**
   * Get the control name in PascalCase.
   */
  protected getControlName(): string {
    return 'HelloWorld';
  }

  /**
   * Get the control shell configuration.
   */
  protected getControlShellConfig(): CustomControlShellConfig {
    return {
      controlName: 'HelloWorld',
      cssClass: 'tc-ctl-hw',
      tagName: 'sitna-hello-world'
    };
  }
}
