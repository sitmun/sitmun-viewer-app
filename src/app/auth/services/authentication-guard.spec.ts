import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';

import { CustomAuthConfig, NavigationPath } from '@config/app.config';

import { AuthenticationGuard } from './authentication-guard';
import { AuthenticationService } from './authentication.service';

describe('AuthenticationGuard', () => {
  let guard: AuthenticationGuard;
  let isLoggedIn: jest.Mock;
  let navigate: jest.Mock;

  const activate = (url: string) =>
    guard.canActivate({} as never, { url } as never);

  beforeEach(() => {
    isLoggedIn = jest.fn();
    navigate = jest.fn().mockResolvedValue(true);

    TestBed.configureTestingModule({
      providers: [
        AuthenticationGuard,
        {
          provide: AuthenticationService,
          useValue: {
            isLoggedIn,
            getAuthConfig: () => CustomAuthConfig
          }
        },
        {
          provide: Router,
          useValue: {
            navigate,
            createUrlTree: (commands: string[]) =>
              ({ toString: () => commands.join('/') } as UrlTree)
          }
        }
      ]
    });

    guard = TestBed.inject(AuthenticationGuard);
  });

  it('blocks unauthenticated access to private routes and sends user to login', () => {
    isLoggedIn.mockReturnValue(false);

    expect(activate('/user/dashboard')).toBe(false);
    expect(navigate).toHaveBeenCalledWith([NavigationPath.Auth.Login], {
      queryParams: {
        [CustomAuthConfig.routes.loginQueryParam]: '/user/dashboard'
      }
    });
  });

  it('allows unauthenticated access to public routes', () => {
    isLoggedIn.mockReturnValue(false);

    expect(activate('/public/dashboard')).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('allows authenticated access to public routes so publicAuthClearGuard can run', () => {
    isLoggedIn.mockReturnValue(true);

    expect(activate('/public/dashboard')).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('redirects authenticated users away from auth routes with UrlTree', () => {
    isLoggedIn.mockReturnValue(true);

    const result = activate('/auth/login');

    expect(result).not.toBe(true);
    expect(String(result)).toContain(NavigationPath.Section.User.Dashboard);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('allows authenticated access to private user routes', () => {
    isLoggedIn.mockReturnValue(true);

    expect(activate('/user/dashboard')).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  });
});
