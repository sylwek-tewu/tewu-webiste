CREATE TABLE `outbox_meta` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `outbox_records` (
	`id` text PRIMARY KEY NOT NULL,
	`phone` text NOT NULL,
	`slot` text NOT NULL,
	`topic` text,
	`source` text NOT NULL,
	`locale` text NOT NULL,
	`created_at` text NOT NULL,
	`attempts` integer DEFAULT 1 NOT NULL,
	`last_attempt_at` text
);
