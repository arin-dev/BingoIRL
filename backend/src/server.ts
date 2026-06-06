import 'dotenv/config';
import express, { Response } from 'express';
import cors from 'cors';
import { eq } from 'drizzle-orm';
import authRoutes from './../routes/auth';
import gameRoutes from './../routes/game';
import { auth } from './../middlewares/authMiddleware';
import { db } from './../db';
import { users } from './../db/schema';
import { AuthRequest } from './../types';

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigin = process.env.ENV_MODE === 'production'
  ? 'https://bingo-irl.vercel.app'
  : (process.env.ALLOWED_ORIGIN || 'http://localhost:3000');

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

app.get('/api/protected', auth, async (req: AuthRequest, res: Response) => {
  if (!req.userDetails) return res.status(401).json({ message: 'Unauthorized' });
  const [user] = await db.select({ id: users.id, username: users.username })
    .from(users)
    .where(eq(users.id, req.userDetails.userId));
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'This is a protected route', user });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.ENV_MODE || 'development'}]`);
});
