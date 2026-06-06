CREATE TABLE `games` (
	`id` varchar(36) NOT NULL,
	`name` varchar(191) NOT NULL,
	`gameSize` int NOT NULL DEFAULT 3,
	`prize` varchar(191),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdById` int NOT NULL,
	`winnerId` int,
	`winnerAnsId` int,
	CONSTRAINT `games_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playerGames` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playerId` int NOT NULL,
	`gameId` varchar(36) NOT NULL,
	`gameSize` int NOT NULL,
	`entries` text NOT NULL,
	`bingo` int NOT NULL DEFAULT 0,
	CONSTRAINT `playerGames_id` PRIMARY KEY(`id`),
	CONSTRAINT `pg_player_game` UNIQUE(`playerId`,`gameId`)
);
--> statement-breakpoint
CREATE TABLE `userGames` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`gameId` varchar(36) NOT NULL,
	`name` varchar(191) NOT NULL,
	CONSTRAINT `userGames_id` PRIMARY KEY(`id`),
	CONSTRAINT `ug_user_game` UNIQUE(`userId`,`gameId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(191) NOT NULL,
	`password` varchar(191) NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
ALTER TABLE `games` ADD CONSTRAINT `games_createdById_users_id_fk` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `games` ADD CONSTRAINT `games_winnerId_users_id_fk` FOREIGN KEY (`winnerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `playerGames` ADD CONSTRAINT `playerGames_playerId_users_id_fk` FOREIGN KEY (`playerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `playerGames` ADD CONSTRAINT `playerGames_gameId_games_id_fk` FOREIGN KEY (`gameId`) REFERENCES `games`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userGames` ADD CONSTRAINT `userGames_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userGames` ADD CONSTRAINT `userGames_gameId_games_id_fk` FOREIGN KEY (`gameId`) REFERENCES `games`(`id`) ON DELETE cascade ON UPDATE no action;