-- Migration 0009: Projects Domain Specialization
-- Creates projects, project_tasks, project_members, and task_comments tables

CREATE TABLE IF NOT EXISTS "projects" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "created_by_id" uuid REFERENCES "users"("id"),
  "updated_by_id" uuid REFERENCES "users"("id"),
  "version" integer DEFAULT 1 NOT NULL,
  "client_id" uuid NOT NULL REFERENCES "clients"("id"),
  "name" varchar(255) NOT NULL,
  "description" text,
  "status" varchar(20) DEFAULT 'PLANNING' NOT NULL,
  "date_start" timestamp with time zone NOT NULL,
  "date_end" timestamp with time zone NOT NULL,
  "budget" numeric(15, 2),
  "visibility" varchar(20) DEFAULT 'TEAM' NOT NULL,
  CONSTRAINT "projects_name_check" CHECK (length(trim("name")) > 0),
  CONSTRAINT "projects_date_end_check" CHECK ("date_end" >= "date_start"),
  CONSTRAINT "projects_budget_check" CHECK ("budget" IS NULL OR "budget" > 0),
  CONSTRAINT "projects_status_check" CHECK ("status" IN ('PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED')),
  CONSTRAINT "projects_visibility_check" CHECK ("visibility" IN ('TEAM', 'CLIENT', 'PUBLIC')),
  CONSTRAINT "projects_version_check" CHECK ("version" > 0)
);

CREATE INDEX IF NOT EXISTS "projects_client_status_idx" ON "projects" ("client_id", "status") WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "projects_created_by_idx" ON "projects" ("created_by_id");
CREATE INDEX IF NOT EXISTS "projects_date_start_idx" ON "projects" ("date_start") WHERE "status" IN ('PLANNING', 'IN_PROGRESS') AND "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "projects_trgm_idx" ON "projects" USING gin ("name" gin_trgm_ops);

CREATE TABLE IF NOT EXISTS "project_tasks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "created_by_id" uuid REFERENCES "users"("id"),
  "updated_by_id" uuid REFERENCES "users"("id"),
  "version" integer DEFAULT 1 NOT NULL,
  "project_id" uuid NOT NULL REFERENCES "projects"("id"),
  "parent_task_id" uuid REFERENCES "project_tasks"("id"),
  "title" varchar(255) NOT NULL,
  "description" text,
  "status" varchar(20) DEFAULT 'TODO' NOT NULL,
  "priority" varchar(20) DEFAULT 'MEDIUM' NOT NULL,
  "assigned_to_id" uuid REFERENCES "users"("id"),
  "date_start" timestamp with time zone,
  "date_due" timestamp with time zone NOT NULL,
  "estimated_hours" numeric(8, 2),
  "actual_hours" numeric(8, 2),
  "position" integer NOT NULL,
  "blocks_completion" boolean DEFAULT false NOT NULL,
  CONSTRAINT "project_tasks_title_check" CHECK (length(trim("title")) > 0),
  CONSTRAINT "project_tasks_status_check" CHECK ("status" IN ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED')),
  CONSTRAINT "project_tasks_priority_check" CHECK ("priority" IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  CONSTRAINT "project_tasks_date_check" CHECK ("date_start" IS NULL OR "date_due" >= "date_start"),
  CONSTRAINT "project_tasks_hours_check" CHECK ("estimated_hours" IS NULL OR "estimated_hours" > 0),
  CONSTRAINT "project_tasks_actual_hours_check" CHECK ("actual_hours" IS NULL OR "actual_hours" >= 0),
  CONSTRAINT "project_tasks_position_check" CHECK ("position" > 0),
  CONSTRAINT "project_tasks_version_check" CHECK ("version" > 0)
);

CREATE INDEX IF NOT EXISTS "project_tasks_project_idx" ON "project_tasks" ("project_id") WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "project_tasks_parent_idx" ON "project_tasks" ("parent_task_id");
CREATE INDEX IF NOT EXISTS "project_tasks_assigned_to_idx" ON "project_tasks" ("assigned_to_id");
CREATE INDEX IF NOT EXISTS "project_tasks_status_idx" ON "project_tasks" ("status", "project_id") WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "project_tasks_date_due_idx" ON "project_tasks" ("date_due") WHERE "status" != 'DONE' AND "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "project_tasks_position_idx" ON "project_tasks" ("project_id", "position", "parent_task_id") WHERE "deleted_at" IS NULL;

CREATE TABLE IF NOT EXISTS "project_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "created_by_id" uuid REFERENCES "users"("id"),
  "updated_by_id" uuid REFERENCES "users"("id"),
  "version" integer DEFAULT 1 NOT NULL,
  "project_id" uuid NOT NULL REFERENCES "projects"("id"),
  "user_id" uuid NOT NULL REFERENCES "users"("id"),
  "role" varchar(20) DEFAULT 'CONTRIBUTOR' NOT NULL,
  "joined_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "project_members_role_check" CHECK ("role" IN ('OWNER', 'MANAGER', 'CONTRIBUTOR', 'VIEWER')),
  CONSTRAINT "project_members_version_check" CHECK ("version" > 0),
  UNIQUE ("project_id", "user_id")
);

