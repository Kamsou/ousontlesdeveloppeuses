CREATE TABLE `comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`developer_id` integer NOT NULL,
	`help_request_id` integer,
	`side_project_id` integer,
	`content` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`developer_id`) REFERENCES `developers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`help_request_id`) REFERENCES `help_requests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`side_project_id`) REFERENCES `side_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
