CREATE TABLE `account_deletion_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`month` text NOT NULL,
	`deleted_by` text NOT NULL,
	`count` integer NOT NULL DEFAULT 0
);