CREATE INDEX IF NOT EXISTS "project_members_project_idx" ON "project_members" ("project_id") WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "project_members_user_idx" ON "project_members" ("user_id");
CREATE INDEX IF NOT EXISTS "project_members_role_idx" ON "project_members" ("project_id", "role") WHERE "deleted_at" IS NULL;

CREATE TABLE IF NOT EXISTS "task_comments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "created_by_id" uuid REFERENCES "users"("id"),
  "updated_by_id" uuid REFERENCES "users"("id"),
  "version" integer DEFAULT 1 NOT NULL,
  "task_id" uuid NOT NULL REFERENCES "project_tasks"("id"),
  "comment" text NOT NULL,
  "mentions" jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT "task_comments_comment_check" CHECK (length(trim("comment")) > 0),
  CONSTRAINT "task_comments_version_check" CHECK ("version" > 0)
);

CREATE INDEX IF NOT EXISTS "task_comments_task_idx" ON "task_comments" ("task_id") WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "task_comments_created_by_idx" ON "task_comments" ("created_by_id");
CREATE INDEX IF NOT EXISTS "task_comments_created_at_idx" ON "task_comments" ("task_id", "created_at");

CREATE TABLE IF NOT EXISTS "task_attachments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "created_by_id" uuid REFERENCES "users"("id"),
  "updated_by_id" uuid REFERENCES "users"("id"),
  "version" integer DEFAULT 1 NOT NULL,
  "task_id" uuid NOT NULL REFERENCES "project_tasks"("id"),
  "file_key" varchar(500) NOT NULL,
  "file_name" varchar(255) NOT NULL,
  "file_size" bigint NOT NULL,
  "mime_type" varchar(100),
  CONSTRAINT "task_attachments_file_name_check" CHECK (length(trim("file_name")) > 0),
  CONSTRAINT "task_attachments_file_size_check" CHECK ("file_size" > 0),
  CONSTRAINT "task_attachments_version_check" CHECK ("version" > 0)
);

CREATE INDEX IF NOT EXISTS "task_attachments_task_idx" ON "task_attachments" ("task_id") WHERE "deleted_at" IS NULL;

INSERT INTO "permissions" ("key", "description") VALUES 
  ('projects.create', 'Criar e editar projetos.'),
  ('projects.manage', 'Gerenciar membros e configurações do projeto.'),
  ('tasks.create', 'Criar e editar tarefas.'),
  ('tasks.complete', 'Marcar tarefas como concluídas.')
ON CONFLICT ("key") DO UPDATE SET "description" = EXCLUDED."description", "deleted_at" = NULL, "updated_at" = now(), "version" = "permissions"."version" + 1;

INSERT INTO "role_permissions" ("role_id", "permission_id", "scope")
SELECT "roles"."id", "permissions"."id", 'ALL'
FROM "roles" CROSS JOIN "permissions"
WHERE "roles"."name" IN ('Administrador', 'Gestão', 'Comercial')
  AND "roles"."deleted_at" IS NULL
  AND "permissions"."key" IN ('projects.create', 'projects.manage', 'tasks.create', 'tasks.complete')
  AND "permissions"."deleted_at" IS NULL
ON CONFLICT ("role_id", "permission_id") DO UPDATE SET "scope" = 'ALL';
