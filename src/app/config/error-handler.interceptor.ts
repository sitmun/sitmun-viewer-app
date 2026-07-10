import {
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { isSitmunBackendApiUrl } from './backend-api-url';
import { MessageBoxService } from '../../util/message-box-service';
import { NotificationService } from '../notifications/services/NotificationService';
import { ErrorTrackingService } from '../services/error-tracking.service';

// No se controlan los errores en las peticiones que lleven esta cabecera (con cualquier valor)
const HTTP_HEADER_API_CAN_FAIL = 'Api-Can-Fail';

type ErrorPresentation = 'none' | 'authorization-warning' | 'generic';

export const errorPresentationForStatus = (
  status: number | undefined
): ErrorPresentation =>
  status === 401
    ? 'none'
    : status === 403
      ? 'authorization-warning'
      : 'generic';

export function setIgnoreErrors(headers: HttpHeaders) {
  return headers.append(HTTP_HEADER_API_CAN_FAIL, 'true');
}

@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Check if errors should be ignored for this request
    const shouldIgnoreErrors = req.headers.has(HTTP_HEADER_API_CAN_FAIL);

    // Skip interceptor for asset requests (e.g., config files, translations)
    // to avoid circular dependency during APP_INITIALIZER
    if (!isSitmunBackendApiUrl(req.url) || req.url.includes('/assets/')) {
      return next.handle(req);
    } else {
      return next.handle(req).pipe(
        catchError((error: any) => {
          try {
            // Lazily get services to avoid circular dependency
            const errorTrackingService =
              this.injector.get(ErrorTrackingService);
            const messageBoxService = this.injector.get(MessageBoxService);

            // Track HTTP error in ErrorTrackingService
            const errorMessage =
              error?.error?.message || error?.message || 'HTTP request failed';
            const httpStatus = error?.status;
            const url = error?.url || req.url;

            // Extract stack trace if available
            const stackTrace = error?.stack || undefined;

            errorTrackingService.addError(errorMessage, 'http', {
              httpStatus,
              url,
              stackTrace,
              details: error.error || error
            });

            const presentation = errorPresentationForStatus(httpStatus);

            // Only present errors when they are not explicitly ignored.
            if (!shouldIgnoreErrors) {
              if (presentation === 'authorization-warning') {
                const notificationService =
                  this.injector.get(NotificationService);
                const translateService = this.injector.get(TranslateService);
                notificationService.warning(
                  translateService.instant('auth.accessDenied')
                );
              } else if (
                presentation === 'generic' &&
                error.error &&
                error.error.message === 'VALIDATION' &&
                error.error.errors
              ) {
                const validationErrors = error.error.errors;
                let validationText = '<ul>';
                for (let validationError in validationErrors) {
                  validationError = validationError.replace(/\[\d+\]/, '[]');

                  // Create y update son lo mismo
                  validationError = validationError.replace(
                    /^update\./,
                    'create.'
                  );

                  // TODO Traduce el mensaje en caso de que conozca el código
                  const visibleMessage = validationError;
                  validationText += `<li>${visibleMessage}</li>`;
                }
                validationText += '</ul>';
                messageBoxService.alert(
                  'An error has ocurred',
                  'Please check the following errors: ' + validationText
                );
              } else if (presentation === 'generic') {
                messageBoxService.alert(
                  'An error has ocurred',
                  'The indicated action could not be carried out. Please try again later or contact an administrator.'
                );
              }
            }
          } catch (injectionError) {
            // If we can't inject the services (circular dependency during init), log to console
            console.error(
              'ErrorHandlerInterceptor: Could not inject services',
              injectionError
            );
            console.error('Original HTTP error:', error);
          }

          // Re-throw the error so it can be handled by the caller
          return throwError(() => error);
        })
      );
    }
  }
}
