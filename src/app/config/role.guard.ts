import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { CustomDetails } from '@api/services/user.service';
import { AuthenticationService } from '@auth/services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authenticationService: AuthenticationService<CustomDetails>,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const AUTH_CONFIG = this.authenticationService.getAuthConfig();

    // this will be passed from the route config
    // on the data property
    const expectedRoles = route.data['expectedRoles'];

    if (
      !this.authenticationService.isLoggedIn() ||
      !this.authenticationService
        .getLoggedDetails()
        .authorities.some((element: any) => expectedRoles.includes(element))
    ) {
      // User not auth or without permissions
      const defaultUrl = AUTH_CONFIG.routes.defaultPath(
        this.authenticationService.getLoggedDetails()
      );
      if (defaultUrl) {
        console.warn(
          'Forbidden navigation to %s - Redirecting to default...',
          state.url
        );
        return this.router.parseUrl(defaultUrl);
      }
      return false;
    }
    return true;
  }
}
