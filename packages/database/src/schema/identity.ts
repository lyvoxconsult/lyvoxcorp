import { sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  boolean,
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
    passwordChangeRequired: boolean("password_change_required").default(true).notNull(),
    failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    version: integer("version").default(1).notNull(),
    createdById: uuid("created_by_id").references((): AnyPgColumn => users.id),
    updatedById: uuid("updated_by_id").references((): AnyPgColumn => users.id),
  },
  (table) => [
    uniqueIndex("users_email_uidx").on(table.email),
    uniqueIndex("users_email_lower_uidx").on(sql`lower(${table.email})`),
    index("users_status_created_at_idx").on(table.status, table.createdAt),
    index("users_locked_until_idx").on(table.lockedUntil),
    index("users_deleted_at_idx").on(table.deletedAt),
    check("users_status_check", sql`${table.status} in ('ACTIVE', 'SUSPENDED', 'BLOCKED')`),
    check("users_failed_login_attempts_check", sql`${table.failedLoginAttempts} >= 0`),
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
    passwordChangedAt: timestamp("password_changed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
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
    csrfTokenHash: varchar("csrf_token_hash", { length: 64 }).notNull(),
    ipAddress: varchar("ip_address", { length: 45 }).notNull(),
    userAgent: text("user_agent").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
    mfaVerifiedAt: timestamp("mfa_verified_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    revocationReason: varchar("revocation_reason", { length: 100 }),
  },
  (table) => [
    uniqueIndex("sessions_token_hash_uidx").on(table.tokenHash),
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
    index("sessions_user_last_seen_at_idx").on(table.userId, table.lastSeenAt),
    index("sessions_deleted_at_idx").on(table.deletedAt),
    check("sessions_token_hash_length_check", sql`length(${table.tokenHash}) = 64`),
    check("sessions_csrf_token_hash_length_check", sql`length(${table.csrfTokenHash}) = 64`),
    check(
      "sessions_revocation_reason_check",
      sql`${table.revocationReason} is null or length(trim(${table.revocationReason})) > 0`,
    ),
    check("sessions_version_check", sql`${table.version} > 0`),
  ],
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    ...auditedColumns(),
    userId: uuid("user_id").notNull().references(() => users.id),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("password_reset_tokens_token_hash_uidx").on(table.tokenHash),
    index("password_reset_tokens_user_id_idx").on(table.userId),
    index("password_reset_tokens_expires_at_idx").on(table.expiresAt),
    index("password_reset_tokens_active_idx")
      .on(table.userId, table.expiresAt)
      .where(sql`${table.usedAt} is null and ${table.deletedAt} is null`),
    check("password_reset_tokens_token_hash_length_check", sql`length(${table.tokenHash}) = 64`),
    check("password_reset_tokens_expiry_check", sql`${table.expiresAt} > ${table.createdAt}`),
    check(
      "password_reset_tokens_used_at_check",
      sql`${table.usedAt} is null or ${table.usedAt} >= ${table.createdAt}`,
    ),
    check("password_reset_tokens_version_check", sql`${table.version} > 0`),
  ],
);

export const mfaFactors = pgTable(
  "mfa_factors",
  {
    ...auditedColumns(),
    userId: uuid("user_id").notNull().references(() => users.id),
    encryptedSecret: text("encrypted_secret").notNull(),
    enabled: boolean("enabled").default(false).notNull(),
    lastUsedStep: integer("last_used_step"),
  },
  (table) => [
    uniqueIndex("mfa_factors_user_active_uidx")
      .on(table.userId)
      .where(sql`${table.deletedAt} is null`),
    index("mfa_factors_enabled_idx").on(table.enabled),
    index("mfa_factors_deleted_at_idx").on(table.deletedAt),
    check(
      "mfa_factors_encrypted_secret_check",
      sql`length(trim(${table.encryptedSecret})) > 0`,
    ),
    check(
      "mfa_factors_last_used_step_check",
      sql`${table.lastUsedStep} is null or ${table.lastUsedStep} >= 0`,
    ),
    check("mfa_factors_version_check", sql`${table.version} > 0`),
  ],
);

export const mfaBackupCodes = pgTable(
  "mfa_backup_codes",
  {
    ...auditedColumns(),
    factorId: uuid("factor_id").notNull().references(() => mfaFactors.id),
    codeHash: text("code_hash").notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("mfa_backup_codes_code_hash_uidx").on(table.codeHash),
    index("mfa_backup_codes_factor_id_idx").on(table.factorId),
    index("mfa_backup_codes_unused_idx")
      .on(table.factorId)
      .where(sql`${table.usedAt} is null and ${table.deletedAt} is null`),
    check("mfa_backup_codes_hash_check", sql`length(trim(${table.codeHash})) > 0`),
    check(
      "mfa_backup_codes_used_at_check",
      sql`${table.usedAt} is null or ${table.usedAt} >= ${table.createdAt}`,
    ),
    check("mfa_backup_codes_version_check", sql`${table.version} > 0`),
  ],
);

export const mfaChallenges = pgTable(
  "mfa_challenges",
  {
    ...auditedColumns(),
    userId: uuid("user_id").notNull().references(() => users.id),
    sessionId: uuid("session_id").references(() => sessions.id),
    challengeHash: varchar("challenge_hash", { length: 64 }).notNull(),
    purpose: varchar("purpose", { length: 20 }).notNull(),
    attempts: integer("attempts").default(0).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("mfa_challenges_challenge_hash_uidx").on(table.challengeHash),
    index("mfa_challenges_user_id_idx").on(table.userId),
    index("mfa_challenges_session_id_idx").on(table.sessionId),
    index("mfa_challenges_expires_at_idx").on(table.expiresAt),
    index("mfa_challenges_active_idx")
      .on(table.userId, table.expiresAt)
      .where(sql`${table.consumedAt} is null and ${table.deletedAt} is null`),
    check("mfa_challenges_hash_length_check", sql`length(${table.challengeHash}) = 64`),
    check(
      "mfa_challenges_purpose_check",
      sql`${table.purpose} in ('ENROLLMENT', 'LOGIN', 'DISABLE')`,
    ),
    check("mfa_challenges_attempts_check", sql`${table.attempts} between 0 and 5`),
    check("mfa_challenges_expiry_check", sql`${table.expiresAt} > ${table.createdAt}`),
    check(
      "mfa_challenges_consumed_at_check",
      sql`${table.consumedAt} is null or ${table.consumedAt} >= ${table.createdAt}`,
    ),
    check("mfa_challenges_version_check", sql`${table.version} > 0`),
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
