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
  createDate: Date;
}
