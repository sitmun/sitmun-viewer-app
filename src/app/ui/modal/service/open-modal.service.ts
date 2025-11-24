import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Injectable,
  Injector,
  OnDestroy,
  Type
} from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { OpenModalComponent } from '@ui/modal/component/open-modal.component';
import { OpenModalConfig } from '@ui/modal/service/open-modal.config';
import { OpenModalRef } from '@ui/modal/service/open-modal-ref';
import { OpenModalInjector } from '@ui/modal/service/open-modal.injector';

@Injectable({
  providedIn: 'root'
})
export class OpenModalService implements OnDestroy {
  modalComponentRef!: ComponentRef<OpenModalComponent>;
  private currentDialogRef: OpenModalRef | null = null;
  private routerSubscription: Subscription;

  constructor(
    protected componentFactoryResolver: ComponentFactoryResolver,
    protected appRef: ApplicationRef,
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

  public open<T = any, R = any>(
    componentType: Type<any>,
    config: OpenModalConfig<T> = {}
  ): OpenModalRef<R> {
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

    const componentFactory =
      this.componentFactoryResolver.resolveComponentFactory(OpenModalComponent);
    const componentRef = componentFactory.create(
      new OpenModalInjector(this.injector, map)
    );

    this.appRef.attachView(componentRef.hostView);

    const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    this.modalComponentRef = componentRef;

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
    }
  }

  private closeCurrentModal(): void {
    if (this.currentDialogRef && this.modalComponentRef) {
      this.currentDialogRef.close();
      this.currentDialogRef = null;
    }
  }
}
