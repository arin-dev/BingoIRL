import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
    userDetails?: jwt.JwtPayload;
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const jwtToken = req.header('Authorization');

  if (!jwtToken || !jwtToken.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied' });
  }
    const token = jwtToken.replace('Bearer ', '');
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET as string);
      console.log("Getting tokens verified! at AUTH MIDDLEWARE! ", token, verified);

      if (typeof verified === 'object' && verified !== null) {
      req.userDetails = verified;
      console.log(" Verified User at Auth : ", req.userDetails);
      next();
    } else {
      return res.status(400).json({ error: 'Invalid token' });}
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

//  Create a middleWare to sanitize the data in API
//  Create a middleWare to make sure only the owner of the game can make changes to the database. Validate using JWT Token