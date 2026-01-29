CREATE TABLE `offers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`developer_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`url` text,
	`type` text NOT NULL,
	`location` text,
	`verified` integer DEFAULT false,
	`created_at` integer,
	FOREIGN KEY (`developer_id`) REFERENCES `developers`(`id`) ON UPDATE no action ON DELETE cascade
);
