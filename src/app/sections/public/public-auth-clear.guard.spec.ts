import { TestBed, fakeAsync, flush } from '@angular/core/testing';

import { AuthenticationService } from '@auth/services/authentication.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { from, isObservable, of, throwError } from 'rxjs';

import { publicAuthClearGuard } from './public-auth-clear.guard';
import { NotificationService } from '../../notifications/services/NotificationService';

describe('publicAuthClearGuard', () => {
  let clearAuthentication: jest.Mock;
  let warning: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    clearAuthentication = jest.fn().mockReturnValue(of(undefined));
    warning = jest.fn();

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        {
          provide: AuthenticationService,
          useValue: { clearAuthentication }
        },
        {
          provide: NotificationService,
          useValue: { warning, error: jest.fn() }
        }
      ]
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const toObservable = (result: unknown) =>
    isObservable(result) ? result : from(Promise.resolve(result));

  it('allows activation when clearAuthentication succeeds', fakeAsync(() => {
    let canActivate: boolean | undefined;
    TestBed.runInInjectionContext(() => {
      toObservable(publicAuthClearGuard({} as never, {} as never)).subscribe(
        (value) => {
          canActivate = value as boolean;
        }
      );
    });

    flush();

    expect(canActivate).toBe(true);
    expect(clearAuthentication).toHaveBeenCalled();
    expect(warning).not.toHaveBeenCalled();
  }));

  it('allows activation when clearAuthentication fails after local cleanup', fakeAsync(() => {
    clearAuthentication.mockReturnValue(
      throwError(() => new Error('logout failed'))
    );

    let canActivate: boolean | undefined;
    TestBed.runInInjectionContext(() => {
      toObservable(publicAuthClearGuard({} as never, {} as never)).subscribe(
        (value) => {
          canActivate = value as boolean;
        }
      );
    });

    flush();

    expect(canActivate).toBe(true);
    expect(consoleErrorSpy).toHaveBeenCalled();
  }));

  it('shows a translated warning when clearAuthentication fails', fakeAsync(() => {
    clearAuthentication.mockReturnValue(
      throwError(() => new Error('logout failed'))
    );
    const translate = TestBed.inject(TranslateService);
    jest
      .spyOn(translate, 'get')
      .mockReturnValue(of('Could not prepare public access.'));

    let canActivate: boolean | undefined;
    TestBed.runInInjectionContext(() => {
      toObservable(publicAuthClearGuard({} as never, {} as never)).subscribe(
        (value) => {
          canActivate = value as boolean;
        }
      );
    });

    flush();

    expect(canActivate).toBe(true);
    expect(translate.get).toHaveBeenCalledWith('auth.publicAccessFailed');
    expect(warning).toHaveBeenCalledWith('Could not prepare public access.');
  }));
});
