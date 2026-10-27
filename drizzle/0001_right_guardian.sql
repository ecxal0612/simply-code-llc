CREATE TABLE "simplycode_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"name" varchar(256),
	"size" integer,
	"mime_type" varchar(255),
	"post_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "simplycode_images" ADD CONSTRAINT "simplycode_images_post_id_simplycode_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."simplycode_posts"("id") ON DELETE cascade ON UPDATE no action;