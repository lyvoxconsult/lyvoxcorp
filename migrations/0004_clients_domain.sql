CREATE TABLE "client_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"client_id" uuid NOT NULL,
	"label" varchar(50) DEFAULT 'PRIMARY' NOT NULL,
	"postal_code" varchar(8) NOT NULL,
	"street" varchar(255) NOT NULL,
	"number" varchar(30) NOT NULL,
	"complement" varchar(255),
	"district" varchar(120) NOT NULL,
	"city" varchar(120) NOT NULL,
	"state" varchar(2) NOT NULL,
	"country" varchar(2) DEFAULT 'BR' NOT NULL,
	CONSTRAINT "client_addresses_postal_code_check" CHECK ("client_addresses"."postal_code" ~ '^[0-9]{8}$'),
	CONSTRAINT "client_addresses_state_check" CHECK ("client_addresses"."state" ~ '^[A-Z]{2}$'),
	CONSTRAINT "client_addresses_country_check" CHECK ("client_addresses"."country" ~ '^[A-Z]{2}$'),
	CONSTRAINT "client_addresses_version_check" CHECK ("client_addresses"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "client_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"client_id" uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	"label" varchar(50),
	"value" varchar(255) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	CONSTRAINT "client_contacts_type_check" CHECK ("client_contacts"."type" in ('EMAIL', 'PHONE', 'WHATSAPP', 'OTHER')),
	CONSTRAINT "client_contacts_value_check" CHECK (length(trim("client_contacts"."value")) > 0),
	CONSTRAINT "client_contacts_version_check" CHECK ("client_contacts"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "client_responsibles" (
	"client_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assigned_by_id" uuid,
	CONSTRAINT "client_responsibles_pk" PRIMARY KEY("client_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "client_tag_assignments" (
	"client_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assigned_by_id" uuid,
	CONSTRAINT "client_tag_assignments_pk" PRIMARY KEY("client_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "client_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"name" varchar(50) NOT NULL,
	"normalized_name" varchar(50) NOT NULL,
	CONSTRAINT "client_tags_name_check" CHECK (length(trim("client_tags"."name")) > 0),
	CONSTRAINT "client_tags_version_check" CHECK ("client_tags"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "client_timeline_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"client_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"source_module" varchar(100) NOT NULL,
	"source_entity_type" varchar(100) NOT NULL,
	"source_entity_id" uuid,
	"summary" varchar(255) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "client_timeline_event_type_check" CHECK (length(trim("client_timeline_events"."event_type")) > 0),
	CONSTRAINT "client_timeline_version_check" CHECK ("client_timeline_events"."version" > 0)
);
--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "trade_name" varchar(255);--> statement-breakpoint
UPDATE "clients" SET "document" = regexp_replace("document", '[^0-9]', '', 'g');--> statement-breakpoint
ALTER TABLE "client_addresses" ADD CONSTRAINT "client_addresses_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_addresses" ADD CONSTRAINT "client_addresses_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_addresses" ADD CONSTRAINT "client_addresses_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_contacts" ADD CONSTRAINT "client_contacts_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_contacts" ADD CONSTRAINT "client_contacts_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_contacts" ADD CONSTRAINT "client_contacts_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_responsibles" ADD CONSTRAINT "client_responsibles_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_responsibles" ADD CONSTRAINT "client_responsibles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_responsibles" ADD CONSTRAINT "client_responsibles_assigned_by_id_users_id_fk" FOREIGN KEY ("assigned_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_tag_assignments" ADD CONSTRAINT "client_tag_assignments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_tag_assignments" ADD CONSTRAINT "client_tag_assignments_tag_id_client_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."client_tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_tag_assignments" ADD CONSTRAINT "client_tag_assignments_assigned_by_id_users_id_fk" FOREIGN KEY ("assigned_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_tags" ADD CONSTRAINT "client_tags_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_tags" ADD CONSTRAINT "client_tags_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_timeline_events" ADD CONSTRAINT "client_timeline_events_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_timeline_events" ADD CONSTRAINT "client_timeline_events_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_timeline_events" ADD CONSTRAINT "client_timeline_events_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "client_addresses_client_id_idx" ON "client_addresses" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "client_addresses_deleted_at_idx" ON "client_addresses" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "client_contacts_client_id_idx" ON "client_contacts" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "client_contacts_deleted_at_idx" ON "client_contacts" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "client_responsibles_user_id_idx" ON "client_responsibles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "client_tag_assignments_tag_id_idx" ON "client_tag_assignments" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "client_tags_normalized_name_uidx" ON "client_tags" USING btree ("normalized_name");--> statement-breakpoint
CREATE INDEX "client_tags_name_trgm_idx" ON "client_tags" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "client_tags_deleted_at_idx" ON "client_tags" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "client_timeline_client_occurred_idx" ON "client_timeline_events" USING btree ("client_id","occurred_at","id");--> statement-breakpoint
CREATE INDEX "client_timeline_source_idx" ON "client_timeline_events" USING btree ("source_module","source_entity_type","source_entity_id");--> statement-breakpoint
CREATE INDEX "client_timeline_deleted_at_idx" ON "client_timeline_events" USING btree ("deleted_at");--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_document_check" CHECK (("clients"."type" = 'PF' and "clients"."document" ~ '^[0-9]{11}$') or ("clients"."type" = 'PJ' and "clients"."document" ~ '^[0-9]{14}$'));
