import { Role } from '../constants/roles';

export interface AuthenticatedUser {
  userId: number;
  email: string;
  role: Role;
}
