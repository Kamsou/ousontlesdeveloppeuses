CREATE TABLE `account_deletion_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`month` text NOT NULL,
	`deleted_by` text NOT NULL,
	`count` integer NOT NULL DEFAULT 0
);
--> statement-breakpoint
CREATE UNIQUE INDEX `account_deletion_stats_month_deleted_by_unique` ON `account_deletion_stats` (`month`,`deleted_by`);
