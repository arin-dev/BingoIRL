import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, userGames } from '../db/schema';

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const router = express.Router();

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  try {
    const { username, password } = parsed.data;

    const [existing] = await db.select().from(users).where(eq(users.username, username));
    if (existing) {
      return res.status(409).json({ error: 'User already exists. Please login or try a different username.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.insert(users).values({ username, password: hashedPassword });

    const [user] = await db.select().from(users).where(eq(users.username, username));
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    res.json({ token, username: user.username, currentGames: [], message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error registering user! Please try again' });
  }
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  try {
    const { username, password } = parsed.data;

    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (!user) return res.status(400).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    const currentGames = await db
      .select({ gameId: userGames.gameId, name: userGames.name })
      .from(userGames)
      .where(eq(userGames.userId, user.id));

    res.json({ token, username: user.username, currentGames });
  } catch (error) {
    res.status(500).json({ error: 'Issues with the server, please try again later!' });
  }
});

export default router;
