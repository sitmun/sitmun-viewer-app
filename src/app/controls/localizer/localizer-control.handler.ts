import { Injectable, inject } from '@angular/core';

import { AppCfg } from '@api/model/app-cfg';

import { SitnaApiService } from '../../services/sitna-api.service';
import { LocalizerService } from '../../services/localizer.service';
import { CustomControlHandler } from '../custom-control-handler';
import { prototypeWrappers } from './localizer-control.logic';
import { CustomControlShellConfig } from '../utils/sitna-patch-helpers';

/**
 * Handler for the Localizer custom control.
 * Aggregates all tasks with ui-control='sitmun.localizer' into a single search UI.
 *
 * Control Type: sitmun.localizer
 * Architecture:
 *   - Shell: Created via createCustomControlShell() factory
 *   - Logic: ./localizer-control.logic.ts (same folder)
 *   - Handler: This file (extends CustomControlHandler for registration)
 *
 * The handler is enabled via `enabledByDefault` in app-config.json because backend
 * tasks use the `sitmun.` prefix (not `sitna.`), so the registry's standard
 * per-task pipeline does not process them. Instead, `applyBootstrap` is used
 * to register the control shell and initialize the LocalizerService.
 */
@Injectable({
  providedIn: 'root'
})
export class LocalizerControlHandler extends CustomControlHandler {
  readonly controlIdentifier = 'sitmun.localizer';
  readonly sitnaConfigKey = 'localizer';
  readonly requiredPatches = undefined;

  private readonly localizerService = inject(LocalizerService);

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi, prototypeWrappers);
  }

  /**
   * Override applyBootstrap to register the control shell AND initialize the
   * LocalizerService with all locator tasks from the AppCfg.
   *
   * This is the correct hook because:
   * - applyBootstrap is called by the registry for any handler where needsBootstrap()
   *   returns true (base class checks for matching tasks OR enabledByDefault).
   * - The `sitmun.localizer` tasks are not processed through the normal per-task
   *   pipeline (which filters by `sitna.` prefix), so loadPatches is not called.
   */
  override async applyBootstrap(context: AppCfg): Promise<void> {
    await super.applyBootstrap(context);
    this.localizerService.initialize(context);
  }

  protected getControlName(): string {
    return 'Localizer';
  }

  protected getControlShellConfig(): CustomControlShellConfig {
    return {
      controlName: 'Localizer',
      cssClass: 'tc-ctl-loc',
      tagName: 'sitna-localizer'
    };
  }
}
