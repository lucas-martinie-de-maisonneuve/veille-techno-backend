import { Request } from 'express';
import { UserRole } from '@/users/entities/user.entity';

export interface JwtUser {
  id: string;
  role: UserRole;
}

export type AuthRequest = Request & { user: JwtUser };
