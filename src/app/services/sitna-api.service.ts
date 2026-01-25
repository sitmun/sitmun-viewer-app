import { Injectable } from '@angular/core';

import type { SitnaGlobals } from '../types/sitna-globals.types';

/**
 * SITNA namespace type definition
 */
interface SitnaNamespace {
  Map: new (div: HTMLElement | string, options?: unknown) => unknown;
  Cfg?: unknown;
  Consts?: unknown;
  control?: {
    Control?: new (...args: unknown[]) => unknown;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Unified service for accessing TC and SITNA namespaces and app globals.
 *
 * TC and SITNA are always available together after import('api-sitna') completes
 * in main.ts. App globals (abstractMapObject, layerCatalogsForModal) are stored
 * in-process; script-load checks use isGlobalDefined(window).
 */
@Injectable({
  providedIn: 'root'
})
export class SitnaApiService {
  private readonly appGlobals = new Map<
    keyof SitnaGlobals,
    SitnaGlobals[keyof SitnaGlobals]
  >();

  /**
   * Get an app global by key.
   */
  getGlobal<K extends keyof SitnaGlobals>(key: K): SitnaGlobals[K] | undefined {
    return this.appGlobals.get(key) as SitnaGlobals[K] | undefined;
  }

  /**
   * Set an app global. Clear with setGlobal(key, undefined).
   */
  setGlobal<K extends keyof SitnaGlobals>(
    key: K,
    value: SitnaGlobals[K] | undefined
  ): void {
    if (value === undefined) {
      this.appGlobals.delete(key);
    } else {
      this.appGlobals.set(key, value);
    }
  }

  /**
   * Check if a global is defined. For script-load dependency checks (e.g. 'pdfMake')
   * this tests window; for SitnaGlobals keys it tests the in-process store.
   */
  isGlobalDefined(name: string): boolean {
    const k = name as keyof SitnaGlobals;
    if (k === 'abstractMapObject' || k === 'layerCatalogsForModal') {
      return this.appGlobals.has(k) && this.appGlobals.get(k) != null;
    }
    return (
      typeof window !== 'undefined' &&
      (window as unknown as Record<string, unknown>)[name] !== undefined
    );
  }
  /**
   * Get the TC namespace directly.
   *
   * TC is available immediately after import('api-sitna') completes in main.ts.
   * No waiting or polling is needed - this is a direct property access with
   * error handling.
   *
   * @returns The global TC object
   * @throws Error if TC is not available (indicates bootstrap failure)
   */
  getTC(): any {
    const TC = (window as any).TC;
    if (!TC) {
      throw new Error(
        'TC namespace not available. Ensure import("api-sitna") succeeded.'
      );
    }
    return TC;
  }

  /**
   * Get SITNA namespace directly.
   *
   * SITNA is available immediately after import('api-sitna') completes in main.ts.
   * No waiting or polling is needed - this is a direct property access with
   * error handling.
   *
   * @returns The SITNA namespace
   * @throws Error if SITNA is not available (indicates bootstrap failure)
   */
  getSITNA(): SitnaNamespace {
    const SITNA = (window as { SITNA?: SitnaNamespace }).SITNA;
    if (!SITNA) {
      throw new Error(
        'SITNA namespace not available. Ensure import("api-sitna") succeeded.'
      );
    }
    return SITNA;
  }

  /**
   * Get a property from TC namespace using dot notation.
   *
   * TC is available immediately after import('api-sitna'), so this is a
   * synchronous property access with error handling.
   *
   * @param propertyPath - Dot-separated property path (e.g., 'control.FeatureInfo')
   * @returns The property value
   * @throws Error if TC or the property is not found
   */
  getTCProperty(propertyPath: string): any {
    const TC = this.getTC();
    const parts = propertyPath.split('.');
    let obj: any = TC;

    for (const part of parts) {
      obj = obj?.[part];
      if (obj === undefined) {
        throw new Error(
          `TC.${propertyPath} not found. Check SITNA initialization.`
        );
      }
    }

    return obj;
  }

  /**
   * Check if SITNA API is ready (synchronous).
   *
   * Since TC and SITNA are always available together, a single readiness check
   * is sufficient. This checks TC as the primary indicator.
   *
   * @returns true if TC (and thus SITNA) is available, false otherwise
   */
  isReady(): boolean {
    return !!(window as any).TC;
  }
}
