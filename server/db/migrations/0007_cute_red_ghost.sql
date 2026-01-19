CREATE TABLE `side_project_techs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`side_project_id` integer NOT NULL,
	`tech_name` text NOT NULL,
	FOREIGN KEY (`side_project_id`) REFERENCES `side_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `side_projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`developer_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`repo_url` text,
	`status` text DEFAULT 'looking_for_contributors' NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`developer_id`) REFERENCES `developers`(`id`) ON UPDATE no action ON DELETE cascade
);
