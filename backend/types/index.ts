import { Request } from 'express';

export interface AuthRequest extends Request {
  userDetails?: {
    userId: number;
    username: string;
  };
}
