CREATE TABLE IF NOT EXISTS "simplycode_site_settings" (
	"singleton" varchar(16) PRIMARY KEY DEFAULT 'default' NOT NULL,
	"header_nav_paths" text[] DEFAULT '{}'::text[] NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
