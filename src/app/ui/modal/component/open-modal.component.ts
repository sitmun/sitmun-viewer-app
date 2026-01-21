import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  OnDestroy,
  Type,
  ViewChild
} from '@angular/core';

import { InsertionDirective } from '@ui/modal/insertion-directive';
import { Subject } from 'rxjs';

import { OpenModalRef } from '../service/open-modal-ref';

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

  constructor(private cd: ChangeDetectorRef, private dialogRef: OpenModalRef) {}

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
    const viewContainerRef = this.insertionPoint.viewContainerRef;
    viewContainerRef.clear();

    this.componentRef = viewContainerRef.createComponent(componentType);
  }

  ngOnDestroy() {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }

  close() {
    // @ts-expect-error - onCloseSubject is a Subject that may not have next method in all contexts
    this.onCloseSubject.next();
  }
}
