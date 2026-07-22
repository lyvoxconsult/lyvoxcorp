import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { auditedColumns, users } from "./identity.js";

export const outboxEvents = pgTable(
  "outbox_events",
  {
    ...auditedColumns(),
    aggregateType: varchar("aggregate_type", { length: 100 }).notNull(),
    aggregateId: uuid("aggregate_id").notNull(),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    payload: jsonb("payload").notNull(),
    processed: boolean("processed").default(false).notNull(),
  },
  (table) => [
    index("outbox_events_processed_created_at_idx").on(table.processed, table.createdAt),
    index("outbox_events_aggregate_idx").on(table.aggregateType, table.aggregateId),
    index("outbox_events_deleted_at_idx").on(table.deletedAt),
    check("outbox_events_version_check", sql`${table.version} > 0`),
  ],
);

export const inboxEvents = pgTable(
  "inbox_events",
  {
    ...auditedColumns(),
    source: varchar("source", { length: 100 }).notNull(),
    externalId: varchar("external_id", { length: 255 }).notNull(),
    payload: jsonb("payload").notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("inbox_events_source_external_id_uidx").on(table.source, table.externalId),
    index("inbox_events_processed_at_idx").on(table.processedAt),
    index("inbox_events_deleted_at_idx").on(table.deletedAt),
    check("inbox_events_version_check", sql`${table.version} > 0`),
  ],
);

export const idempotencyKeys = pgTable(
  "idempotency_keys",
  {
    ...auditedColumns(),
    scope: varchar("scope", { length: 100 }).notNull(),
    key: varchar("key", { length: 255 }).notNull(),
    requestHash: varchar("request_hash", { length: 64 }).notNull(),
    responseStatus: integer("response_status"),
    responseBody: jsonb("response_body"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex("idempotency_keys_scope_key_uidx").on(table.scope, table.key),
    index("idempotency_keys_expires_at_idx").on(table.expiresAt),
    index("idempotency_keys_deleted_at_idx").on(table.deletedAt),
    check("idempotency_keys_request_hash_check", sql`length(${table.requestHash}) = 64`),
    check("idempotency_keys_response_status_check", sql`${table.responseStatus} is null or ${table.responseStatus} between 100 and 599`),
    check("idempotency_keys_version_check", sql`${table.version} > 0`),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorUserId: uuid("actor_user_id").references(() => users.id),
    action: varchar("action", { length: 150 }).notNull(),
    module: varchar("module", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }),
    entityId: uuid("entity_id"),
    ipAddress: varchar("ip_address", { length: 45 }),
    metadata: jsonb("metadata").default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_actor_user_id_idx").on(table.actorUserId),
    index("audit_logs_module_action_created_at_idx").on(table.module, table.action, table.createdAt),
    index("audit_logs_entity_idx").on(table.entityType, table.entityId),
  ],
);
