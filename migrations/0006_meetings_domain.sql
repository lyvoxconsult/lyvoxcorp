-- Migration 0006: Meetings Domain Specialization
-- Creates meeting_notes, meeting_participants, and meeting_transcripts tables

CREATE TABLE IF NOT EXISTS "meeting_notes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "created_by_id" uuid REFERENCES "users"("id"),
  "updated_by_id" uuid REFERENCES "users"("id"),
  "version" integer DEFAULT 1 NOT NULL,
  "meeting_id" uuid NOT NULL REFERENCES "meetings"("id"),
  "notes" text NOT NULL,
  "summary" text,
  "action_items" jsonb DEFAULT '[]'::jsonb NOT NULL,
  CONSTRAINT "meeting_notes_notes_check" CHECK (length(trim("notes")) > 0),
  CONSTRAINT "meeting_notes_version_check" CHECK ("version" > 0)
);

CREATE INDEX IF NOT EXISTS "meeting_notes_meeting_id_idx" ON "meeting_notes" ("meeting_id");
CREATE INDEX IF NOT EXISTS "meeting_notes_deleted_at_idx" ON "meeting_notes" ("deleted_at");

CREATE TABLE IF NOT EXISTS "meeting_participants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "created_by_id" uuid REFERENCES "users"("id"),
  "updated_by_id" uuid REFERENCES "users"("id"),
  "version" integer DEFAULT 1 NOT NULL,
  "meeting_id" uuid NOT NULL REFERENCES "meetings"("id"),
  "user_id" uuid REFERENCES "users"("id"),
  "type" varchar(20) DEFAULT 'INTERNAL' NOT NULL,
  CONSTRAINT "meeting_participants_type_check" CHECK ("type" IN ('CLIENT', 'LEAD', 'INTERNAL')),
  CONSTRAINT "meeting_participants_version_check" CHECK ("version" > 0)
);

CREATE INDEX IF NOT EXISTS "meeting_participants_meeting_id_idx" ON "meeting_participants" ("meeting_id");
CREATE INDEX IF NOT EXISTS "meeting_participants_user_id_idx" ON "meeting_participants" ("user_id");
CREATE INDEX IF NOT EXISTS "meeting_participants_deleted_at_idx" ON "meeting_participants" ("deleted_at");

CREATE TABLE IF NOT EXISTS "meeting_transcripts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "created_by_id" uuid REFERENCES "users"("id"),
  "updated_by_id" uuid REFERENCES "users"("id"),
  "version" integer DEFAULT 1 NOT NULL,
  "meeting_id" uuid NOT NULL REFERENCES "meetings"("id"),
  "raw_transcript" text NOT NULL,
  "summary" text,
  "action_items" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "source" varchar(100) DEFAULT 'MANUAL_UPLOAD' NOT NULL,
  CONSTRAINT "meeting_transcripts_raw_check" CHECK (length(trim("raw_transcript")) > 0),
  CONSTRAINT "meeting_transcripts_version_check" CHECK ("version" > 0)
);

CREATE INDEX IF NOT EXISTS "meeting_transcripts_meeting_id_idx" ON "meeting_transcripts" ("meeting_id");
CREATE INDEX IF NOT EXISTS "meeting_transcripts_deleted_at_idx" ON "meeting_transcripts" ("deleted_at");
