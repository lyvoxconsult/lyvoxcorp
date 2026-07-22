ALTER TABLE "role_permissions" ADD COLUMN "scope" varchar(20) DEFAULT 'ALL' NOT NULL;--> statement-breakpoint
UPDATE "role_permissions" rp SET "scope" = 'OWN' FROM "roles" r, "permissions" p WHERE rp."role_id" = r."id" AND rp."permission_id" = p."id" AND r."name" = 'Operacional' AND p."key" = 'clients.read';--> statement-breakpoint
UPDATE "role_permissions" rp SET "scope" = 'ASSIGNED' FROM "roles" r, "permissions" p WHERE rp."role_id" = r."id" AND rp."permission_id" = p."id" AND r."name" = 'Operacional' AND p."key" IN ('projects.read', 'projects.update');--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_scope_check" CHECK ("role_permissions"."scope" in ('ALL', 'OWN', 'ASSIGNED'));
