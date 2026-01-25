import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { Router } from '@angular/router';

import { NavigationPath, RoutingDefault } from '@config/app.config';
import { OpenModalRef } from '@ui/modal/service/open-modal-ref';
import { OpenModalService } from '@ui/modal/service/open-modal.service';
import { from, isObservable } from 'rxjs';

import { sitnaMapGuard } from './sitna-map.guard';
import { SitnaLoaderService } from '../services/sitna-loader.service';

describe('SitnaMapGuard', () => {
  let sitnaLoaderSpy: jest.Mocked<Pick<SitnaLoaderService, 'waitForSITNAMap'>>;
  let routerSpy: jest.Mocked<Pick<Router, 'navigateByUrl'>>;
  let modalSpy: jest.Mocked<Pick<OpenModalService, 'open'>>;
  let modalRef: OpenModalRef;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const loaderSpy = {
      waitForSITNAMap: jest.fn()
    } as jest.Mocked<Pick<SitnaLoaderService, 'waitForSITNAMap'>>;

    const routerSpyObj = {
      navigateByUrl: jest.fn()
    } as jest.Mocked<Pick<Router, 'navigateByUrl'>>;

    const modalSpyObj = {
      open: jest.fn()
    } as jest.Mocked<Pick<OpenModalService, 'open'>>;
    modalRef = new OpenModalRef();
    modalSpyObj.open.mockReturnValue(modalRef);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: SitnaLoaderService,
          useValue: loaderSpy as unknown as SitnaLoaderService
        },
        { provide: Router, useValue: routerSpyObj as unknown as Router },
        {
          provide: OpenModalService,
          useValue: modalSpyObj as unknown as OpenModalService
        }
      ]
    });

    sitnaLoaderSpy = loaderSpy;
    routerSpy = routerSpyObj;
    modalSpy = modalSpyObj;
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
    expect(modalSpy.open).toHaveBeenCalled();

    modalRef.close();

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
    expect(modalSpy.open).toHaveBeenCalled();

    modalRef.close();

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
    expect(modalSpy.open).toHaveBeenCalled();

    modalRef.close();

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
