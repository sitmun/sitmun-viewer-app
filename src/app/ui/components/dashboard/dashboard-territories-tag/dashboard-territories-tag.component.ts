import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardItem } from '@api/services/common.service';
import { NavigationPath } from '@config/app.config';

@Component({
  selector: 'app-dashboard-territories-tag',
  templateUrl: './dashboard-territories-tag.component.html',
  styleUrls: ['./dashboard-territories-tag.component.scss']
})
export class DashboardTerritoriesTagComponent {
  @Input() territories! : any[];
  @Input() application! : DashboardItem;
  @Output() hide = new EventEmitter<boolean>()
  applicationName : string = "";
  researchInput : string = "";

  constructor(private router : Router) {}

  ngOnInit() {
    this.applicationName = this.application.title;
  }

  closeTag() {
    this.hide.emit(false);
  }

  navigateToMap(applicationId : number, territoryId: number) {
    let navigationPath = "";
    if(this.router.url.startsWith("/user")){
      navigationPath = NavigationPath.Section.User.Map(applicationId, territoryId);
    }
    else if(this.router.url.startsWith("/public")){
      navigationPath = NavigationPath.Section.Public.Map(applicationId, territoryId);
    }

    this.router.navigateByUrl(
      navigationPath
    );
  }

  /**
   * Filter the displayed territories.
   * @returns filtered territories. If the search input is empty, it will return the entire list.
   */
  filteredTerritories() {
    return this.territories.filter((item: any) =>
      item.name.toLowerCase().includes(this.researchInput.toLowerCase())
    );
  }

  clearSearchText() {
    this.researchInput = "";
  }

  onKeywordsChange(value : string){
    this.researchInput = value;
  }

  /**
   * Change src image if is hovered
   */
  changeRightImage(isHovered : boolean, territoryId : string) {
    const territoryElement = document.getElementById(territoryId);

    if (territoryElement) {
      const rightSide = territoryElement.querySelector('.right-side');

      const rightImage = rightSide ? rightSide.querySelector('img') : null;

      if (rightImage) {
        if (isHovered) {
          rightImage.src = 'assets/img/Icona-document-azul.svg';
        } else {
          rightImage.src = 'assets/img/Icona-document.svg';
        }
      }
    }

  }

  /**
   *  Change src image if is hovered
   */
  changeLeftImage(isHovered : boolean, territoryId : string) {
    const territoryElement = document.getElementById(territoryId);

    if (territoryElement) {
      const leftSide = territoryElement.querySelector('.left-side');
      let leftImage = leftSide ? leftSide.querySelector('img') : null;

      if (leftImage) {
        if (isHovered) {
          leftImage.src = 'assets/img/Icona-mapa-azul.svg';
        }
        else {
          leftImage.src = 'assets/img/Icona-mapa.svg';
        }
      }
    }
  }

  IsInDashboard() : boolean {
    return this.router.url.startsWith("/user/dashboard") || this.router.url.startsWith("/public/dashboard");
  }

  DisplayCloseButton() : boolean {
    return this.IsInDashboard() || this.router.url.startsWith("/user/territory") || this.router.url.startsWith("/public/territory");
  }
}
