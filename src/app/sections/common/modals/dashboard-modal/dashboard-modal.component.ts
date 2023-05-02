import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  ApplicationDto,
  CommonService,
  DashboardTypes,
  TerritoryDto
} from '@api/services/common.service';
import { BaseModal } from '@ui/modal/component/base-modal';
import { OpenModalRef } from '@ui/modal/service/open-modal-ref';
import { OpenModalConfig } from '@ui/modal/service/open-modal.config';

@Component({
  selector: 'app-dashboard-dialog',
  templateUrl: './dashboard-modal.component.html',
  styleUrls: [
    './dashboard-modal.component.scss',
    '../../../../ui/modal/style/open-modal.component.scss'
  ]
})
export class DashboardModalComponent extends BaseModal {
  type: DashboardTypes | undefined;
  id: number;
  keywords: string;
  items: Array<ApplicationDto> | Array<TerritoryDto> | undefined;

  constructor(
    private modalRef: OpenModalRef,
    private modalCfg: OpenModalConfig,
    private router: Router,
    private commonService: CommonService
  ) {
    super();
    this.id = -1;
    this.keywords = '';
    this.id = this.modalCfg.data.id;
    this.type = this.modalCfg.data.type;
    this.items = this.modalCfg.data.items;
  }

  protected override onClose() {
    super.onClose();
    this.modalRef.close();
  }

  onKeywordsSearch(keywords: string) {
    this.keywords = keywords;
    let response;
    switch (this.type) {
      case DashboardTypes.APPLICATIONS:
        response = this.commonService.fetchTerritoriesByApplication(
          this.id,
          keywords
        );
        break;
      case DashboardTypes.TERRITORIES:
        response = this.commonService.fetchApplicationsByTerritory(
          this.id,
          keywords
        );
        break;
    }
    response?.subscribe(
      (items: Array<ApplicationDto> | Array<TerritoryDto>) => {
        this.items = items;
      }
    );
  }

  onItemClicked(id: number) {
    let applicationId;
    let territoryId;
    switch (this.type) {
      case DashboardTypes.APPLICATIONS:
        applicationId = this.id;
        territoryId = id;
        break;
      case DashboardTypes.TERRITORIES:
        applicationId = id;
        territoryId = this.id;
        break;
    }
    this.modalRef.close({
      applicationId: applicationId,
      territoryId: territoryId
    });
  }
}
