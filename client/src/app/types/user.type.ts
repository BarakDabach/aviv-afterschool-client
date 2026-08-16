import type { AuthRole } from './auth.type';

export type User = {
  fullName: string;
  email: string;
  role: AuthRole;
  phoneNumber?: string;
};
