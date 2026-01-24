import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { filter, take, timeout as rxTimeout } from 'rxjs/operators';

import { SitnaNamespaceService } from './sitna-namespace.service';

/**
 * Service for waiting on SITNA.Map availability after bootstrap.
 *
 * This service starts polling for SITNA.Map in the background when the app
 * initializes. Components and route guards can use this service to ensure
 * SITNA is ready before attempting map initialization.
 *
 * Usage:
 * - Call waitForSITNAMap() to get a promise that resolves when ready
 * - Subscribe to ready$ observable for reactive readiness state
 * - Use isReady() for synchronous checks
 */
@Injectable({
  providedIn: 'root'
})
export class SitnaLoaderService {
  private readonly readySubject = new BehaviorSubject<boolean>(false);
  private pollingStarted = false;
  private pollingStopped = false;
  private pollTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly defaultTimeout = 5000;
  private readonly pollInterval = 100;

  /**
   * Observable that emits when SITNA is ready.
   * Emits false initially, then true once SITNA.Map is available.
   */
  readonly ready$: Observable<boolean> = this.readySubject.asObservable();

  constructor(private sitnaNamespace: SitnaNamespaceService) {}

  /**
   * Wait for SITNA.Map to become available.
   *
   * @param timeout - Timeout in milliseconds (default: 5000)
   * @returns Promise that resolves when SITNA.Map is ready
   * @throws Error if SITNA.Map is not available within timeout
   */
  async waitForSITNAMap(timeout: number = this.defaultTimeout): Promise<void> {
    // If already ready, return immediately
    if (this.readySubject.value) {
      return Promise.resolve();
    }

    // Start polling if not already started
    if (!this.pollingStarted) {
      this.startPolling();
    }

    // Wait for ready$ to emit true
    try {
      await firstValueFrom(
        this.ready$.pipe(
          filter((ready) => ready === true),
          take(1),
          rxTimeout(timeout)
        )
      );
    } catch (error: any) {
      this.stopPolling();
      this.pollingStarted = false;
      const wrappedError = new Error(
        `SITNA.Map failed to load within ${timeout}ms: ${error.message}`
      );
      if (error?.name) {
        wrappedError.name = error.name;
      }
      throw wrappedError;
    }
  }

  /**
   * Check if SITNA is ready synchronously.
   *
   * @returns true if SITNA.Map is available, false otherwise
   */
  isReady(): boolean {
    return this.readySubject.value;
  }

  /**
   * Start polling for SITNA.Map availability.
   * Called automatically by waitForSITNAMap() if not already started.
   */
  private startPolling(): void {
    if (this.pollingStarted) {
      return;
    }

    this.pollingStopped = false;
    this.pollingStarted = true;
    this.pollForSITNA();
  }

  /**
   * Poll for SITNA.Map availability with retry logic.
   */
  private pollForSITNA(): void {
    const checkSITNA = () => {
      if (this.pollingStopped) {
        return;
      }
      const sitna = this.sitnaNamespace.getSITNA();
      if (sitna && sitna.Map) {
        // SITNA.Map is available
        this.readySubject.next(true);
        this.stopPolling();
      } else {
        // Not ready yet, try again
        this.pollTimer = setTimeout(checkSITNA, this.pollInterval);
      }
    };

    checkSITNA();
  }

  /**
   * Stop polling for SITNA.Map availability.
   */
  private stopPolling(): void {
    this.pollingStopped = true;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }
}
