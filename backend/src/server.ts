import express, { Express, Request, Response, RequestHandler } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './../routes/auth';
import gameRoutes from './../routes/game';
import { auth } from './../middlewares/authMiddleware';
import User from './../models/User';

interface AuthRequest extends Request {
  userDetails?:{
    userId: string,
    username: string;
  }
}

dotenv.config();
const app: Express = express();
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

app.get('/api/protected', auth, async (req: AuthRequest, res: Response) => {
  console.log("At Protected Path!")
  if (req.userDetails) {
    console.log(req.userDetails.username);
    const user = await User.findById(req.userDetails.userId).select('-password'); 
    if (user) {
      res.json({ message: 'This is a protected route', user });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});