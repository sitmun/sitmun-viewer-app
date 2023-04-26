import { Component } from '@angular/core';
import { BaseModal } from '@ui/modal/component/base-modal';
import { OpenModalRef } from '@ui/modal/service/open-modal-ref';

@Component({
  selector: 'app-test-modal',
  templateUrl: './test-modal.component.html',
  styleUrls: [
    './test-modal.component.scss',
    '../../../../ui/modal/style/open-modal.component.scss'
  ]
})
export class TestModalComponent extends BaseModal {
  constructor(private modalRef: OpenModalRef) {
    super();
  }

  protected override onClose() {
    super.onClose();
    this.modalRef.close('closed');
  }
}
