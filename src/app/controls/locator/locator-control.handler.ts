import { Injectable, inject } from '@angular/core';

import type { AppCfg, AppTasks } from '@api/model/app-cfg';

import { prototypeWrappers } from './locator-control.logic';
import { LocatorService } from '../../services/locator.service';
import { SitnaApiService } from '../../services/sitna-api.service';
import { SitnaControlConfig } from '../control-handler.interface';
import { CustomControlHandler } from '../custom-control-handler';
import { CustomControlShellConfig } from '../utils/sitna-patch-helpers';

/**
 * Handler for the Locator custom control.
 * Aggregates all tasks with ui-control='sitmun.locator' into a single search UI.
 *
 * Control Type: sitmun.locator
 * Architecture:
 *   - Shell: Created via createCustomControlShell() factory
 *   - Logic: ./locator-control.logic.ts (same folder)
 *   - Handler: This file (extends CustomControlHandler for registration)
 *
 * A locator task places this control. Search parameters stay on the task.
 * `applyBootstrap` registers the shell and initializes LocatorService.
 */
@Injectable({
  providedIn: 'root'
})
export class LocatorControlHandler extends CustomControlHandler {
  readonly controlIdentifier = 'sitmun.locator';
  readonly sitnaConfigKey = 'locator';
  readonly requiredPatches = undefined;

  private readonly locatorService = inject(LocatorService);

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi, prototypeWrappers);
  }

  /**
   * Register the shell and load every locator task into LocatorService.
   * needsBootstrap is true when a locator task is present.
   */
  override async applyBootstrap(context: AppCfg): Promise<void> {
    await super.applyBootstrap(context);
    this.locatorService.initialize(context);
  }

  override buildConfiguration(
    _task: AppTasks,
    _context: AppCfg
  ): SitnaControlConfig {
    return this.getDefaultConfig();
  }

  protected getControlName(): string {
    return 'Locator';
  }

  protected getControlShellConfig(): CustomControlShellConfig {
    return {
      controlName: 'Locator',
      cssClass: 'tc-ctl-loc',
      tagName: 'sitna-locator'
    };
  }
}
