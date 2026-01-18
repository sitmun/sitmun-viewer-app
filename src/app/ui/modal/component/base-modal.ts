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
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected constructor() {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected refresh(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected onClose(): void {}
}
