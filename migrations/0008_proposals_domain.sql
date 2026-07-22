-- Migration 0008: Proposals Domain Specialization
-- Creates proposals, proposal_items, proposal_approvals, and contracts tables

CREATE TABLE IF NOT EXISTS "proposals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "created_by_id" uuid REFERENCES "users"("id"),
  "updated_by_id" uuid REFERENCES "users"("id"),
  "version" integer DEFAULT 1 NOT NULL,
  "client_id" uuid NOT NULL REFERENCES "clients"("id"),
  "number" varchar(50) NOT NULL,
  "date_issued" timestamp with time zone DEFAULT now() NOT NULL,
  "valid_until" timestamp with time zone NOT NULL,
  "status" varchar(20) DEFAULT 'DRAFT' NOT NULL,
  "total_value" numeric(15, 2) NOT NULL,
  "notes" text,
  "internal_notes" text,
  "approved_at" timestamp with time zone,
  "approved_by_id" uuid REFERENCES "users"("id"),
  CONSTRAINT "proposals_number_check" CHECK (length(trim("number")) > 0),
  CONSTRAINT "proposals_total_value_check" CHECK ("total_value" > 0),
  CONSTRAINT "proposals_valid_until_check" CHECK ("valid_until" > "date_issued"),
  CONSTRAINT "proposals_status_check" CHECK ("status" IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ACCEPTED', 'CONVERTED')),
  CONSTRAINT "proposals_approval_check" CHECK (("status" IN ('APPROVED', 'ACCEPTED', 'CONVERTED') AND "approved_at" IS NOT NULL AND "approved_by_id" IS NOT NULL) OR ("status" NOT IN ('APPROVED', 'ACCEPTED', 'CONVERTED'))),
  CONSTRAINT "proposals_version_check" CHECK ("version" > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS "proposals_number_client_uidx" ON "proposals" ("number", "client_id") WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "proposals_client_status_idx" ON "proposals" ("client_id", "status") WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "proposals_created_by_idx" ON "proposals" ("created_by_id");
CREATE INDEX IF NOT EXISTS "proposals_approved_by_idx" ON "proposals" ("approved_by_id");
CREATE INDEX IF NOT EXISTS "proposals_valid_until_idx" ON "proposals" ("valid_until") WHERE "status" NOT IN ('REJECTED', 'CONVERTED') AND "deleted_at" IS NULL;

CREATE TABLE IF NOT EXISTS "proposal_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "created_by_id" uuid REFERENCES "users"("id"),
  "updated_by_id" uuid REFERENCES "users"("id"),
  "version" integer DEFAULT 1 NOT NULL,
  "proposal_id" uuid NOT NULL REFERENCES "proposals"("id"),
  "service_id" uuid REFERENCES "services"("id"),
  "description" text NOT NULL,
  "quantity" numeric(12, 4) NOT NULL,
  "unit_price" numeric(15, 2) NOT NULL,
  "discount_percent" numeric(5, 2) DEFAULT 0 NOT NULL,
  "total_value" numeric(15, 2) NOT NULL,
  "position" integer NOT NULL,
  CONSTRAINT "proposal_items_description_check" CHECK (length(trim("description")) > 0),
  CONSTRAINT "proposal_items_quantity_check" CHECK ("quantity" > 0),
  CONSTRAINT "proposal_items_unit_price_check" CHECK ("unit_price" >= 0),
  CONSTRAINT "proposal_items_discount_check" CHECK ("discount_percent" >= 0 AND "discount_percent" <= 100),
  CONSTRAINT "proposal_items_total_check" CHECK ("total_value" > 0),
  CONSTRAINT "proposal_items_position_check" CHECK ("position" > 0),
  CONSTRAINT "proposal_items_version_check" CHECK ("version" > 0)
);

CREATE INDEX IF NOT EXISTS "proposal_items_proposal_id_idx" ON "proposal_items" ("proposal_id");
CREATE INDEX IF NOT EXISTS "proposal_items_service_id_idx" ON "proposal_items" ("service_id");
CREATE INDEX IF NOT EXISTS "proposal_items_position_idx" ON "proposal_items" ("proposal_id", "position");

CREATE TABLE IF NOT EXISTS "proposal_approvals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "created_by_id" uuid REFERENCES "users"("id"),
  "updated_by_id" uuid REFERENCES "users"("id"),
  "version" integer DEFAULT 1 NOT NULL,
  "proposal_id" uuid NOT NULL REFERENCES "proposals"("id"),
  "approver_id" uuid NOT NULL REFERENCES "users"("id"),
  "status" varchar(20) DEFAULT 'PENDING' NOT NULL,
  "notes" text,
  "approved_at" timestamp with time zone,
  "required_order" integer DEFAULT 1,
  CONSTRAINT "proposal_approvals_status_check" CHECK ("status" IN ('PENDING', 'APPROVED', 'REJECTED')),
  CONSTRAINT "proposal_approvals_approval_check" CHECK (("status" IN ('APPROVED', 'REJECTED') AND "approved_at" IS NOT NULL) OR "status" = 'PENDING'),
  CONSTRAINT "proposal_approvals_order_check" CHECK ("required_order" > 0),
  CONSTRAINT "proposal_approvals_version_check" CHECK ("version" > 0)
);

