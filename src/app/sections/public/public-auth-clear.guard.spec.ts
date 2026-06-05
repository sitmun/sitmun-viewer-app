import { TestBed, fakeAsync, flush } from '@angular/core/testing';

import { AuthenticationService } from '@auth/services/authentication.service';
import { isObservable, from, of, throwError } from 'rxjs';

import { publicAuthClearGuard } from './public-auth-clear.guard';
import { NotificationService } from '../../notifications/services/NotificationService';

describe('publicAuthClearGuard', () => {
  let authServiceSpy: { clearAuthentication: jest.Mock };
  let notificationServiceSpy: { error: jest.Mock };

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    authServiceSpy = {
      clearAuthentication: jest.fn()
    };
    notificationServiceSpy = {
      error: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthenticationService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const runGuard = () => {
    let result: boolean | undefined;
    TestBed.runInInjectionContext(() => {
      const guard = publicAuthClearGuard({} as any, {} as any);
      const obs = isObservable(guard) ? guard : from(Promise.resolve(guard as boolean));
      obs.subscribe((val: unknown) => { result = val as boolean; });
    });
    return () => result;
  };

  it('calls clearAuthentication before activating the route', fakeAsync(() => {
    authServiceSpy.clearAuthentication.mockReturnValue(of(undefined));
    const getResult = runGuard();
    flush();
    expect(authServiceSpy.clearAuthentication).toHaveBeenCalledTimes(1);
    expect(getResult()).toBe(true);
  }));

  it('returns true after clearAuthentication completes', fakeAsync(() => {
    authServiceSpy.clearAuthentication.mockReturnValue(of(undefined));
    const getResult = runGuard();
    flush();
    expect(getResult()).toBe(true);
  }));

  it('waits for clearAuthentication to complete before activating', fakeAsync(() => {
    const { observable, complete } = makeControlledObservable<void>();
    authServiceSpy.clearAuthentication.mockReturnValue(observable);

    const getResult = runGuard();
    flush();
    expect(getResult()).toBeUndefined();

    complete();
    flush();
    expect(getResult()).toBe(true);
  }));

  it('returns false and shows error notification when clearAuthentication fails', fakeAsync(() => {
    authServiceSpy.clearAuthentication.mockReturnValue(
      throwError(() => new Error('backend error'))
    );
    const getResult = runGuard();
    flush();
    expect(getResult()).toBe(false);
    expect(notificationServiceSpy.error).toHaveBeenCalled();
  }));

  it('does not activate the public route when clearAuthentication fails', fakeAsync(() => {
    authServiceSpy.clearAuthentication.mockReturnValue(
      throwError(() => new Error('network error'))
    );
    const getResult = runGuard();
    flush();
    expect(getResult()).toBe(false);
  }));
});

function makeControlledObservable<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((res) => { resolve = res; });
  return {
    observable: from(promise).pipe(),
    complete: () => resolve(undefined as unknown as T)
  };
}
