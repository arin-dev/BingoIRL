import express, { Response } from 'express';
import { eq, and, ne } from 'drizzle-orm';
import { db } from '../db';
import { games, userGames, playerGames, users } from '../db/schema';
import { auth } from '../middlewares/authMiddleware';
import { checkForBingo } from '../utils/bingoUtils';
import { AuthRequest } from '../types';

type BingoEntry = { text: string; tick: boolean };

const router = express.Router();

router.post('/create-game', auth, async (req: AuthRequest, res: Response) => {
  if (!req.userDetails) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { name, gameSize, prize, playerEntries } = req.body;
    const userId = req.userDetails.userId;
    const gameId = crypto.randomUUID();

    const entries: BingoEntry[][] = playerEntries.map((row: string[]) =>
      row.map((text: string) => ({ text, tick: false }))
    );

    await db.transaction(async (tx) => {
      await tx.insert(games).values({ id: gameId, name, gameSize, prize: prize || null, createdById: userId });
      await tx.insert(userGames).values({ userId, gameId, name });
      await tx.insert(playerGames).values({ playerId: userId, gameId, gameSize, entries: JSON.stringify(entries) });
    });

    res.json({ message: 'Game created successfully!', gameId });
  } catch (error) {
    res.status(500).json({ error: 'Error creating game' });
  }
});

router.post('/register-for-game/:gameId', auth, async (req: AuthRequest, res: Response) => {
  if (!req.userDetails) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const gameId = req.params.gameId;
    const userId = req.userDetails.userId;
    const { data } = req.body;

    const [game] = await db.select().from(games).where(eq(games.id, gameId));
    if (!game) return res.status(404).json({ error: 'Game not found' });

    const entries: BingoEntry[][] = data.map((row: string[]) =>
      row.map((text: string) => ({ text, tick: false }))
    );

    await db.transaction(async (tx) => {
      await tx.insert(playerGames).values({ playerId: userId, gameId, gameSize: game.gameSize, entries: JSON.stringify(entries) });
      await tx.insert(userGames).values({ userId, gameId, name: game.name });
    });

    res.json({ message: 'Registration Successful!' });
  } catch (error) {
    res.status(400).json({ error: 'Error registering for the game' });
  }
});

router.patch('/update-bingo/:gameId', auth, async (req: AuthRequest, res: Response) => {
  if (!req.userDetails) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const gameId = req.params.gameId;
    const userId = req.userDetails.userId;

    const [game] = await db.select().from(games).where(eq(games.id, gameId));
    if (!game) return res.status(404).json({ error: 'Game not found' });
    if (game.winnerId) return res.json({ message: 'Game is already finished!', winner: game });

    const [playerGameRecord] = await db.select().from(playerGames)
      .where(and(eq(playerGames.playerId, userId), eq(playerGames.gameId, gameId)));
    if (!playerGameRecord) return res.status(404).json({ error: 'Player game not found' });

    const entries: BingoEntry[][] = JSON.parse(playerGameRecord.entries);
    const { updates } = req.body;
    if (updates) {
      updates.forEach((u: { rowIndex: number; colIndex: number; tick: boolean }) => {
        entries[u.rowIndex][u.colIndex].tick = u.tick;
      });
    }

    const bingo = checkForBingo(entries, playerGameRecord.gameSize);

    await db.update(playerGames)
      .set({ entries: JSON.stringify(entries), bingo })
      .where(and(eq(playerGames.playerId, userId), eq(playerGames.gameId, gameId)));

    if (bingo >= playerGameRecord.gameSize) {
      await db.update(games)
        .set({ winnerId: userId, winnerAnsId: playerGameRecord.id })
        .where(eq(games.id, gameId));

      const [winner] = await db.select({ username: users.username }).from(users).where(eq(users.id, userId));
      return res.json({ redirect: 'reload', message: 'Hurray you won!', winner: winner.username });
    }

    res.json({ message: 'Bingo check complete', bingo });
  } catch (error) {
    res.status(400).json({ error: 'Error marking as completed!' });
  }
});

router.get('/my-games', auth, async (req: AuthRequest, res: Response) => {
  if (!req.userDetails) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const userId = req.userDetails.userId;

    const rows = await db.select({
      gameId:      userGames.gameId,
      name:        userGames.name,
      prize:       games.prize,
      gameSize:    games.gameSize,
      winnerId:    games.winnerId,
      createdById: games.createdById,
    }).from(userGames)
      .innerJoin(games, eq(userGames.gameId, games.id))
      .where(eq(userGames.userId, userId));

    res.json(rows.map(r => ({
      gameId:    r.gameId,
      name:      r.name,
      prize:     r.prize,
      gameSize:  r.gameSize,
      winnerId:  r.winnerId,
      isCreator: r.createdById === userId,
    })));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching games' });
  }
});

router.get('/:gameId/player-card/:username', auth, async (req: AuthRequest, res: Response) => {
  if (!req.userDetails) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { gameId, username } = req.params;
    const userId = req.userDetails.userId;

    const [requesterGame] = await db.select().from(playerGames)
      .where(and(eq(playerGames.playerId, userId), eq(playerGames.gameId, gameId)));
    if (!requesterGame) return res.status(403).json({ error: 'Not in this game' });

    const [targetUser] = await db.select().from(users).where(eq(users.username, username));
    if (!targetUser) return res.status(404).json({ error: 'Player not found' });

    const [targetGame] = await db.select().from(playerGames)
      .where(and(eq(playerGames.playerId, targetUser.id), eq(playerGames.gameId, gameId)));
    if (!targetGame) return res.status(404).json({ error: 'Player not in this game' });

    res.json({ username, bingo: targetGame.bingo, entries: JSON.parse(targetGame.entries) });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching player card' });
  }
});

router.get('/:gameId', auth, async (req: AuthRequest, res: Response) => {
  if (!req.userDetails) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const gameId = req.params.gameId;
    const userId = req.userDetails.userId;

    const [game] = await db.select().from(games).where(eq(games.id, gameId));
    if (!game) return res.status(404).json({ error: 'Game not found' });

    const [creator] = await db.select({ username: users.username }).from(users).where(eq(users.id, game.createdById));

    let winnerUsername: string | null = null;
    if (game.winnerId) {
      const [winner] = await db.select({ username: users.username }).from(users).where(eq(users.id, game.winnerId));
      winnerUsername = winner?.username ?? null;
    }

    const [playerGameRecord] = await db.select().from(playerGames)
      .where(and(eq(playerGames.playerId, userId), eq(playerGames.gameId, gameId)));

    const otherPlayers = await db.select({ username: users.username, bingo: playerGames.bingo })
      .from(playerGames)
      .innerJoin(users, eq(playerGames.playerId, users.id))
      .where(and(eq(playerGames.gameId, gameId), ne(playerGames.playerId, userId)));

    res.json({
      id:        game.id,
      name:      game.name,
      gameSize:  game.gameSize,
      prize:     game.prize,
      createdBy: creator.username,
      winner:    winnerUsername,
      players:   otherPlayers,
      playerGame: playerGameRecord ? {
        id:      playerGameRecord.id,
        entries: JSON.parse(playerGameRecord.entries),
        bingo:   playerGameRecord.bingo,
      } : null,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching game' });
  }
});

router.delete('/delete-game/:gameId', auth, async (req: AuthRequest, res: Response) => {
  if (!req.userDetails) return res.status(401).json({ error: 'Unauthorized' });
  try {
    await db.delete(games).where(eq(games.id, req.params.gameId));
    res.json({ message: 'Game deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting game!' });
  }
});

export default router;