CREATE INDEX IF NOT EXISTS "proposal_approvals_proposal_idx" ON "proposal_approvals" ("proposal_id");
CREATE INDEX IF NOT EXISTS "proposal_approvals_approver_idx" ON "proposal_approvals" ("approver_id");
CREATE INDEX IF NOT EXISTS "proposal_approvals_status_idx" ON "proposal_approvals" ("status", "proposal_id") WHERE "deleted_at" IS NULL;

CREATE TABLE IF NOT EXISTS "contracts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "created_by_id" uuid REFERENCES "users"("id"),
  "updated_by_id" uuid REFERENCES "users"("id"),
  "version" integer DEFAULT 1 NOT NULL,
  "proposal_id" uuid NOT NULL REFERENCES "proposals"("id"),
  "client_id" uuid NOT NULL REFERENCES "clients"("id"),
  "number" varchar(50) NOT NULL,
  "date_start" timestamp with time zone NOT NULL,
  "date_end" timestamp with time zone NOT NULL,
  "status" varchar(20) DEFAULT 'DRAFT' NOT NULL,
  "total_value" numeric(15, 2) NOT NULL,
  "terms" text,
  "signed_at" timestamp with time zone,
  "signed_by_id" uuid REFERENCES "users"("id"),
  CONSTRAINT "contracts_number_check" CHECK (length(trim("number")) > 0),
  CONSTRAINT "contracts_total_value_check" CHECK ("total_value" > 0),
  CONSTRAINT "contracts_date_end_check" CHECK ("date_end" > "date_start"),
  CONSTRAINT "contracts_status_check" CHECK ("status" IN ('DRAFT', 'PENDING_SIGNATURE', 'SIGNED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
  CONSTRAINT "contracts_signature_check" CHECK (("status" IN ('SIGNED', 'ACTIVE', 'COMPLETED') AND "signed_at" IS NOT NULL AND "signed_by_id" IS NOT NULL) OR "status" NOT IN ('SIGNED', 'ACTIVE', 'COMPLETED')),
  CONSTRAINT "contracts_version_check" CHECK ("version" > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS "contracts_number_client_uidx" ON "contracts" ("number", "client_id") WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "contracts_proposal_id_idx" ON "contracts" ("proposal_id");
CREATE INDEX IF NOT EXISTS "contracts_client_status_idx" ON "contracts" ("client_id", "status") WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "contracts_date_start_idx" ON "contracts" ("date_start");
CREATE INDEX IF NOT EXISTS "contracts_date_end_idx" ON "contracts" ("date_end") WHERE "status" IN ('ACTIVE', 'PENDING_SIGNATURE');

INSERT INTO "permissions" ("key", "description") VALUES 
  ('proposals.create', 'Criar e editar propostas.'),
  ('proposals.approve', 'Aprovar propostas internamente.'),
  ('proposals.convert', 'Converter proposta em contrato.')
ON CONFLICT ("key") DO UPDATE SET "description" = EXCLUDED."description", "deleted_at" = NULL, "updated_at" = now(), "version" = "permissions"."version" + 1;

INSERT INTO "role_permissions" ("role_id", "permission_id", "scope")
SELECT "roles"."id", "permissions"."id", 'ALL'
FROM "roles" CROSS JOIN "permissions"
WHERE "roles"."name" IN ('Administrador', 'Gestão', 'Comercial')
  AND "roles"."deleted_at" IS NULL
  AND "permissions"."key" IN ('proposals.create', 'proposals.approve', 'proposals.convert')
  AND "permissions"."deleted_at" IS NULL
ON CONFLICT ("role_id", "permission_id") DO UPDATE SET "scope" = 'ALL';
