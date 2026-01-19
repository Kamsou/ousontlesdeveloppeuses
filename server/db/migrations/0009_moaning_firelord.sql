PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_side_projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`developer_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`repo_url` text,
	`website_url` text,
	`status` text DEFAULT 'open_to_contributors' NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`developer_id`) REFERENCES `developers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_side_projects`("id", "developer_id", "title", "description", "repo_url", "website_url", "status", "created_at", "updated_at") SELECT "id", "developer_id", "title", "description", "repo_url", "website_url", "status", "created_at", "updated_at" FROM `side_projects`;--> statement-breakpoint
DROP TABLE `side_projects`;--> statement-breakpoint
ALTER TABLE `__new_side_projects` RENAME TO `side_projects`;--> statement-breakpoint
PRAGMA foreign_keys=ON;