import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { DashboardItem } from '@api/services/common.service';
import { NavigationPath } from '@config/app.config';

export interface DashboardTerritorySelectionDialogData {
  application: DashboardItem;
  territories: any[];
}

@Component({
  standalone: false,
  selector: 'app-dashboard-territory-selection-dialog',
  templateUrl: './dashboard-territory-selection-dialog.component.html',
  styleUrls: ['./dashboard-territory-selection-dialog.component.scss']
})
export class DashboardTerritorySelectionDialogComponent implements OnInit {
  application: DashboardItem;
  territories: any[];
  groupedTerritories: { group?: string; items: any[] }[] = [];
  searchValue = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DashboardTerritorySelectionDialogData,
    private dialogRef: MatDialogRef<DashboardTerritorySelectionDialogComponent>,
    private router: Router
  ) {
    this.application = data.application;
    this.territories = data.territories;
  }

  ngOnInit(): void {
    this.updateGroupedTerritories();
  }

  private updateGroupedTerritories(): void {
    let filtered = this.territories || [];

    if (this.searchValue) {
      const searchLower = this.searchValue.toLowerCase();
      filtered = filtered.filter((territory: any) =>
        (territory.name || '').toLowerCase().includes(searchLower)
      );
    }

    this.groupedTerritories = [{ items: filtered }];
  }

  onSearchChange(searchValue: string): void {
    this.searchValue = searchValue;
    this.updateGroupedTerritories();
  }

  onTerritoryClick(territory: any): void {
    if (territory && this.application) {
      const mapUrl = this.router.url.startsWith('/public')
        ? NavigationPath.Section.Public.Map(this.application.id, territory.id)
        : NavigationPath.Section.User.Map(this.application.id, territory.id);

      this.router.navigateByUrl(mapUrl).then(() => {
        this.dialogRef.close();
      });
    }
  }
}
