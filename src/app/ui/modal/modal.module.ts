import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpenModalComponent } from '@ui/modal/component/open-modal.component';
import { InsertionDirective } from '@ui/modal/insertion-directive';

@NgModule({
  declarations: [OpenModalComponent, InsertionDirective],
  imports: [CommonModule]
})
export class ModalModule {}
