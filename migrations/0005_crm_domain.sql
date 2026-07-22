CREATE TABLE "lead_followups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"lead_id" uuid NOT NULL,
	"responsible_id" uuid,
	"type" varchar(20) NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"notes" text,
	"completed_at" timestamp with time zone,
	CONSTRAINT "lead_followups_type_check" CHECK ("lead_followups"."type" in ('EMAIL', 'CALL', 'MESSAGE')),
	CONSTRAINT "lead_followups_status_check" CHECK ("lead_followups"."status" in ('PENDING', 'COMPLETED', 'CANCELLED')),
	CONSTRAINT "lead_followups_completion_check" CHECK (("lead_followups"."status" = 'COMPLETED' and "lead_followups"."completed_at" is not null) or ("lead_followups"."status" <> 'COMPLETED' and "lead_followups"."completed_at" is null)),
	CONSTRAINT "lead_followups_version_check" CHECK ("lead_followups"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "lead_stage_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"lead_id" uuid NOT NULL,
	"from_stage_id" uuid,
	"to_stage_id" uuid NOT NULL,
	"loss_reason" varchar(100),
	"loss_notes" text,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lead_stage_history_loss_fields_check" CHECK (("lead_stage_history"."loss_reason" is null and "lead_stage_history"."loss_notes" is null) or ("lead_stage_history"."loss_reason" is not null and length(trim("lead_stage_history"."loss_notes")) > 0)),
	CONSTRAINT "lead_stage_history_version_check" CHECK ("lead_stage_history"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "lead_stages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"position" integer NOT NULL,
	"color" varchar(7) NOT NULL,
	"outcome" varchar(10) DEFAULT 'OPEN' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "lead_stages_code_check" CHECK ("lead_stages"."code" ~ '^[A-Z][A-Z0-9_]*$'),
	CONSTRAINT "lead_stages_name_check" CHECK (length(trim("lead_stages"."name")) > 0),
	CONSTRAINT "lead_stages_position_check" CHECK ("lead_stages"."position" > 0),
	CONSTRAINT "lead_stages_color_check" CHECK ("lead_stages"."color" ~ '^#[0-9A-Fa-f]{6}$'),
	CONSTRAINT "lead_stages_outcome_check" CHECK ("lead_stages"."outcome" in ('OPEN', 'WON', 'LOST')),
	CONSTRAINT "lead_stages_version_check" CHECK ("lead_stages"."version" > 0)
);
--> statement-breakpoint
DROP INDEX "leads_converted_client_id_idx";--> statement-breakpoint
DROP INDEX "leads_stage_created_at_idx";--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "converted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "stage_id" uuid;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "responsible_id" uuid;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "phone" varchar(30);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "company" varchar(255);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "estimated_value" numeric(15, 2);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "source" varchar(100);--> statement-breakpoint
ALTER TABLE "lead_followups" ADD CONSTRAINT "lead_followups_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_followups" ADD CONSTRAINT "lead_followups_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_followups" ADD CONSTRAINT "lead_followups_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_followups" ADD CONSTRAINT "lead_followups_responsible_id_users_id_fk" FOREIGN KEY ("responsible_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_stage_history" ADD CONSTRAINT "lead_stage_history_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_stage_history" ADD CONSTRAINT "lead_stage_history_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_stage_history" ADD CONSTRAINT "lead_stage_history_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_stage_history" ADD CONSTRAINT "lead_stage_history_from_stage_id_lead_stages_id_fk" FOREIGN KEY ("from_stage_id") REFERENCES "public"."lead_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_stage_history" ADD CONSTRAINT "lead_stage_history_to_stage_id_lead_stages_id_fk" FOREIGN KEY ("to_stage_id") REFERENCES "public"."lead_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_stages" ADD CONSTRAINT "lead_stages_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_stages" ADD CONSTRAINT "lead_stages_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lead_followups_lead_due_idx" ON "lead_followups" USING btree ("lead_id","due_at");--> statement-breakpoint
CREATE INDEX "lead_followups_status_due_idx" ON "lead_followups" USING btree ("status","due_at");--> statement-breakpoint
CREATE INDEX "lead_followups_responsible_id_idx" ON "lead_followups" USING btree ("responsible_id");--> statement-breakpoint
CREATE INDEX "lead_stage_history_lead_changed_idx" ON "lead_stage_history" USING btree ("lead_id","changed_at");--> statement-breakpoint
CREATE INDEX "lead_stage_history_to_stage_idx" ON "lead_stage_history" USING btree ("to_stage_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lead_stages_code_active_uidx" ON "lead_stages" USING btree ("code") WHERE "lead_stages"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "lead_stages_position_active_uidx" ON "lead_stages" USING btree ("position") WHERE "lead_stages"."deleted_at" is null and "lead_stages"."active" = true;--> statement-breakpoint
CREATE INDEX "lead_stages_outcome_idx" ON "lead_stages" USING btree ("outcome");--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_stage_id_lead_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."lead_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_responsible_id_users_id_fk" FOREIGN KEY ("responsible_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "leads_converted_client_id_uidx" ON "leads" USING btree ("converted_client_id") WHERE "leads"."converted_client_id" is not null;--> statement-breakpoint
CREATE INDEX "leads_responsible_id_idx" ON "leads" USING btree ("responsible_id");--> statement-breakpoint
CREATE INDEX "leads_name_trgm_idx" ON "leads" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "leads_email_trgm_idx" ON "leads" USING gin ("email" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "leads_stage_created_at_idx" ON "leads" USING btree ("stage_id","created_at");--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_estimated_value_check" CHECK ("leads"."estimated_value" is null or "leads"."estimated_value" >= 0);--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_conversion_check" CHECK (("leads"."converted_client_id" is null and "leads"."converted_at" is null) or ("leads"."converted_client_id" is not null and "leads"."converted_at" is not null));--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_loss_fields_check" CHECK (("leads"."loss_reason" is null and "leads"."loss_notes" is null) or ("leads"."loss_reason" is not null and length(trim("leads"."loss_notes")) > 0));
--> statement-breakpoint
INSERT INTO "lead_stages" ("id", "code", "name", "position", "color", "outcome") VALUES
	('10000000-0000-4000-8000-000000000001', 'NEW', 'Novo', 1, '#4180AB', 'OPEN'),
	('10000000-0000-4000-8000-000000000002', 'QUALIFIED', 'Qualificado', 2, '#8AB3CF', 'OPEN'),
	('10000000-0000-4000-8000-000000000003', 'MEETING_SCHEDULED', 'Reunião agendada', 3, '#BDD1DE', 'OPEN'),
	('10000000-0000-4000-8000-000000000004', 'PROPOSAL_SENT', 'Proposta enviada', 4, '#E4EBF0', 'OPEN'),
	('10000000-0000-4000-8000-000000000005', 'WON', 'Ganho', 5, '#3A7D44', 'WON'),
	('10000000-0000-4000-8000-000000000006', 'LOST', 'Perdido', 6, '#A63D40', 'LOST')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
WITH "legacy_values" AS (
	SELECT DISTINCT trim("stage") AS "legacy_stage"
	FROM "leads"
	WHERE trim("stage") <> ''
		AND upper(trim("stage")) NOT IN ('NEW', 'NOVO', 'QUALIFIED', 'QUALIFICADO', 'MEETING_SCHEDULED', 'REUNIAO_AGENDADA', 'REUNIÃO AGENDADA', 'PROPOSAL_SENT', 'PROPOSTA_ENVIADA', 'PROPOSTA ENVIADA', 'WON', 'GANHO', 'LOST', 'PERDIDO')
), "ranked_values" AS (
	SELECT "legacy_stage", row_number() OVER (ORDER BY "legacy_stage") AS "position_offset"
	FROM "legacy_values"
)
INSERT INTO "lead_stages" ("code", "name", "position", "color", "outcome")
SELECT 'LEGACY_' || upper(substr(md5("legacy_stage"), 1, 12)), left('Legado: ' || "legacy_stage", 100), 100 + "position_offset", '#BDD1DE', 'OPEN'
FROM "ranked_values"
ON CONFLICT DO NOTHING;
--> statement-breakpoint
UPDATE "leads" SET "stage_id" = CASE
	WHEN upper(trim("stage")) IN ('NEW', 'NOVO') THEN '10000000-0000-4000-8000-000000000001'::uuid
	WHEN upper(trim("stage")) IN ('QUALIFIED', 'QUALIFICADO') THEN '10000000-0000-4000-8000-000000000002'::uuid
	WHEN upper(trim("stage")) IN ('MEETING_SCHEDULED', 'REUNIAO_AGENDADA', 'REUNIÃO AGENDADA') THEN '10000000-0000-4000-8000-000000000003'::uuid
	WHEN upper(trim("stage")) IN ('PROPOSAL_SENT', 'PROPOSTA_ENVIADA', 'PROPOSTA ENVIADA') THEN '10000000-0000-4000-8000-000000000004'::uuid
	WHEN upper(trim("stage")) IN ('WON', 'GANHO') THEN '10000000-0000-4000-8000-000000000005'::uuid
	WHEN upper(trim("stage")) IN ('LOST', 'PERDIDO') THEN '10000000-0000-4000-8000-000000000006'::uuid
	ELSE (SELECT "id" FROM "lead_stages" WHERE "code" = 'LEGACY_' || upper(substr(md5(trim("leads"."stage")), 1, 12)) AND "deleted_at" IS NULL LIMIT 1)
END;
--> statement-breakpoint
UPDATE "leads" SET "stage_id" = '10000000-0000-4000-8000-000000000001'::uuid WHERE "stage_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "stage_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "leads" DROP COLUMN "stage";
--> statement-breakpoint
INSERT INTO "permissions" ("key", "description") VALUES ('crm.create', 'Criar e importar leads.')
ON CONFLICT ("key") DO UPDATE SET "description" = EXCLUDED."description", "deleted_at" = NULL, "updated_at" = now(), "version" = "permissions"."version" + 1;
--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission_id", "scope")
SELECT "roles"."id", "permissions"."id", 'ALL'
FROM "roles" CROSS JOIN "permissions"
WHERE "roles"."name" IN ('Administrador', 'Gestão', 'Comercial')
	AND "roles"."deleted_at" IS NULL
	AND "permissions"."key" = 'crm.create'
	AND "permissions"."deleted_at" IS NULL
ON CONFLICT ("role_id", "permission_id") DO UPDATE SET "scope" = 'ALL';
