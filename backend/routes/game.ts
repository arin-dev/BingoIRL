import express, { Response } from 'express';
import { prisma } from '../prisma/client';
import { auth } from '../middlewares/authMiddleware';
import { checkForBingo } from '../utils/bingoUtils';
import { AuthRequest } from '../types';

type BingoEntry = { text: string; tick: boolean };
type BingoGrid = BingoEntry[][];

const router = express.Router();

// Create a new game and register the creator with their card in one transaction
router.post('/create-game', auth, async (req: AuthRequest, res: Response) => {
  if (!req.userDetails) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { name, gameSize, prize, playerEntries } = req.body;
    const userId = req.userDetails.userId;

    const entries: BingoGrid = playerEntries.map((row: string[]) =>
      row.map((text: string) => ({ text, tick: false }))
    );

    const game = await prisma.game.create({
      data: {
        name,
        gameSize,
        prize,
        createdById: userId,
        registeredPlayers: { create: { userId, name } },
        playerGames: {
          create: { playerId: userId, gameSize, entries: JSON.stringify(entries) },
        },
      },
    });

    res.json({ message: 'Game created successfully!', gameId: game.id });
  } catch (error) {
    res.status(500).json({ error: 'Error creating game' });
  }
});

// Join an existing game with the player's own bingo card
router.post('/register-for-game/:gameId', auth, async (req: AuthRequest, res: Response) => {
  if (!req.userDetails) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const gameId = parseInt(req.params.gameId);
    const userId = req.userDetails.userId;
    const { data } = req.body;

    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) return res.status(404).json({ error: 'Game not found' });

    const entries: BingoGrid = data.map((row: string[]) =>
      row.map((text: string) => ({ text, tick: false }))
    );

    // Single transaction: create player card + register in game
    await prisma.$transaction([
      prisma.playerGame.create({
        data: { playerId: userId, gameId, gameSize: game.gameSize, entries: JSON.stringify(entries) },
      }),
      prisma.userGame.create({
        data: { userId, gameId, name: game.name },
      }),
    ]);

    res.json({ message: 'Registration Successful!' });
  } catch (error) {
    res.status(400).json({ error: 'Error registering for the game' });
  }
});

// Tick cells on a player's card and check for bingo
// Bug fix: now scoped to the requesting user's card (was finding any player's card before)
router.patch('/update-bingo/:gameId', auth, async (req: AuthRequest, res: Response) => {
  if (!req.userDetails) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const gameId = parseInt(req.params.gameId);
    const userId = req.userDetails.userId;

    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) return res.status(404).json({ error: 'Game not found' });
    if (game.winnerId) return res.json({ message: 'Game is already finished!', winner: game });

    // Scoped to this player's card via composite unique key
    const playerGameRecord = await prisma.playerGame.findUnique({
      where: { playerId_gameId: { playerId: userId, gameId } },
    });
    if (!playerGameRecord) return res.status(404).json({ error: 'Player game not found' });

    const entries: BingoGrid = JSON.parse(playerGameRecord.entries);
    const { updates } = req.body;
    if (updates) {
      updates.forEach((entry: { rowIndex: number; colIndex: number; tick: boolean }) => {
        entries[entry.rowIndex][entry.colIndex].tick = entry.tick;
      });
    }

    const bingo = checkForBingo(entries, playerGameRecord.gameSize);

    await prisma.playerGame.update({
      where: { playerId_gameId: { playerId: userId, gameId } },
      data: { entries: JSON.stringify(entries), bingo },
    });

    if (bingo >= playerGameRecord.gameSize) {
      await prisma.game.update({
        where: { id: gameId },
        data: { winnerId: userId, winnerAnsId: playerGameRecord.id },
      });
      const winner = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true },
      });
      return res.json({ redirect: 'reload', message: 'Hurray you won!', winner: winner?.username });
    }

    res.json({ message: 'Bingo check complete', bingo });
  } catch (error) {
    res.status(400).json({ error: 'Error marking as completed!' });
  }
});

// Delete a game — cascade in schema handles PlayerGame and UserGame cleanup
router.delete('/delete-game/:gameId', auth, async (req: AuthRequest, res: Response) => {
  if (!req.userDetails) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const gameId = parseInt(req.params.gameId);
    await prisma.game.delete({ where: { id: gameId } });
    res.json({ message: 'Game deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting game!' });
  }
});

export default router;
