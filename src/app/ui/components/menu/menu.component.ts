import { Component } from '@angular/core';
import { AuthenticationService } from '@auth/services/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { LoginModalComponent } from '@sections/common/modals/login-modal/login-modal.component';
import { NavigationPath } from '@config/app.config';
import { OpenModalService } from '@ui/modal/service/open-modal.service';
import { Router } from '@angular/router';
import {
  CommonService,
  DashboardTypes,
  ItemDto,
  ResponseDto
} from '@api/services/common.service';
import { DashboardModalComponent } from '@sections/common/modals/dashboard-modal/dashboard-modal.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  username: string = '';
  isLoggedIn: boolean;
  isInLogin: boolean;
  isInMap: boolean;
  applicationId!: number;
  territoryId!: number;
  shouldShowChangeApplication: boolean = false;
  shouldShowChangeTerritory: boolean = false;

  constructor(
    private router: Router,
    private translate: TranslateService,
    private authenticationService: AuthenticationService<unknown>,
    private commonService: CommonService,
    private modal: OpenModalService,
    private location: Location
  ) {
    this.isLoggedIn = this.authenticationService.isLoggedIn();
    if (this.isLoggedIn) {
      this.username = this.authenticationService.getLoggedUsername();
    }
    const path = this.location.path();
    this.isInLogin = path.includes('login');
    this.isInMap = path.includes('map');
    if (this.isInMap) {
      const words = path.split('/');
      this.applicationId = Number(words[3]);
      this.territoryId = Number(words[4]);

      this.commonService.fetchApplicationsByTerritory(
        this.territoryId
      )?.subscribe((response: ResponseDto) => {
        this.shouldShowChangeApplication = response.numberOfElements > 1;
      });

      this.commonService.fetchTerritoriesByApplication(
        this.applicationId
      )?.subscribe((response: ResponseDto) => {
        this.shouldShowChangeTerritory = response.numberOfElements > 1;
      });
    }
  }

  TamanyMenu() {
    if (this.router.url.includes("/map/")) {
      return 'menu-show-div pet';
    }else{
      return 'menu-show-div';
    }
  }

  logout() {
    this.authenticationService.logout();
  }

  useLanguage(lang: string) {
    this.translate.use(lang);
  }

  openLoginModal() {
    const ref = this.modal.open(LoginModalComponent);
    ref.afterClosed.subscribe(({ loggedIn }) => {
      if (loggedIn) {
        this.router
          .navigateByUrl(NavigationPath.Section.User.Dashboard)
          .then(() => {
            if (this.isInMap) {
              this.router.navigateByUrl(
                NavigationPath.Section.User.Map(
                  this.applicationId,
                  this.territoryId
                )
              );
            }
          });
      }
    });
  }

  navigateToMap() {
    if (this.isLoggedIn) {
      this.router.navigateByUrl(
        NavigationPath.Section.User.Map(this.applicationId, this.territoryId)
      );
    } else {
      this.router.navigateByUrl(
        NavigationPath.Section.Public.Map(this.applicationId, this.territoryId)
      );
    }
  }

  openModal(id: number, type: DashboardTypes, items: Array<ItemDto>) {
    const ref = this.modal.open(DashboardModalComponent, {
      data: { id: id, type: type, items: items }
    });
    ref.afterClosed.subscribe(({ applicationId, territoryId }) => {
      if (applicationId && territoryId) {
        this.applicationId = applicationId;
        this.territoryId = territoryId;
        this.navigateToMap();
      }
    });
  }

  changeApplication() {
    const response = this.commonService.fetchApplicationsByTerritory(
      this.territoryId
    );
    response?.subscribe((response: ResponseDto) => {
      if (response.numberOfElements) {
        if (response.numberOfElements === 1) {
          this.applicationId = response.content[0].id;
          this.navigateToMap();
        } else {
          this.openModal(
            this.territoryId,
            DashboardTypes.TERRITORIES,
            response.content.map((i: any) => {
              return { id: i.id, name: i.title };
            })
          );
        }
      }
    });
  }

  changeTerritory() {
    const response = this.commonService.fetchTerritoriesByApplication(
      this.applicationId
    );
    response?.subscribe((response: ResponseDto) => {
      if (response.numberOfElements) {
        if (response.numberOfElements === 1) {
          this.territoryId = response.content[0].id;
          this.navigateToMap();
        } else {
          this.openModal(
            this.applicationId,
            DashboardTypes.APPLICATIONS,
            response.content
          );
        }
      }
    });
  }
}
