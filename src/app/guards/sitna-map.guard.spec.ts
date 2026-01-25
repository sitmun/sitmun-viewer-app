import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { NavigationPath, RoutingDefault } from '@config/app.config';
import { Subject, from, isObservable } from 'rxjs';

import { sitnaMapGuard } from './sitna-map.guard';
import { SitnaLoaderService } from '../services/sitna-loader.service';

describe('SitnaMapGuard', () => {
  let sitnaLoaderSpy: jest.Mocked<Pick<SitnaLoaderService, 'waitForSITNAMap'>>;
  let routerSpy: jest.Mocked<Pick<Router, 'navigateByUrl'>>;
  let dialogSpy: jest.Mocked<Pick<MatDialog, 'open'>>;
  let afterClosed$: Subject<void>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    afterClosed$ = new Subject<void>();
    const loaderSpy = {
      waitForSITNAMap: jest.fn()
    } as jest.Mocked<Pick<SitnaLoaderService, 'waitForSITNAMap'>>;

    const routerSpyObj = {
      navigateByUrl: jest.fn()
    } as jest.Mocked<Pick<Router, 'navigateByUrl'>>;

    const dialogSpyObj = {
      open: jest
        .fn()
        .mockReturnValue({ afterClosed: () => afterClosed$.asObservable() })
    } as jest.Mocked<Pick<MatDialog, 'open'>>;

    TestBed.configureTestingModule({
      providers: [
        {
          provide: SitnaLoaderService,
          useValue: loaderSpy as unknown as SitnaLoaderService
        },
        { provide: Router, useValue: routerSpyObj as unknown as Router },
        {
          provide: MatDialog,
          useValue: dialogSpyObj as unknown as MatDialog
        }
      ]
    });

    sitnaLoaderSpy = loaderSpy;
    routerSpy = routerSpyObj;
    dialogSpy = dialogSpyObj;
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const toObservable = (result: any) =>
    isObservable(result) ? result : from(Promise.resolve(result));

  it('should allow activation when SITNA is already ready', fakeAsync(() => {
    sitnaLoaderSpy.waitForSITNAMap.mockReturnValue(Promise.resolve());

    let canActivateResult: boolean | undefined;
    TestBed.runInInjectionContext(() => {
      toObservable(
        sitnaMapGuard({} as any, { url: '/user/map/1/2' } as any)
      ).subscribe((result: boolean) => {
        canActivateResult = result;
      });
    });

    flush();

    expect(canActivateResult).toBe(true);
  }));

  it('should show modal and redirect on timeout for user routes', fakeAsync(() => {
    sitnaLoaderSpy.waitForSITNAMap.mockReturnValue(
      Promise.reject({ name: 'TimeoutError', message: 'Timeout' })
    );

    let canActivateResult: boolean | undefined;
    TestBed.runInInjectionContext(() => {
      toObservable(
        sitnaMapGuard({} as any, { url: '/user/map/1/2' } as any)
      ).subscribe((result: boolean) => {
        canActivateResult = result;
      });
    });

    flush();

    expect(canActivateResult).toBe(false);
    expect(dialogSpy.open).toHaveBeenCalled();

    afterClosed$.next();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(
      NavigationPath.Section.User.Dashboard
    );
  }));

  it('should show modal and redirect on failure for public routes', fakeAsync(() => {
    sitnaLoaderSpy.waitForSITNAMap.mockReturnValue(
      Promise.reject({ name: 'Error', message: 'Failed' })
    );

    let canActivateResult: boolean | undefined;
    TestBed.runInInjectionContext(() => {
      toObservable(
        sitnaMapGuard({} as any, { url: '/public/map/1/2' } as any)
      ).subscribe((result: boolean) => {
        canActivateResult = result;
      });
    });

    flush();

    expect(canActivateResult).toBe(false);
    expect(dialogSpy.open).toHaveBeenCalled();

    afterClosed$.next();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(
      NavigationPath.Section.Public.Dashboard
    );
  }));

  it('should redirect to auth for non-user/public routes', fakeAsync(() => {
    sitnaLoaderSpy.waitForSITNAMap.mockReturnValue(
      Promise.reject({ name: 'Error', message: 'Failed' })
    );

    let canActivateResult: boolean | undefined;
    TestBed.runInInjectionContext(() => {
      toObservable(
        sitnaMapGuard({} as any, { url: '/embedded-map/1/2/es' } as any)
      ).subscribe((result: boolean) => {
        canActivateResult = result;
      });
    });

    flush();

    expect(canActivateResult).toBe(false);
    expect(dialogSpy.open).toHaveBeenCalled();

    afterClosed$.next();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(RoutingDefault.Auth);
  }));

  it('should handle concurrent guard checks', fakeAsync(() => {
    sitnaLoaderSpy.waitForSITNAMap.mockReturnValue(Promise.resolve());

    let result1: boolean | undefined;
    let result2: boolean | undefined;

    TestBed.runInInjectionContext(() => {
      toObservable(
        sitnaMapGuard({} as any, { url: '/user/map/1/2' } as any)
      ).subscribe((result: boolean) => {
        result1 = result;
      });
      toObservable(
        sitnaMapGuard({} as any, { url: '/user/map/1/2' } as any)
      ).subscribe((result: boolean) => {
        result2 = result;
      });
    });

    flush();

    expect(result1).toBe(true);
    expect(result2).toBe(true);
  }));
});
