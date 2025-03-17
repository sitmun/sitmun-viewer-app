import { TranslateService } from '@ngx-translate/core';
import { AuthenticationRequest } from '@auth/authentication.options';
import { Component } from '@angular/core';
import { TerritoryDTO } from '@api/model/territories';
import { UserDto } from '@api/model/user';
import { UserService } from '@api/services/user.service';
import { NotificationService } from 'src/app/notifications/services/NotificationService';
import { VerifyAccountService } from '@auth/services/verifyAccount.service';
import { PositionDTO } from '@api/model/position';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  readonly TERRITORIES_LIMIT : number = 3;
  displayPopup: boolean = false;
  selectedTerritory?: any;
  passwordField : string = "";
  hidenPassword = "*************";
  copyUserProfile!: UserDto;
  userProfile: UserDto = {
    id: 0,
    mail: "",
    username: "",
    password: "",
    passwordSet: false,
    firstname: "",
    lastname: "",
    identificationNumber: 0,
    identificationType: "",
    administrator: false,
    blocked: false,
    generic: false,
    createDate: new Date(),
  };
  territories : Array<TerritoryDTO> = [];
  fieldCurrentlyUpdating = false;

  constructor(
    private userService : UserService,
    private readonly notificationService : NotificationService,
    private verificationAccountService : VerifyAccountService<unknown>,
    private translateService : TranslateService
  ) {}

  ngOnInit() {
    this.getUserDetails();

    // Get selected territory
    if(this.territories.length > 0)
      this.selectedTerritory = this.territories[0];
  }

  /**
   * Get details of the connected user
   */
  private getUserDetails(): void{
    // User details
    this.userService.getUserDetails().subscribe({
      next: (res : UserDto) => {
        this.userProfile = res;
        this.copyUserProfile = structuredClone(this.userProfile);
      }
    });

    // User territories
    this.userService.getUserTerritories().subscribe({
      next: (res : any) => {
        res.content.forEach((element : TerritoryDTO) => {
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
    if (event.target) { // select box territory
      const selectedValue = event.target.value;
      this.selectedTerritory = this.territories.find(territory => territory.name === selectedValue);
    } else { // button select territory
      this.selectedTerritory = event;
    }
  }

  editEmailInformation(value: string) {
    const regexp = new RegExp(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    if(!regexp.test(value)) {
      this.translateService.get('profile.mailErrorFormat').subscribe((trad) => {
        this.notificationService.error(trad);
      });
    } else {
      this.verificationAccountService.emailVerification(value).subscribe({
        next: (emailAlreadyExist : any) => {
          if(!emailAlreadyExist){ // update email if not used by another one
            this.userProfile.mail = value;
            this.userProfile = { ...this.userProfile, mail: value };
          }
          else{
            this.translateService.get('profile.emailAlreadyExistError').subscribe((trad) => {
              this.notificationService.error(trad);
            });
          }
        },
        error: () => {
          this.translateService.get('profile.userUpdateError').subscribe((trad) => {
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
    if(this.userProfile.mail != this.copyUserProfile.mail || this.userProfile.password != this.copyUserProfile.password) {
      this.displayPopup = true;
    }
    else {
      this.translateService.get('profile.noUpdate').subscribe((trad) => {
        this.notificationService.warning(trad);
      });
    }
  }

  HidePopupSaveProfile() {
    this.displayPopup = false;
  }

  saveProfile() {
    const req : AuthenticationRequest = {
      username: this.userProfile.username,
      password: this.passwordField
    };

    // Verify password of the user
    this.verificationAccountService.passwordVerification(req).subscribe(({
      next:(res) => {
        // Update user
        this.userService.updateUserAccount(this.userProfile).subscribe(({
          next: (res) => {
            this.translateService.get('profile.informationsUpdated').subscribe((trad) => {
              this.notificationService.success(trad);
            });
            this.copyUserProfile = this.userProfile;
          },
          error: () => {
            this.translateService.get('profile.userUpdateError').subscribe((trad) => {
              this.notificationService.error(trad);
            });
          }
        }));
      },
      error: () => {
        this.translateService.get('profile.dataValidationError').subscribe((trad) => {
          this.notificationService.error(trad);
        });
      }
    }));

    this.passwordField = "";
    this.HidePopupSaveProfile();
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
  changeValue(id : number, value: string, type: string) {
    let territoryTdElement : HTMLTableCellElement = document.getElementById(type+id) as HTMLTableCellElement;
    let inputPosition = territoryTdElement.querySelector('input');
    if(!inputPosition){
      throw Error();
    }

    let paragraph = territoryTdElement.querySelector('p') as HTMLParagraphElement;
    let img = territoryTdElement.querySelector('button')?.children[0] as HTMLImageElement;

    if(inputPosition.hidden) { // Display input & hide paragraph
      inputPosition.hidden = false;
      inputPosition.value = value ?? "";
      paragraph.hidden = true;
      img.src = 'assets/img/Icona-comprovar-naranja.svg';
    }
    else { // Hide input, display paragraph & save values
      inputPosition.hidden = true;
      paragraph.hidden = false;
      img.src = 'assets/img/Icona-modificar-naranja.svg';

      // Update territory
      let positionSelected : PositionDTO = this.selectedTerritory?.positions.find((position : PositionDTO) => {
        return position.id == id;
      });

      let baseValue = "";
      if(type.includes("name")){
        baseValue = positionSelected.name;
        positionSelected.name = inputPosition.value;
        paragraph.textContent = positionSelected.name;
      }
      else if(type.includes("organization")){
        baseValue = positionSelected.organization;
        positionSelected.organization = inputPosition.value;
        paragraph.textContent = positionSelected.organization;
      }

      if(paragraph.textContent == "")
        paragraph.textContent = "-"

      inputPosition.value = "";

      if (paragraph.textContent != baseValue) {
        this.updateTerritoryPosition(this.selectedTerritory, positionSelected).then((newPosition) => {
          if (newPosition != null) {
            positionSelected = newPosition;
          }
        });
      }
    }
  }

  private updateTerritoryPosition(territory : TerritoryDTO, position : PositionDTO) : Promise<PositionDTO | null> {
    return new Promise((resolve) => {
      this.userService.updateTerritoryPositions(position).subscribe({
        next: (positionDTO: PositionDTO) => {
          this.translateService.get('profile.territoryManagementUpdateSucess').subscribe((trad) => {
            this.notificationService.success(trad);
          });
          resolve(positionDTO);
        },
        error: () => {
          this.translateService.get('profile.territoryManagementUpdateError').subscribe((trad) => {
            this.notificationService.error(trad);
          });
          resolve(null);
        }
      });
    });
  }
}
