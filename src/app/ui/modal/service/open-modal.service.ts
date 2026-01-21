import {
  ApplicationRef,
  ComponentRef,
  EmbeddedViewRef,
  EnvironmentInjector,
  Injectable,
  Injector,
  OnDestroy,
  Type,
  createComponent
} from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

import { OpenModalComponent } from '@ui/modal/component/open-modal.component';
import { OpenModalRef } from '@ui/modal/service/open-modal-ref';
import { OpenModalConfig } from '@ui/modal/service/open-modal.config';
import { OpenModalInjector } from '@ui/modal/service/open-modal.injector';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OpenModalService implements OnDestroy {
  modalComponentRef!: ComponentRef<OpenModalComponent>;
  private currentDialogRef: OpenModalRef | null = null;
  private readonly routerSubscription: Subscription;
  private modalCloseSubscription: Subscription | null = null;

  constructor(
    protected appRef: ApplicationRef,
    protected environmentInjector: EnvironmentInjector,
    protected injector: Injector,
    private router: Router
  ) {
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe(() => {
        this.closeCurrentModal();
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  /**
   * Opens a modal and returns a handle to control its lifecycle.
   */
  public open<T = any, R = any>(
    componentType: Type<any>,
    config: OpenModalConfig<T> = {}
  ): OpenModalRef<R> {
    this.closeCurrentModal();
    const dialogRef = this.appendDialogComponentToBody(config);

    this.modalComponentRef.instance.childComponentType = componentType;

    return dialogRef;
  }

  private appendDialogComponentToBody(config: OpenModalConfig): OpenModalRef {
    const map = new WeakMap();
    map.set(OpenModalConfig, config);

    const dialogRef = new OpenModalRef();
    map.set(OpenModalRef, dialogRef);
    this.currentDialogRef = dialogRef;

    const sub = dialogRef.afterClosed.subscribe(() => {
      this.removeDialogComponentFromBody();
      this.currentDialogRef = null;
      sub.unsubscribe();
    });

    const componentRef = createComponent(OpenModalComponent, {
      environmentInjector: this.environmentInjector,
      elementInjector: new OpenModalInjector(this.injector, map)
    });

    this.appRef.attachView(componentRef.hostView);

    const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    this.modalComponentRef = componentRef;

    this.modalCloseSubscription?.unsubscribe();
    this.modalCloseSubscription =
      this.modalComponentRef.instance.onClose.subscribe(() => {
        this.removeDialogComponentFromBody();
        this.currentDialogRef = null;
      });

    return dialogRef;
  }

  private removeDialogComponentFromBody() {
    if (this.modalComponentRef) {
      this.appRef.detachView(this.modalComponentRef.hostView);
      this.modalComponentRef.destroy();
      this.modalComponentRef = undefined as never;
    }
    this.modalCloseSubscription?.unsubscribe();
    this.modalCloseSubscription = null;
  }

  private closeCurrentModal(): void {
    if (this.currentDialogRef && this.modalComponentRef) {
      this.currentDialogRef.close();
      this.currentDialogRef = null;
    }
  }
}
