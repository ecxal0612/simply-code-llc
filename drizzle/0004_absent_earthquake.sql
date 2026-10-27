CREATE TYPE "public"."simplycode_post_status" AS ENUM('draft', 'published');--> statement-breakpoint
ALTER TABLE "simplycode_posts" ADD COLUMN "slug" varchar(256) NOT NULL;--> statement-breakpoint
ALTER TABLE "simplycode_posts" ADD COLUMN "status" "simplycode_post_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "simplycode_posts" ADD COLUMN "categories" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "simplycode_posts" ADD COLUMN "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
CREATE INDEX "simplycode_posts_status_created_at_idx" ON "simplycode_posts" USING btree ("status","created_at");--> statement-breakpoint
ALTER TABLE "simplycode_posts" ADD CONSTRAINT "simplycode_posts_slug_unique" UNIQUE("slug");