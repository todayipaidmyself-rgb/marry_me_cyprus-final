CREATE TABLE `planningTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`timeframe` varchar(100) NOT NULL,
	`isCompleted` int NOT NULL DEFAULT 0,
	`dueOffsetInDays` int,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `planningTasks_id` PRIMARY KEY(`id`)
);
