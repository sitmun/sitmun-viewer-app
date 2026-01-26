import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  standalone: false,
  selector: '[appInsertion]'
})
export class InsertionDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
