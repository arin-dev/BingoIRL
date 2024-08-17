import express, { Express, Request, Response, RequestHandler } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './../routes/auth';
import { auth } from './../middlewares/authMiddleware';
import User from './../models/User';


interface AuthRequest extends Request {
  user?: typeof User;
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

app.get('/api/protected', auth, (req: AuthRequest, res: Response) => {
  // Access the user property here
  res.json({ message: 'This is a protected route', user: req.user });
});
// Define routes here

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});