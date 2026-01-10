CREATE TABLE `companies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`logo_url` text,
	`website` text,
	`description` text,
	`location` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `company_reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company_id` integer NOT NULL,
	`developer_id` integer NOT NULL,
	`rating` integer NOT NULL,
	`is_inclusive` integer NOT NULL,
	`comment` text,
	`created_at` integer,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`developer_id`) REFERENCES `developers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `developer_open_to` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`developer_id` integer NOT NULL,
	`type` text NOT NULL,
	FOREIGN KEY (`developer_id`) REFERENCES `developers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `developer_skills` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`developer_id` integer NOT NULL,
	`skill_name` text NOT NULL,
	FOREIGN KEY (`developer_id`) REFERENCES `developers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `developers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`github_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`avatar_url` text,
	`bio` text,
	`location` text,
	`years_experience` integer,
	`website` text,
	`github_url` text,
	`linkedin_url` text,
	`twitter_url` text,
	`profile_type` text,
	`profile_phrase` text,
	`is_admin` integer DEFAULT false,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `developers_github_id_unique` ON `developers` (`github_id`);--> statement-breakpoint
CREATE TABLE `speaker_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`developer_id` integer NOT NULL,
	`topics` text,
	`past_talks_url` text,
	`available` integer DEFAULT true,
	`travel_willing` integer DEFAULT false,
	`remote_ok` integer DEFAULT true,
	FOREIGN KEY (`developer_id`) REFERENCES `developers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `speaker_profiles_developer_id_unique` ON `speaker_profiles` (`developer_id`);