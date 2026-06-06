import express, { Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './../routes/auth';
import gameRoutes from './../routes/game';
import { auth } from './../middlewares/authMiddleware';
import { prisma } from './../prisma/client';
import { AuthRequest } from './../types';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

app.get('/api/protected', auth, async (req: AuthRequest, res: Response) => {
  if (!req.userDetails) return res.status(401).json({ message: 'Unauthorized' });
  const user = await prisma.user.findUnique({
    where: { id: req.userDetails.userId },
    select: { id: true, username: true },
  });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'This is a protected route', user });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
