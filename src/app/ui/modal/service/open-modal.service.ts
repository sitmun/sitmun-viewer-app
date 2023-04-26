import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Injectable,
  Injector,
  Type
} from '@angular/core';
import { OpenModalComponent } from '@ui/modal/component/open-modal.component';
import { OpenModalConfig } from '@ui/modal/service/open-modal.config';
import { OpenModalRef } from '@ui/modal/service/open-modal-ref';
import { OpenModalInjector } from '@ui/modal/service/open-modal.injector';

@Injectable({
  providedIn: 'root'
})
export class OpenModalService {
  modalComponentRef!: ComponentRef<OpenModalComponent>;

  constructor(
    protected componentFactoryResolver: ComponentFactoryResolver,
    protected appRef: ApplicationRef,
    protected injector: Injector
  ) {}

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

    const sub = dialogRef.afterClosed.subscribe(() => {
      this.removeDialogComponentFromBody();
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
    });

    return dialogRef;
  }

  private removeDialogComponentFromBody() {
    this.appRef.detachView(this.modalComponentRef.hostView);
    this.modalComponentRef.destroy();
  }
}
