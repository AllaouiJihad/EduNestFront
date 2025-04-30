export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone?: string;
  active: boolean;
  verified: boolean;
  role: UserRole;
}
export enum UserRole {
  MEMBER = 'MEMBER',
  SCHOOL_STAFF = 'SCHOOL_STAFF',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  ADMIN = 'ADMIN'
}
