CREATE TABLE `contact_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sender_id` integer NOT NULL,
	`recipient_id` integer NOT NULL,
	`help_request_id` integer,
	`message` text NOT NULL,
	`status` text DEFAULT 'sent' NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`sender_id`) REFERENCES `developers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recipient_id`) REFERENCES `developers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`help_request_id`) REFERENCES `help_requests`(`id`) ON UPDATE no action ON DELETE set null
);
