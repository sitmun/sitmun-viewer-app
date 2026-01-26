import { Component, HostListener, OnInit } from '@angular/core';

import { PositionDTO } from '@api/model/position';
import { TerritoryDTO } from '@api/model/territories';
import { UserDto } from '@api/model/user';
import { UserService } from '@api/services/user.service';
import { VerifyAccountService } from '@auth/services/verifyAccount.service';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { NotificationService } from 'src/app/notifications/services/NotificationService';

@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  readonly TERRITORIES_LIMIT: number = 3;
  displayPopupProfile = false;
  displayPopupTerritoriesProfiles = false;

  territories: Array<TerritoryDTO> = [];
  selectedTerritory?: any;
  passwordField = '';
  hidenPassword = '*************';
  copyUserProfile!: UserDto;
  userProfile: UserDto = {
    id: 0,
    email: '',
    username: '',
    password: '',
    passwordSet: false,
    firstname: '',
    lastname: '',
    identificationNumber: 0,
    identificationType: '',
    administrator: false,
    blocked: false,
    createDate: new Date()
  };
  territoriesPositionsToUpdate: PositionTerritory[] = [];
  currentSection: ProfileSectionType = ProfileSectionType.PROFILE_INFORMATION;
  scrollButonIcon = ScrollButtonIcon.SCROLL_BUTTON_DOWN;

  constructor(
    private userService: UserService,
    private readonly notificationService: NotificationService,
    private verificationAccountService: VerifyAccountService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.getUserDetails();

    // Get selected territory
    if (this.territories.length > 0)
      this.selectedTerritory = this.territories[0];
  }

  /**
   * Listen to window scroll to change scroll button icon and current section
   */
  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.isAtBottom()) {
      this.scrollButonIcon = ScrollButtonIcon.SCROLL_BUTTON_UP;
      this.currentSection = ProfileSectionType.PROFILE_TERRITORIES;
    } else {
      this.scrollButonIcon = ScrollButtonIcon.SCROLL_BUTTON_DOWN;
      this.currentSection = ProfileSectionType.PROFILE_INFORMATION;
    }
  }

  /**
   * Get details of the connected user
   */
  private getUserDetails(): void {
    // User details
    this.userService.getUserDetails().subscribe({
      next: (res: UserDto) => {
        this.userProfile = res;
        this.copyUserProfile = structuredClone(this.userProfile);
      }
    });

    // User territories
    this.userService.getUserTerritories().subscribe({
      next: (res: any) => {
        res.content.forEach((element: TerritoryDTO) => {
          this.territories.push(element);
        });
        this.selectedTerritory = this.territories[0];
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  selectTerritory(event: any) {
    if (event.target) {
      // select box territory
      const selectedValue = event.target.value;
      this.selectedTerritory = this.territories.find(
        (territory) => territory.name === selectedValue
      );
    } else {
      // button select territory
      this.selectedTerritory = event;
    }
  }

  editEmailInformation(value: string) {
    const regexp = new RegExp(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    if (!regexp.test(value)) {
      this.translateService.get('profile.mailErrorFormat').subscribe((trad) => {
        this.notificationService.error(trad);
      });
    } else {
      this.verificationAccountService.emailVerification(value).subscribe({
        next: (emailAlreadyExist: any) => {
          if (!emailAlreadyExist) {
            // update email if not used by another one
            this.userProfile.email = value;
            this.userProfile = { ...this.userProfile, email: value };
          } else {
            this.translateService
              .get('profile.emailAlreadyExistError')
              .subscribe((trad) => {
                this.notificationService.error(trad);
              });
          }
        },
        error: () => {
          this.translateService
            .get('profile.userUpdateError')
            .subscribe((trad) => {
              this.notificationService.error(trad);
            });
        }
      });
    }
  }

  editPasswordInformation(value: string) {
    this.userProfile = { ...this.userProfile, password: value };
  }

  displayPopupSaveProfile() {
    if (
      this.userProfile.email != this.copyUserProfile.email ||
      this.userProfile.password != this.copyUserProfile.password
    ) {
      this.ShowPopupSaveProfile();
    } else {
      this.translateService.get('profile.noUpdateProfile').subscribe((trad) => {
        this.notificationService.warning(trad);
      });
    }
  }

  displayPopupSaveTerritoriesPositions() {
    if (this.territoriesPositionsToUpdate.length > 0) {
      this.ShowPopupSaveTerritoriesPositions();
    } else {
      this.translateService
        .get('profile.noUpdateTerritories')
        .subscribe((trad) => {
          this.notificationService.warning(trad);
        });
    }
  }

  ShowPopupSaveProfile() {
    this.displayPopupProfile = !this.displayPopupProfile;
  }

  ShowPopupSaveTerritoriesPositions() {
    this.displayPopupTerritoriesProfiles =
      !this.displayPopupTerritoriesProfiles;
  }

  saveProfile() {
    this.userProfile.password = this.passwordField;

    // Update user
    this.userService.updateUserAccount(this.userProfile).subscribe({
      next: () => {
        this.translateService
          .get('profile.informationsUpdated')
          .subscribe((trad) => {
            this.notificationService.success(trad);
          });
        this.copyUserProfile = this.userProfile;
      },
      error: () => {
        this.translateService
          .get('profile.userUpdateError')
          .subscribe((trad) => {
            this.notificationService.error(trad);
          });
      }
    });

    this.passwordField = '';
    this.ShowPopupSaveProfile();
  }

  saveTerritoriesPositions() {
    const updates = this.territoriesPositionsToUpdate.map(
      (territoryPosition: PositionTerritory) =>
        this.updateTerritoryPosition(
          territoryPosition.territory,
          territoryPosition.position
        )
    );

    if (updates.length === 0) return;

    forkJoin(updates).subscribe({
      next: () => {
        this.translateService
          .get('profile.territoriesUpdated')
          .subscribe((trad) => {
            this.notificationService.success(trad);
          });
      },
      error: () => {
        this.translateService
          .get('profile.territoriesUpdateError')
          .subscribe((trad) => {
            this.notificationService.error(trad);
          });
      }
    });

    this.ShowPopupSaveTerritoriesPositions();
    this.territoriesPositionsToUpdate = [];
    this.passwordField = '';
  }

  changeSection(): void {
    switch (this.currentSection) {
      case ProfileSectionType.PROFILE_INFORMATION:
        document
          .getElementById('territories-profile-section')
          ?.scrollIntoView({ behavior: 'smooth' });
        this.currentSection = ProfileSectionType.PROFILE_TERRITORIES;
        this.scrollButonIcon = ScrollButtonIcon.SCROLL_BUTTON_UP;
        break;
      case ProfileSectionType.PROFILE_TERRITORIES:
        document
          .getElementById('user-profile-section')
          ?.scrollIntoView({ behavior: 'smooth' });
        this.currentSection = ProfileSectionType.PROFILE_INFORMATION;
        this.scrollButonIcon = ScrollButtonIcon.SCROLL_BUTTON_DOWN;
        break;
    }
  }

  /**
   * Toggles the visibility of an input field within a table cell to allow editing a specific field.
   * The function updates the UI by switching between a text paragraph and an input field,
   * as well as changing the icon of the associated button.
   *
   * @param id - The unique identifier of the row to be updated.
   * @param value - The current value of the field to be edited.
   * @param type - The prefix used to locate the table cell by ID.
   */
  changeValue(id: number, value: string, type: string) {
    const territoryTdElement: HTMLTableCellElement = document.getElementById(
      type + id
    ) as HTMLTableCellElement;
    const inputPosition = territoryTdElement.querySelector('input');
    if (!inputPosition) {
      throw Error();
    }

    const paragraph = territoryTdElement.querySelector(
      'p'
    ) as HTMLParagraphElement;
    const img = territoryTdElement.querySelector('button')
      ?.children[0] as HTMLImageElement;

    if (inputPosition.hidden) {
      // Display input & hide paragraph
      inputPosition.hidden = false;
      inputPosition.value = value ?? '';
      paragraph.hidden = true;
      img.src = 'assets/img/Icona-comprovar-naranja.svg';
    } else {
      // Hide input, display paragraph & save values
      inputPosition.hidden = true;
      paragraph.hidden = false;
      img.src = 'assets/img/Icona-modificar-naranja.svg';

      // Update territory
      const positionSelected: PositionDTO =
        this.selectedTerritory?.positions.find((position: PositionDTO) => {
          return position.id == id;
        });

      let baseValue = '';
      if (type.includes('name')) {
        baseValue = positionSelected.name;
        positionSelected.name = inputPosition.value;
        paragraph.textContent = positionSelected.name;
      } else if (type.includes('organization')) {
        baseValue = positionSelected.organization;
        positionSelected.organization = inputPosition.value;
        paragraph.textContent = positionSelected.organization;
      }

      if (paragraph.textContent == '') paragraph.textContent = '-';

      inputPosition.value = '';

      if (paragraph.textContent != baseValue) {
        const territoryPosition: PositionTerritory = {
          territory: this.selectedTerritory,
          position: positionSelected
        };
        this.territoriesPositionsToUpdate.push(territoryPosition);
      }
    }
  }

  private updateTerritoryPosition(
    territory: TerritoryDTO,
    position: PositionDTO
  ): Promise<PositionDTO | null> {
    return new Promise((resolve) => {
      this.userService.updateTerritoryPositions(position).subscribe({
        next: (positionDTO: PositionDTO) => {
          resolve(positionDTO);
        },
        error: () => {
          this.translateService
            .get('profile.territoryManagementUpdateError')
            .subscribe((trad) => {
              this.notificationService.error(trad);
            });
          resolve(null);
        }
      });
    });
  }

  /**
   * Function that look if we are at the bottom of the page
   */
  private isAtBottom(): boolean {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const fullHeight = document.documentElement.scrollHeight;
    const section = document.getElementById('territories-profile-section');
    if (!section) return false;
    const sectionHeight = section.offsetHeight / 3;
    return scrollTop + windowHeight >= fullHeight - sectionHeight;
  }
}

enum ProfileSectionType {
  PROFILE_INFORMATION = 0,
  PROFILE_TERRITORIES = 1
}

enum ScrollButtonIcon {
  SCROLL_BUTTON_DOWN = 'assets/img/arrow_down.svg',
  SCROLL_BUTTON_UP = 'assets/img/arrow_up.svg'
}

interface PositionTerritory {
  territory: TerritoryDTO;
  position: PositionDTO;
}
