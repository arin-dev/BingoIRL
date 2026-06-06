import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const jwtToken = req.header('Authorization');

  if (!jwtToken || !jwtToken.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied' });
  }

  const token = jwtToken.replace('Bearer ', '');
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET as string);
    if (typeof verified === 'object' && verified !== null) {
      req.userDetails = verified as { userId: number; username: string };
      next();
    } else {
      return res.status(400).json({ error: 'Invalid token' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};
