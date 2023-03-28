import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { AuthenticationService } from '@auth/services/authentication.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate {
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
      // Sent to login (+ url to redirect after succesfully)
      this.router
        .navigate([AUTH_CONFIG.routes.loginPath], {
          queryParams: {
            [AUTH_CONFIG.routes.loginQueryParam]: state.url
          }
        })
        .then();
      return false;
    }

    if (isPublicUrl && isAuthenticated) {
      // Send to default user page (if authenticated, cannot access to login, register...
      const defaultUrl = AUTH_CONFIG.routes.defaultPath(
        this.authenticationService.getLoggedDetails()
      );
      if (defaultUrl) {
        return this.router.parseUrl(defaultUrl);
      }
      return false;
    }

    //  isAuthenticated && !isPublicUrl => OK
    //  !isAuthenticated && isPublicUrl => OK
    return true;
  }
}
