import { ErrorHandler, Injectable, Injector } from '@angular/core';

import { ErrorTrackingService } from './error-tracking.service';

/**
 * Global error handler that catches all uncaught exceptions and unhandled promise rejections.
 * TODO: Add unit tests (global-error-handler.spec.ts)
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private errorTrackingService?: ErrorTrackingService;

  constructor(private injector: Injector) {
    // Lazy load to avoid circular dependencies
    try {
      this.errorTrackingService = this.injector.get(
        ErrorTrackingService,
        undefined
      );
    } catch {
      // Service not available yet
    }
  }

  handleError(error: any): void {
    if (!this.errorTrackingService) {
      try {
        this.errorTrackingService = this.injector.get(ErrorTrackingService);
      } catch {
        // Service not available
      }
    }

    const message = error?.message || error?.toString() || 'Unknown error';
    const stackTrace = error?.stack || undefined;

    console.error('GlobalErrorHandler caught:', error);

    if (this.errorTrackingService) {
      this.errorTrackingService.addError(message, 'uncaught', {
        details: error,
        stackTrace
      });
    }
  }
}
