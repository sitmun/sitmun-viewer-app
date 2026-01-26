import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { NotificationService } from 'src/app/notifications/services/NotificationService';

@Component({
  standalone: false,
  selector: 'app-profile-information',
  templateUrl: './profile-information.component.html',
  styleUrls: ['./profile-information.component.scss']
})
export class ProfileInformationComponent implements OnInit {
  readonly ICONE_VALIDATION: string = 'assets/img/Icona-comprovar-naranja.svg';
  readonly ICONE_MODIFICATION: string =
    'assets/img/Icona-modificar-naranja.svg';
  readonly PROFILE_VALUE_MAX_CHARACTER: number = 25; // max character to display
  editionActive = false;
  newProfileValue: string | undefined;

  @Input() profile_icon_url: string | undefined;
  @Input() profile_description: string | undefined;
  @Input() profile_value: string | undefined;
  @Input() is_profile_editable = false;
  @Input() input_type = 'text';

  @Output() new_value = new EventEmitter<string>();

  constructor(private readonly notificationService: NotificationService) {}

  ngOnInit() {
    this.newProfileValue = this.profile_value
      ? structuredClone(this.profile_value)
      : '';
  }

  setEditionToActive() {
    this.newProfileValue = this.profile_value
      ? structuredClone(this.profile_value)
      : '';
    if (this.input_type === 'password') {
      this.newProfileValue = '';
    }
    this.editionActive = true;
  }

  setEditionNotActive() {
    this.editionActive = false;
  }

  editInformation(): void {
    if (this.newProfileValue == '') {
      this.notificationService.warning('Need to enter a value');
    } else {
      this.setEditionNotActive();
      this.new_value.emit(this.newProfileValue);
    }
  }
}
