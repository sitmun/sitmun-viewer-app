import { inject, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';

import { NavigationPath, RoutingDefault } from '@config/app.config';
import { ErrorModalComponent } from '@sections/common/modals/error-modal/error-modal.component';
import { Observable, of, from } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { SitnaLoaderService } from '../services/sitna-loader.service';

/**
 * Route guard that blocks map route activation until SITNA.Map is ready.
 *
 * This guard ensures that SITNA is fully loaded before allowing navigation
 * to map components. If SITNA fails to load within the timeout period,
 * the guard will prevent navigation and can optionally redirect to an error page.
 *
 * Usage:
 * Apply to map routes in routing configuration:
 * { path: 'map/:id', component: MapComponent, canActivate: [sitnaMapGuard] }
 */
export const sitnaMapGuard: CanActivateFn = (
  _route,
  state: RouterStateSnapshot
): Observable<boolean> => {
  const guardTimeout = 5000;
  const sitnaLoader = inject(SitnaLoaderService);
  const router = inject(Router);
  const matDialog = inject(MatDialog);
  const injector = inject(Injector);

  return from(sitnaLoader.waitForSITNAMap(guardTimeout)).pipe(
    map(() => true),
    catchError((error) => {
      const isTimeout = error?.name === 'TimeoutError';
      const messageKey = isTimeout
        ? 'map.error.sitna_load_timeout'
        : 'map.error.sitna_load_failed';

      console.error(
        '[sitnaMapGuard] SITNA failed to load, blocking route:',
        error
      );

      const dialogRef = matDialog.open(ErrorModalComponent, {
        data: { message: messageKey },
        role: 'alertdialog',
        injector
      });

      dialogRef.afterClosed().subscribe(() => {
        void router.navigateByUrl(getFallbackUrl(state.url));
      });

      return of(false);
    })
  );
};

const getFallbackUrl = (currentUrl: string): string => {
  if (currentUrl.startsWith(NavigationPath.Section.Public.Base)) {
    return NavigationPath.Section.Public.Dashboard;
  }
  if (currentUrl.startsWith(NavigationPath.Section.User.Base)) {
    return NavigationPath.Section.User.Dashboard;
  }
  return RoutingDefault.Auth;
};
