import { mysqlTable, varchar, int, text, timestamp, uniqueIndex } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id:       int('id').primaryKey().autoincrement(),
  username: varchar('username', { length: 191 }).notNull().unique(),
  password: varchar('password', { length: 191 }).notNull(),
});

export const games = mysqlTable('games', {
  id:          varchar('id', { length: 36 }).primaryKey(),
  name:        varchar('name', { length: 191 }).notNull(),
  gameSize:    int('gameSize').notNull().default(3),
  prize:       varchar('prize', { length: 191 }),
  createdAt:   timestamp('createdAt').defaultNow().notNull(),
  updatedAt:   timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  createdById: int('createdById').notNull().references(() => users.id),
  winnerId:    int('winnerId').references(() => users.id),
  winnerAnsId: int('winnerAnsId'),
});

export const userGames = mysqlTable('userGames', {
  id:     int('id').primaryKey().autoincrement(),
  userId: int('userId').notNull().references(() => users.id),
  gameId: varchar('gameId', { length: 36 }).notNull().references(() => games.id, { onDelete: 'cascade' }),
  name:   varchar('name', { length: 191 }).notNull(),
}, (t) => [
  uniqueIndex('ug_user_game').on(t.userId, t.gameId),
]);

export const playerGames = mysqlTable('playerGames', {
  id:       int('id').primaryKey().autoincrement(),
  playerId: int('playerId').notNull().references(() => users.id),
  gameId:   varchar('gameId', { length: 36 }).notNull().references(() => games.id, { onDelete: 'cascade' }),
  gameSize: int('gameSize').notNull(),
  entries:  text('entries').notNull(),
  bingo:    int('bingo').notNull().default(0),
}, (t) => [
  uniqueIndex('pg_player_game').on(t.playerId, t.gameId),
]);
