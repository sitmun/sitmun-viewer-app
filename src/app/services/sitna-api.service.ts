import { Injectable } from '@angular/core';

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
 * Unified service for accessing TC and SITNA namespaces.
 *
 * TC and SITNA are always available together after import('api-sitna') completes
 * in main.ts. This service provides unified access to both namespaces with
 * synchronous property access and error handling.
 */
@Injectable({
  providedIn: 'root'
})
export class SitnaApiService {
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
