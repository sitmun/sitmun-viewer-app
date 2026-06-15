import { HttpContext, HttpContextToken } from '@angular/common/http';

/** When set on a request, suppresses 401-triggered redirect side effects in the interceptor. */
export const SUPPRESS_AUTH_REDIRECT_ON_401 = new HttpContextToken<boolean>(() => false);

/** Creates an {@link HttpContext} that suppresses 401 redirect side effects for a single request. */
export function suppressAuthRedirectContext(): HttpContext {
  return new HttpContext().set(SUPPRESS_AUTH_REDIRECT_ON_401, true);
}
