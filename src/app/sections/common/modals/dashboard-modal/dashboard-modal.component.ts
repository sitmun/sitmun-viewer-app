import { Component } from '@angular/core';
import {
  CommonService,
  DashboardTypes,
  ItemDto,
  ResponseDto
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
  items: Array<ItemDto> | undefined;

  constructor(
    private modalRef: OpenModalRef,
    private modalCfg: OpenModalConfig,
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
    this.modalRef.close({
      applicationId: null,
      territoryId: null
    });
  }

  onKeywordsSearch(keywords: string) {
    this.keywords = keywords;
    let response;
    if (this.type === DashboardTypes.APPLICATIONS) {
      response = this.commonService.fetchTerritoriesByApplication(
        this.id,
        keywords
      );
    } else if (this.type === DashboardTypes.TERRITORIES) {
      response = this.commonService.fetchApplicationsByTerritory(
        this.id,
        keywords
      );
    }
    response?.subscribe((response: ResponseDto) => {
      if (this.type === DashboardTypes.TERRITORIES) {
        this.items = response.content.map((i: any) => {
          return { id: i.id, name: i.title };
        });
      } else {
        this.items = response.content;
      }
    });
  }

  onItemClicked(id: number) {
    let applicationId;
    let territoryId;
    if (this.type === DashboardTypes.APPLICATIONS) {
      applicationId = this.id;
      territoryId = id;
    } else if (this.type === DashboardTypes.TERRITORIES) {
      applicationId = id;
      territoryId = this.id;
    }
    this.modalRef.close({
      applicationId: applicationId,
      territoryId: territoryId
    });
  }

  protected readonly DashboardTypes = DashboardTypes;
}
