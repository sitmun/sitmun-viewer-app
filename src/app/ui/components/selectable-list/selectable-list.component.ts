import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

/**
 * Pure "dumb" presentation component for displaying selectable or navigable lists.
 * All business logic (filtering, grouping, navigation, selection) handled by parent.
 */
@Component({
  selector: 'app-selectable-list',
  templateUrl: './selectable-list.component.html',
  styleUrls: ['./selectable-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectableListComponent {
  // Items to display (pre-filtered and pre-grouped by parent)
  @Input() items: { group?: string; items: any[] }[] = [];
  
  // Display configuration
  @Input() selectedId?: string;
  @Input() unavailableItemIds: string[] = [];
  @Input() logoProperty: string = 'logo';
  @Input() nameProperty: string = 'title';
  @Input() defaultIcon: string = 'apps';
  
  // Header configuration
  @Input() showTitle: boolean = false;
  @Input() title?: string;
  @Input() showCloseButton: boolean = false;
  @Input() showCount: boolean = false;
  @Input() countLabel?: string;
  @Input() totalCount: number = 0;
  
  // Search configuration (parent handles filtering)
  @Input() showSearch: boolean = false;
  @Input() searchPlaceholder: string = '';
  @Input() searchValue: string = '';
  @Input() filterHint?: string; // Optional hint text translation key
  @Output() searchValueChange = new EventEmitter<string>();
  
  // Events - parent decides what to do
  @Output() itemClicked = new EventEmitter<any>();
  @Output() closed = new EventEmitter<void>();

  isItemSelected(itemId: number | string): boolean {
    if (!this.selectedId) {
      return false;
    }
    return String(itemId) === String(this.selectedId);
  }

  isUnavailable(itemId: number | string): boolean {
    if (!this.unavailableItemIds || this.unavailableItemIds.length === 0) {
      return false;
    }
    return this.unavailableItemIds.some(id => String(id) === String(itemId));
  }

  hasLogo(item: any): boolean {
    if (!item || !this.logoProperty) {
      return false;
    }
    const logo = item[this.logoProperty];
    if (typeof logo === 'string') {
      return !!(logo && logo.trim && logo.trim());
    }
    return !!logo;
  }

  getItemName(item: any): string {
    if (!item) {
      return '';
    }
    if (this.nameProperty === 'title' && item.title) {
      return item.title;
    }
    return item[this.nameProperty] || item.title || item.name || '';
  }

  onSearchChange(value: string): void {
    this.searchValueChange.emit(value);
  }

  onItemClick(item: any): void {
    if (this.isUnavailable(item.id)) {
      return;
    }
    this.itemClicked.emit(item);
  }

  clearSearch(): void {
    this.searchValueChange.emit('');
  }

  onClose(): void {
    this.closed.emit();
  }

  trackByItemId(index: number, item: any): any {
    return item?.id ?? index;
  }
}
