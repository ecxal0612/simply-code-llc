ALTER TABLE "simplycode_pages" ADD COLUMN "created_by_id" uuid;--> statement-breakpoint
ALTER TABLE "simplycode_pages" ADD CONSTRAINT "simplycode_pages_created_by_id_simplycode_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."simplycode_users"("id") ON DELETE set null ON UPDATE no action;
