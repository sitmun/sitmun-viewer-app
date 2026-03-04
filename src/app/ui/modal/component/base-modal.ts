export enum Mode {
  Add = 'add',
  Edit = 'edit',
  Delete = 'delete',
  Read = 'read',
  ReadOnly = 'readonly',
  Submit = 'submit',
  Subscribe = 'subscribe'
}

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
