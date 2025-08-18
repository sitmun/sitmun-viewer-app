import { Component, EventEmitter, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard-expand-button',
  templateUrl: './dashboard-expand-button.component.html',
  styleUrls: ['./dashboard-expand-button.component.scss']
})
export class DashboardExpandButtonComponent {
  isExpand : boolean = false;
  button_img_url = "";
  button_text = "";

  private readonly IMG_EXPAND_URL = "assets/img/Icona-afegir-naranja.svg";
  private readonly IMG_CONTRACT_URL = "assets/img/Icona-menys-naranja.svg";
  private BUTTON_EXPAND_TEXT = "";
  private BUTTON_CONTRACT_TEXT = "";
  @Output() expandAll = new EventEmitter<boolean>();

  constructor(private readonly translateService : TranslateService) { }

  ngOnInit() {
    this.button_img_url = this.IMG_EXPAND_URL;

    this.updateButtonText();
    this.translateService.onLangChange.subscribe(() => {
      this.updateButtonText();
    });
  }

  private updateButtonText() {
    this.translateService.get('dashboardPage.showAll').subscribe((trad) => {
      this.BUTTON_EXPAND_TEXT = trad;
    });
    this.translateService.get('dashboardPage.showLess').subscribe((trad) => {
      this.BUTTON_CONTRACT_TEXT = trad;
    });
    this.button_text = this.BUTTON_EXPAND_TEXT;
  }


  /**
   * Change img url
   */
  expandOrContract() {
    if(this.isExpand){
      this.isExpand = false;
      this.button_img_url = this.IMG_EXPAND_URL;
      this.button_text = this.BUTTON_EXPAND_TEXT;
    }
    else {
      this.isExpand = true;
      this.button_img_url = this.IMG_CONTRACT_URL;
      this.button_text = this.BUTTON_CONTRACT_TEXT;
    }
    this.expandAll.emit(this.isExpand);
  }
}
