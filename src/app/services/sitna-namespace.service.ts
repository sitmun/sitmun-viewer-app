import { Injectable } from '@angular/core';

/**
 * SITNA namespace type definition
 */
interface SitnaNamespace {
  Map: new (
    div: HTMLElement | string,
    options?: unknown
  ) => unknown;
  Cfg?: unknown;
  Consts?: unknown;
  control?: {
    Control?: new (...args: unknown[]) => unknown;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Service for accessing and waiting on SITNA namespace availability.
 *
 * Provides utilities for:
 * - Accessing SITNA namespace
 * - Waiting for SITNA namespace to become available
 */
@Injectable({
  providedIn: 'root',
})
export class SitnaNamespaceService {
  /**
   * Get SITNA namespace from window.
   *
   * @returns The SITNA namespace, or undefined if not available
   */
  getSITNA(): SitnaNamespace | undefined {
    return (window as { SITNA?: SitnaNamespace }).SITNA;
  }

  /**
   * Wait for SITNA namespace to become available with retry logic.
   *
   * @param maxRetries - Maximum number of retry attempts (default: 50)
   * @param delayMs - Delay between retries in milliseconds (default: 100)
   * @returns Promise that resolves when SITNA is available
   * @throws Error if SITNA is not available after max retries
   */
  async waitForSITNA(
    maxRetries: number = 50,
    delayMs: number = 100
  ): Promise<SitnaNamespace> {
    for (let i = 0; i < maxRetries; i++) {
      const SITNA = this.getSITNA();
      if (SITNA) {
        return SITNA;
      }
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    throw new Error('SITNA namespace not available after retries');
  }
}

