CREATE TABLE `shareLinks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`shareToken` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`viewCount` int NOT NULL DEFAULT 0,
	CONSTRAINT `shareLinks_id` PRIMARY KEY(`id`),
	CONSTRAINT `shareLinks_shareToken_unique` UNIQUE(`shareToken`)
);
