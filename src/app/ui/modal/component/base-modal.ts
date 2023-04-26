import { takeUntil } from 'rxjs/operators';

export enum Mode {
  Add = 'add',
  Edit = 'edit',
  Delete = 'delete',
  Read = 'read',
  ReadOnly = 'readonly',
  Submit = 'submit',
  Subscribe = 'subscribe'
}

export type ModalModesCRU = Mode.Add | Mode.Edit | Mode.Read | Mode.ReadOnly;

/*
 * Extending components should inject required services.
 *
 *  - AuthenticationService: ¿if using profile/role methods?
 *  - MessageService: if using setupErrors()
 *  - ModalTabService: if using setupTabs() and isSelectedTab()
 */
export abstract class BaseModal {
  protected constructor() {}

  protected refresh(): void {}

  protected onClose(): void {}
}
