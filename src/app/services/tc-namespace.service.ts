import { Injectable } from '@angular/core';

/**
 * Service for accessing and waiting on TC namespace availability.
 *
 * The TC namespace is provided by the SITNA API and contains control constructors,
 * utilities, and other SITNA functionality. This service provides safe access
 * and utilities for waiting on TC availability.
 */
@Injectable({
  providedIn: 'root'
})
export class TCNamespaceService {
  /**
   * Get the TC namespace from window or globalThis.
   *
   * @returns The TC namespace, or undefined if not available
   */
  getTC(): any | undefined {
    return (window as any).TC || (globalThis as any).TC;
  }

  /**
   * Check if TC namespace is available.
   *
   * @returns true if TC is available, false otherwise
   */
  isTCReady(): boolean {
    return this.getTC() !== undefined;
  }

  /**
   * Wait for TC namespace to become available with retry logic.
   *
   * @param maxRetries - Maximum number of retry attempts (default: 50)
   * @param delayMs - Delay between retries in milliseconds (default: 100)
   * @returns Promise that resolves when TC is available
   * @throws Error if TC is not available after max retries
   */
  async waitForTC(maxRetries = 50, delayMs = 100): Promise<any> {
    for (let i = 0; i < maxRetries; i++) {
      const TC = this.getTC();
      if (TC) {
        return TC;
      }
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    throw new Error('TC namespace not available after retries');
  }

  /**
   * Wait for a specific property path in TC namespace to become available.
   *
   * @param propertyPath - Dot-separated property path (e.g., 'control.FeatureInfoSilme')
   * @param maxRetries - Maximum number of retry attempts (default: 50)
   * @param delayMs - Delay between retries in milliseconds (default: 100)
   * @returns Promise that resolves with the property value when available
   * @throws Error if property is not available after max retries
   */
  async waitForTCProperty(
    propertyPath: string,
    maxRetries = 50,
    delayMs = 100
  ): Promise<any> {
    for (let i = 0; i < maxRetries; i++) {
      const TC = this.getTC();
      if (TC) {
        const value = this.getPropertyByPath(TC, propertyPath);
        if (value !== undefined) {
          return value;
        }
      }
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    throw new Error(
      `TC property '${propertyPath}' not available after retries`
    );
  }

  /**
   * Get a property value from an object using a dot-separated path.
   *
   * @param obj - The object to traverse
   * @param path - Dot-separated property path
   * @returns The property value, or undefined if not found
   */
  private getPropertyByPath(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => {
      if (current && typeof current === 'object' && key in current) {
        return (current as Record<string, any>)[key];
      }
      return undefined;
    }, obj as any);
  }
}
