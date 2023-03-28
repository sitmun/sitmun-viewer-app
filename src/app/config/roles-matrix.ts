// TODO pending specific details

export enum UserRoles {
  USER = 'USER'
}

export type Roles = UserRoles;

// Validación de rol incluido
export function hasRole(
  expectedRoles: Roles | Roles[],
  userRoles: Roles[]
): boolean {
  if (Array.isArray(expectedRoles)) {
    for (const expectedRole of expectedRoles) {
      if (userRoles.includes(expectedRole)) {
        return true;
      }
    }
    return false;
  } else {
    return userRoles.includes(expectedRoles);
  }
}
