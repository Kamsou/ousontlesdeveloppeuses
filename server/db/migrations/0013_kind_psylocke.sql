CREATE TABLE `comment_reads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`developer_id` integer NOT NULL,
	`comment_id` integer NOT NULL,
	`read_at` integer,
	FOREIGN KEY (`developer_id`) REFERENCES `developers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE cascade
);
