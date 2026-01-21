import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';

import { CustomDetails } from '@api/services/user.service';
import { AuthenticationService } from '@auth/services/authentication.service';

/**
 * Guards routes by role and redirects to the default route on denial.
 */
export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree => {
  const authenticationService = inject(AuthenticationService<CustomDetails>);
  const router = inject(Router);
  const AUTH_CONFIG = authenticationService.getAuthConfig();

  // this will be passed from the route config
  // on the data property
  const expectedRoles: string[] = Array.isArray(route.data['expectedRoles'])
    ? route.data['expectedRoles']
    : [];

  const isLoggedIn = authenticationService.isLoggedIn();
  const hasExpectedRole = isLoggedIn
    ? authenticationService
        .getLoggedDetails()
        .authorities.some((element: any) => expectedRoles.includes(element))
    : false;

  if (!isLoggedIn || !hasExpectedRole) {
    // User not auth or without permissions
    const defaultUrl = isLoggedIn
      ? AUTH_CONFIG.routes.defaultPath(authenticationService.getLoggedDetails())
      : null;
    if (defaultUrl) {
      console.warn(
        'Forbidden navigation to %s - Redirecting to default...',
        state.url
      );
      return router.parseUrl(defaultUrl);
    }
    return false;
  }
  return true;
};
