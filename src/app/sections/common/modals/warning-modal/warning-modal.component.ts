import { Component } from '@angular/core';
import { BaseModal } from '@ui/modal/component/base-modal';
import { OpenModalConfig } from '@ui/modal/service/open-modal.config';
import { OpenModalRef } from '@ui/modal/service/open-modal-ref';

@Component({
  selector: 'app-warning-modal',
  templateUrl: './warning-modal.component.html',
  styleUrls: [
    './warning-modal.component.scss',
    '../../../../ui/modal/style/open-modal.component.scss'
  ]
})
export class WarningModalComponent extends BaseModal {
  message: string;
  listTitle: string;
  catalogs: [];

  constructor(
    private modalRef: OpenModalRef,
    private modalCfg: OpenModalConfig
  ) {
    super();
    this.message = this.modalCfg.data.message;
    this.listTitle = this.modalCfg.data.listTitle;
    this.catalogs = this.modalCfg.data.catalogs;
  }

  protected override onClose() {
    super.onClose();
    this.modalRef.close();
  }

}
