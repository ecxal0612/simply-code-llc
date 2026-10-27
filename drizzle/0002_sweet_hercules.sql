CREATE TYPE "public"."simplycode_page_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "simplycode_page_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"key" varchar(128) NOT NULL,
	"label" varchar(256) NOT NULL,
	"kind" varchar(64) NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "simplycode_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(256) NOT NULL,
	"slug" varchar(256) NOT NULL,
	"path" varchar(256) NOT NULL,
	"status" "simplycode_page_status" DEFAULT 'draft' NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"body" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "simplycode_pages_slug_unique" UNIQUE("slug"),
	CONSTRAINT "simplycode_pages_path_unique" UNIQUE("path")
);
--> statement-breakpoint
ALTER TABLE "simplycode_images" ALTER COLUMN "post_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "simplycode_images" ADD COLUMN "page_id" uuid;--> statement-breakpoint
ALTER TABLE "simplycode_images" ADD COLUMN "section_key" varchar(128);--> statement-breakpoint
ALTER TABLE "simplycode_images" ADD COLUMN "slot" varchar(256);--> statement-breakpoint
ALTER TABLE "simplycode_page_sections" ADD CONSTRAINT "simplycode_page_sections_page_id_simplycode_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."simplycode_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "simplycode_page_sections_page_key_unique" ON "simplycode_page_sections" USING btree ("page_id","key");--> statement-breakpoint
ALTER TABLE "simplycode_images" ADD CONSTRAINT "simplycode_images_page_id_simplycode_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."simplycode_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "simplycode_images_slot_unique" ON "simplycode_images" USING btree ("slot");