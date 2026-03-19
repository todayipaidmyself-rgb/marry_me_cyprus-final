CREATE TABLE `inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`venueId` varchar(100),
	`collectionId` varchar(100),
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(50),
	`weddingDate` varchar(50),
	`guestCount` int,
	`message` text NOT NULL,
	`status` enum('pending','contacted','booked') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inquiries_id` PRIMARY KEY(`id`)
);
