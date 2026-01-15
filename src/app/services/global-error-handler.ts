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
    } catch (e) {
      // Service not available yet
    }
  }

  handleError(error: any): void {
    // Ensure service is loaded
    if (!this.errorTrackingService) {
      try {
        this.errorTrackingService = this.injector.get(ErrorTrackingService);
      } catch (e) {
        // Service not available
      }
    }

    // Extract error message
    const message = error?.message || error?.toString() || 'Unknown error';
    const stackTrace = error?.stack || undefined;

    // Log to console for development
    console.error('GlobalErrorHandler caught:', error);

    // Track in ErrorTrackingService if available
    if (this.errorTrackingService) {
      this.errorTrackingService.addError(message, 'uncaught', {
        details: error,
        stackTrace
      });
    }
  }
}
