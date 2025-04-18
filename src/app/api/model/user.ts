import { StringUtils } from '@ui/util/helpers';

export interface UserDto {
  id: number;
  email: string;
  username: string;
  password: string;
  passwordSet: boolean;
  firstname: string;
  lastname: string;
  identificationNumber: number;
  identificationType: string;
  administrator: boolean;
  blocked: boolean;
  generic: boolean;
  createDate: Date;
}

export class UserUtils {
  static userFullName(u: UserDto): string {
    const parts = [];
    if (u) {
      parts.push(u.firstname);
      parts.push(u.lastname);
    }
    console.log(parts.filter((s) => StringUtils.isNotEmpty(s)).join(' '));
    return parts.filter((s) => StringUtils.isNotEmpty(s)).join(' ');
  }

  static fullName(firstname: string, lastname: string): string {
    const parts = [];
    parts.push(firstname);
    parts.push(lastname);
    return parts.filter((s) => StringUtils.isNotEmpty(s)).join(' ');
  }
}
