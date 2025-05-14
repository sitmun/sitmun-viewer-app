import { StringUtils } from '@ui/util/helpers';

// TODO just an example
export interface UserDto {
  id: number;
  email: string;
  name: string;
  surname: string;
  username: string;
}

export class UserUtils {
  static userFullName(u: UserDto): string {
    const parts = [];
    if (u) {
      parts.push(u.name);
      parts.push(u.surname);
    }
    return parts.filter((s) => StringUtils.isNotEmpty(s)).join(' ');
  }

  static fullName(name: string, surname: string): string {
    const parts = [];
    parts.push(name);
    parts.push(surname);
    return parts.filter((s) => StringUtils.isNotEmpty(s)).join(' ');
  }
}
