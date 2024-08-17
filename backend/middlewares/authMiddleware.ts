import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
    User?: jwt.JwtPayload;
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET as string);
    
    if (typeof verified === 'string') {
        return res.status(400).json({ error: 'Invalid token' });
    }

    req.User = verified.User;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};
