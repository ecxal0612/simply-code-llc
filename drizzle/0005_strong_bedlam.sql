CREATE TYPE "public"."simplycode_contact_message_status" AS ENUM('new', 'replied');--> statement-breakpoint
CREATE TABLE "simplycode_contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"email" varchar(320) NOT NULL,
	"company" varchar(200),
	"project_type" varchar(200) NOT NULL,
	"budget" varchar(200),
	"details" text NOT NULL,
	"status" "simplycode_contact_message_status" DEFAULT 'new' NOT NULL,
	"reply_body" text,
	"replied_at" timestamp with time zone,
	"reply_email_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX "simplycode_contact_messages_status_created_at_idx" ON "simplycode_contact_messages" USING btree ("status","created_at");