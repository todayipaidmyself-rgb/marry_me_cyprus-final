CREATE TABLE `venueFavorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`venueId` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `venueFavorites_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_venue_unique` UNIQUE(`userId`,`venueId`)
);
