import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  CommonService,
  DashboardItem,
  DashboardTypes
} from '@api/services/common.service';

@Component({
  standalone: false,
  selector: 'app-territory',
  templateUrl: './territory.component.html',
  styleUrls: ['./territory.component.scss']
})
export class TerritoryComponent implements OnInit {
  territoryId!: number;
  territory!: DashboardItem;
  applications!: DashboardItem[];

  constructor(
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.territoryId = Number(params['territoryId']);
      this.loadTerritory();
    });
  }

  loadTerritory() {
    const terrId = this.route.snapshot.paramMap.get('territoryId');
    this.territoryId = Number(terrId);

    this.commonService
      .fetchDashboardItems(DashboardTypes.TERRITORIES)
      .subscribe({
        next: (res: any) => {
          this.territory = res.content.find((terr: any) => {
            return terr.id == this.territoryId;
          });
        }
      });

    this.commonService
      .fetchApplicationsByTerritory(this.territoryId)
      .subscribe({
        next: (res: any) => {
          this.applications = res.content;
        }
      });
  }
}
