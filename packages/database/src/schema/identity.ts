import { sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  check,
  index,
  integer,
  primaryKey,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    status: varchar("status", { length: 20 }).default("ACTIVE").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    version: integer("version").default(1).notNull(),
    createdById: uuid("created_by_id").references((): AnyPgColumn => users.id),
    updatedById: uuid("updated_by_id").references((): AnyPgColumn => users.id),
  },
  (table) => [
    uniqueIndex("users_email_uidx").on(table.email),
    index("users_status_created_at_idx").on(table.status, table.createdAt),
    index("users_deleted_at_idx").on(table.deletedAt),
    check("users_status_check", sql`${table.status} in ('ACTIVE', 'SUSPENDED', 'BLOCKED')`),
    check("users_version_check", sql`${table.version} > 0`),
  ],
);

export function auditedColumns() {
  return {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    version: integer("version").default(1).notNull(),
    createdById: uuid("created_by_id").references(() => users.id),
    updatedById: uuid("updated_by_id").references(() => users.id),
  };
}

export const passwordCredentials = pgTable(
  "password_credentials",
  {
    ...auditedColumns(),
    userId: uuid("user_id").notNull().references(() => users.id),
    passwordHash: text("password_hash").notNull(),
  },
  (table) => [
    uniqueIndex("password_credentials_user_id_uidx").on(table.userId),
    index("password_credentials_deleted_at_idx").on(table.deletedAt),
    check("password_credentials_version_check", sql`${table.version} > 0`),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    ...auditedColumns(),
    userId: uuid("user_id").notNull().references(() => users.id),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    ipAddress: varchar("ip_address", { length: 45 }).notNull(),
    userAgent: text("user_agent").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("sessions_token_hash_uidx").on(table.tokenHash),
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
    index("sessions_deleted_at_idx").on(table.deletedAt),
    check("sessions_token_hash_length_check", sql`length(${table.tokenHash}) = 64`),
    check("sessions_version_check", sql`${table.version} > 0`),
  ],
);

export const roles = pgTable(
  "roles",
  {
    ...auditedColumns(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
  },
  (table) => [
    uniqueIndex("roles_name_uidx").on(table.name),
    index("roles_deleted_at_idx").on(table.deletedAt),
    check("roles_version_check", sql`${table.version} > 0`),
  ],
);

export const permissions = pgTable(
  "permissions",
  {
    ...auditedColumns(),
    key: varchar("key", { length: 150 }).notNull(),
    description: text("description"),
  },
  (table) => [
    uniqueIndex("permissions_key_uidx").on(table.key),
    index("permissions_deleted_at_idx").on(table.deletedAt),
    check("permissions_key_check", sql`${table.key} ~ '^[a-z][a-z0-9_]*\\.[a-z][a-z0-9_]*$'`),
    check("permissions_version_check", sql`${table.version} > 0`),
  ],
);

export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id").notNull().references(() => users.id),
    roleId: uuid("role_id").notNull().references(() => roles.id),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull(),
    assignedById: uuid("assigned_by_id").references(() => users.id),
  },
  (table) => [
    primaryKey({ name: "user_roles_pk", columns: [table.userId, table.roleId] }),
    index("user_roles_role_id_idx").on(table.roleId),
  ],
);

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id").notNull().references(() => roles.id),
    permissionId: uuid("permission_id").notNull().references(() => permissions.id),
  },
  (table) => [
    primaryKey({ name: "role_permissions_pk", columns: [table.roleId, table.permissionId] }),
    index("role_permissions_permission_id_idx").on(table.permissionId),
  ],
);
