import { URL_AUTH_LOGIN } from '@api/api-config';
import { AuthConfig } from '@auth/authentication.options';
import { CustomDetails } from '@api/services/user.service';

export const NavigationPath = {
  Auth: {
    Base: '/auth',
    Login: '/auth/login',
    ForgotPassword: '/auth/forgot-password',
    Register: '/auth/register',
    ChangePassword: '/auth/confirm-recover-password'
  },
  Section: {
    User: {
      Dashboard: '/user/dashboard',
      Help: '/user/help'
    },
    Public: {
      Help: '/public/help'
    }
  }
};

// Cannot use NavigationPath directly in child "routing modules" because of error:
// > Function expressions are not supported in decorators
// so whe use this reduced object without function definitions...
export const RoutingDefault = {
  Auth: '/auth/login'
};

export const QueryParam = {
  Login: {
    RedirectAfterLogin: 'redirect-after-login',
    RegisterSuccess: 'register-successful'
  }
};

export const CustomAuthConfig: AuthConfig<CustomDetails> = {
  localStoragePrefix: 'sitmun_viewer_app',
  endpoints: { login: URL_AUTH_LOGIN },
  routes: {
    loginPath: NavigationPath.Auth.Login,
    loginQueryParam: QueryParam.Login.RedirectAfterLogin,
    isPublicPath: (path: string): boolean => {
      return path != null && path.startsWith(NavigationPath.Auth.Base);
    },
    defaultPath: (): string => {
      return NavigationPath.Section.User.Dashboard;
    }
  }
};
