import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists. Please login or try a different username.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword },
    });
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
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );
    const currentGames = await prisma.userGame.findMany({
      where: { userId: user.id },
      select: { gameId: true, name: true },
    });
    res.json({ token, username: user.username, currentGames });
  } catch (error) {
    res.status(500).json({ error: 'Issues with the server, please try again later!' });
  }
});

export default router;
