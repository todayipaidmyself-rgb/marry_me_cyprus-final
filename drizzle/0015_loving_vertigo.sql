ALTER TABLE `users` ADD `userRole` enum('bride','groom','planner','family_member');--> statement-breakpoint
ALTER TABLE `users` ADD `intentReason` enum('planning','helping','inspiration','guest_management');--> statement-breakpoint
ALTER TABLE `users` ADD `priorities` text;--> statement-breakpoint
ALTER TABLE `users` ADD `preEnrollmentCompleted` tinyint DEFAULT 0 NOT NULL;