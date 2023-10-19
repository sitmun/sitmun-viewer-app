import { Component } from '@angular/core';
import { BaseModal } from '@ui/modal/component/base-modal';
import { OpenModalRef } from '@ui/modal/service/open-modal-ref';
import { OpenModalConfig } from '@ui/modal/service/open-modal.config';

@Component({
  selector: 'app-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: [
    './error-modal.component.scss',
    '../../../../ui/modal/style/open-modal.component.scss'
  ]
})
export class ErrorModalComponent extends BaseModal {
  message: string;

  constructor(
    private modalRef: OpenModalRef,
    private modalCfg: OpenModalConfig
  ) {
    super();
    this.message = this.modalCfg.data.message;
  }

  protected override onClose() {
    super.onClose();
    this.modalRef.close({
      applicationId: null,
      territoryId: null
    });
  }
}
