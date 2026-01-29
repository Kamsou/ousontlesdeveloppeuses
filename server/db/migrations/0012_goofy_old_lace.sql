ALTER TABLE `developers` ADD `slug` text;--> statement-breakpoint
UPDATE `developers` SET `slug` = LOWER(REPLACE(REPLACE(REPLACE(TRIM(`name`), ' ', '-'), '''', ''), '.', ''));--> statement-breakpoint
CREATE UNIQUE INDEX `developers_slug_unique` ON `developers` (`slug`);