import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  OnDestroy,
  Type,
  ViewChild
} from '@angular/core';
import { Subject } from 'rxjs';

import { OpenModalRef } from '../service/open-modal-ref';
import { InsertionDirective } from '@ui/modal/insertion-directive';

@Component({
  template: '<div><ng-template appInsertion></ng-template></div>'
  // styleUrls: ['./style/open-modal.component.scss']
})
export class OpenModalComponent implements AfterViewInit, OnDestroy {
  componentRef!: ComponentRef<any>;

  @ViewChild(InsertionDirective)
  insertionPoint!: InsertionDirective;

  private readonly onCloseSubject = new Subject<any>();
  public onClose = this.onCloseSubject.asObservable();

  childComponentType!: Type<any>;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private cd: ChangeDetectorRef,
    private dialogRef: OpenModalRef
  ) {}

  ngAfterViewInit() {
    this.loadChildComponent(this.childComponentType);
    this.cd.detectChanges();
  }

  // onOverlayClicked(evt: MouseEvent) {
  //   this.dialogRef.close();
  // }

  // onDialogClicked(evt: MouseEvent) {
  //   evt.stopPropagation();
  // }

  loadChildComponent(componentType: Type<any>) {
    const componentFactory =
      this.componentFactoryResolver.resolveComponentFactory(componentType);

    const viewContainerRef = this.insertionPoint.viewContainerRef;
    viewContainerRef.clear();

    this.componentRef = viewContainerRef.createComponent(componentFactory);
  }

  ngOnDestroy() {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }

  close() {
    // @ts-ignore
    this.onCloseSubject.next();
  }
}
