CREATE TABLE `help_request_techs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`help_request_id` integer NOT NULL,
	`tech_name` text NOT NULL,
	FOREIGN KEY (`help_request_id`) REFERENCES `help_requests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `help_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`developer_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`help_type` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`developer_id`) REFERENCES `developers`(`id`) ON UPDATE no action ON DELETE cascade
);
