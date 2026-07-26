import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';

import { AuthenticationService } from '@auth/services/authentication.service';
import { NavigationPath } from '@config/app.config';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard {
  constructor(
    private authenticationService: AuthenticationService<unknown>,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const AUTH_CONFIG = this.authenticationService.getAuthConfig();
    const url: string = state.url;
    const isPublicUrl = AUTH_CONFIG.routes.isPublicPath(url);
    const isAuthenticated = this.authenticationService.isLoggedIn();

    if (!isPublicUrl && !isAuthenticated) {
      // Remove any floating MIA popups before redirecting to login
      document.querySelectorAll('.sitmun-mia-popup-overlay').forEach((el) => el.remove());
      // Sent to login (+ url to redirect after successfully)
      this.router
        .navigate([AUTH_CONFIG.routes.loginPath], {
          queryParams: {
            [AUTH_CONFIG.routes.loginQueryParam]: state.url
          }
        })
        .then();
      return false;
    }

    if (isAuthenticated && url.startsWith(NavigationPath.Auth.Base)) {
      // Authenticated users must not activate auth pages; public routes clear session via publicAuthClearGuard.
      return this.router.createUrlTree([NavigationPath.Section.User.Dashboard]);
    }

    //  isAuthenticated && !isPublicUrl => OK
    //  isAuthenticated && /public/** => OK (child publicAuthClearGuard clears stale session)
    //  !isAuthenticated && isPublicUrl => OK
    return true;
  }
}
