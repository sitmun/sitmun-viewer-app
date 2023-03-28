import { Inject, Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';

import { API_URL } from './injection-tokens';
import { MessageBoxService } from '../../util/message-box-service';

// No se controlan los errores en las peticiones que lleven esta cabecera (con cualquier valor)
const HTTP_HEADER_API_CAN_FAIL = 'Api-Can-Fail';

export function setIgnoreErrors(headers: HttpHeaders) {
  return headers.append(HTTP_HEADER_API_CAN_FAIL, 'true');
}

@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
  constructor(
    @Inject(API_URL) private apiUrl: string,
    private messageBoxService: MessageBoxService
  ) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (!req.url.startsWith('api/')) {
      return next.handle(req);
    } else {
      return next.handle(req).pipe(
        tap(
          () => {},
          (error: any) => {
            // Errores de validación
            if (
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
              this.messageBoxService.alert(
                'An error has ocurred',
                'Please check the following errors: ' + validationText
              );
            } else {
              this.messageBoxService.alert(
                'An error has ocurred',
                'The indicated action could not be carried out. Please try again later or contact an administrator.'
              );
            }

            // return an observable with a user-facing error message
            return throwError(
              'Something bad happened; please try again later.'
            );
          }
        )
      );
    }
  }
}
