import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-dashboard-searchbox',
  templateUrl: './dashboard-searchbox.component.html',
  styleUrls: ['./dashboard-searchbox.component.scss']
})
export class DashboardSearchboxComponent {
  @Output() keywords = new EventEmitter<string>();
  input: string;

  constructor() {
    this.input = '';
  }

  onKeywordsChange(keywords: string) {
    this.input = keywords;
  }

  handleSubmit() {
    this.keywords.emit(this.input);
  }
}
