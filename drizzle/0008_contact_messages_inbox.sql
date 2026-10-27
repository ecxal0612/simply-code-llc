ALTER TYPE "simplycode_contact_message_status" ADD VALUE IF NOT EXISTS 'read';--> statement-breakpoint
ALTER TABLE "simplycode_contact_messages" ADD COLUMN "read_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "simplycode_contact_messages" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
CREATE TABLE "simplycode_contact_message_replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"body" text NOT NULL,
	"sent_by_user_id" uuid,
	"reply_email_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "simplycode_contact_message_replies" ADD CONSTRAINT "simplycode_contact_message_replies_message_id_simplycode_contact_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."simplycode_contact_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simplycode_contact_message_replies" ADD CONSTRAINT "simplycode_contact_message_replies_sent_by_user_id_simplycode_users_id_fk" FOREIGN KEY ("sent_by_user_id") REFERENCES "public"."simplycode_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "simplycode_contact_message_replies_message_created_at_idx" ON "simplycode_contact_message_replies" USING btree ("message_id","created_at");--> statement-breakpoint
CREATE INDEX "simplycode_contact_messages_archived_created_at_idx" ON "simplycode_contact_messages" USING btree ("archived_at","created_at");--> statement-breakpoint
INSERT INTO "simplycode_contact_message_replies" ("message_id", "body", "reply_email_sent_at", "created_at")
SELECT "id", "reply_body", "reply_email_sent_at", COALESCE("replied_at", "updated_at")
FROM "simplycode_contact_messages"
WHERE "reply_body" IS NOT NULL;
