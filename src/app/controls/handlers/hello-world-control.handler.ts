import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { TCNamespaceService } from '../../services/tc-namespace.service';
import { SitnaControlConfig } from '../control-handler.interface';
import { CustomControlHandler } from '../custom-control-handler';
import { prototypeWrappers } from '../hello-world/hello-world-control.logic';
import { CustomControlShellConfig } from '../utils/sitna-patch-helpers';

/**
 * Handler for the HelloWorld custom control.
 * Demonstrates how to register a custom SITNA control with TypeScript logic.
 *
 * Control Type: sitna.helloWorld
 * Architecture:
 *   - Shell: Created via createCustomControlShell() factory
 *   - Logic: ../hello-world/hello-world-control.logic.ts (all business logic)
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

  constructor(tcNamespaceService: TCNamespaceService) {
    // Explicitly inject prototypeWrappers from the logic file
    // This makes the dependency location clear and explicit
    super(tcNamespaceService, prototypeWrappers);
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

  /**
   * Build configuration for HelloWorld control.
   * Merges default configuration from app-config.json with backend parameters.
   */
  buildConfiguration(
    task: AppTasks,
    _context: AppCfg
  ): SitnaControlConfig | null {
    const defaultConfig = this.getDefaultConfig();
    return this.mergeWithParameters(defaultConfig, task.parameters);
  }
}
