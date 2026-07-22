import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  primaryKey,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { auditedColumns, users } from "./identity.js";

export const clients = pgTable(
  "clients",
  {
    ...auditedColumns(),
    type: varchar("type", { length: 10 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    tradeName: varchar("trade_name", { length: 255 }),
    document: varchar("document", { length: 20 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    status: varchar("status", { length: 20 }).default("ACTIVE").notNull(),
  },
  (table) => [
    check("clients_type_check", sql`${table.type} in ('PJ', 'PF')`),
    check("clients_document_check", sql`(${table.type} = 'PF' and ${table.document} ~ '^[0-9]{11}$') or (${table.type} = 'PJ' and ${table.document} ~ '^[0-9]{14}$')`),
    check("clients_status_check", sql`${table.status} in ('ACTIVE', 'INACTIVE', 'CHURNED')`),
    check("clients_version_check", sql`${table.version} > 0`),
    uniqueIndex("clients_document_active_uidx").on(table.document).where(sql`${table.deletedAt} is null`),
    index("clients_status_created_at_idx").on(table.status, table.createdAt),
    index("clients_deleted_at_idx").on(table.deletedAt),
    index("clients_active_idx").on(table.name).where(sql`${table.deletedAt} is null`),
    index("clients_name_trgm_idx").using("gin", table.name.op("gin_trgm_ops")),
    index("clients_email_trgm_idx").using("gin", table.email.op("gin_trgm_ops")),
  ],
);

export const clientAddresses = pgTable(
  "client_addresses",
  {
    ...auditedColumns(),
    clientId: uuid("client_id").notNull().references(() => clients.id),
    label: varchar("label", { length: 50 }).default("PRIMARY").notNull(),
    postalCode: varchar("postal_code", { length: 8 }).notNull(),
    street: varchar("street", { length: 255 }).notNull(),
    number: varchar("number", { length: 30 }).notNull(),
    complement: varchar("complement", { length: 255 }),
    district: varchar("district", { length: 120 }).notNull(),
    city: varchar("city", { length: 120 }).notNull(),
    state: varchar("state", { length: 2 }).notNull(),
    country: varchar("country", { length: 2 }).default("BR").notNull(),
  },
  (table) => [
    index("client_addresses_client_id_idx").on(table.clientId),
    index("client_addresses_deleted_at_idx").on(table.deletedAt),
    check("client_addresses_postal_code_check", sql`${table.postalCode} ~ '^[0-9]{8}$'`),
    check("client_addresses_state_check", sql`${table.state} ~ '^[A-Z]{2}$'`),
    check("client_addresses_country_check", sql`${table.country} ~ '^[A-Z]{2}$'`),
    check("client_addresses_version_check", sql`${table.version} > 0`),
  ],
);

export const clientContacts = pgTable(
  "client_contacts",
  {
    ...auditedColumns(),
    clientId: uuid("client_id").notNull().references(() => clients.id),
    type: varchar("type", { length: 20 }).notNull(),
    label: varchar("label", { length: 50 }),
    value: varchar("value", { length: 255 }).notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
  },
  (table) => [
    index("client_contacts_client_id_idx").on(table.clientId),
    index("client_contacts_deleted_at_idx").on(table.deletedAt),
    check("client_contacts_type_check", sql`${table.type} in ('EMAIL', 'PHONE', 'WHATSAPP', 'OTHER')`),
    check("client_contacts_value_check", sql`length(trim(${table.value})) > 0`),
    check("client_contacts_version_check", sql`${table.version} > 0`),
  ],
);

export const clientTags = pgTable(
  "client_tags",
  {
    ...auditedColumns(),
    name: varchar("name", { length: 50 }).notNull(),
    normalizedName: varchar("normalized_name", { length: 50 }).notNull(),
  },
  (table) => [
    uniqueIndex("client_tags_normalized_name_uidx").on(table.normalizedName),
    index("client_tags_name_trgm_idx").using("gin", table.name.op("gin_trgm_ops")),
    index("client_tags_deleted_at_idx").on(table.deletedAt),
    check("client_tags_name_check", sql`length(trim(${table.name})) > 0`),
    check("client_tags_version_check", sql`${table.version} > 0`),
  ],
);

export const clientTagAssignments = pgTable(
  "client_tag_assignments",
  {
    clientId: uuid("client_id").notNull().references(() => clients.id),
    tagId: uuid("tag_id").notNull().references(() => clientTags.id),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull(),
    assignedById: uuid("assigned_by_id").references(() => users.id),
  },
  (table) => [
    primaryKey({ name: "client_tag_assignments_pk", columns: [table.clientId, table.tagId] }),
    index("client_tag_assignments_tag_id_idx").on(table.tagId),
  ],
);

export const clientResponsibles = pgTable(
  "client_responsibles",
  {
    clientId: uuid("client_id").notNull().references(() => clients.id),
    userId: uuid("user_id").notNull().references(() => users.id),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull(),
    assignedById: uuid("assigned_by_id").references(() => users.id),
  },
  (table) => [
    primaryKey({ name: "client_responsibles_pk", columns: [table.clientId, table.userId] }),
    index("client_responsibles_user_id_idx").on(table.userId),
  ],
);

export const clientTimelineEvents = pgTable(
  "client_timeline_events",
  {
    ...auditedColumns(),
    clientId: uuid("client_id").notNull().references(() => clients.id),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    sourceModule: varchar("source_module", { length: 100 }).notNull(),
    sourceEntityType: varchar("source_entity_type", { length: 100 }).notNull(),
    sourceEntityId: uuid("source_entity_id"),
    summary: varchar("summary", { length: 255 }).notNull(),
    metadata: jsonb("metadata").default({}).notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("client_timeline_client_occurred_idx").on(table.clientId, table.occurredAt, table.id),
    index("client_timeline_source_idx").on(table.sourceModule, table.sourceEntityType, table.sourceEntityId),
    index("client_timeline_deleted_at_idx").on(table.deletedAt),
    check("client_timeline_event_type_check", sql`length(trim(${table.eventType})) > 0`),
    check("client_timeline_version_check", sql`${table.version} > 0`),
  ],
);

export const leadStages = pgTable(
  "lead_stages",
  {
    ...auditedColumns(),
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    position: integer("position").notNull(),
    color: varchar("color", { length: 7 }).notNull(),
    outcome: varchar("outcome", { length: 10 }).default("OPEN").notNull(),
    active: boolean("active").default(true).notNull(),
  },
  (table) => [
    uniqueIndex("lead_stages_code_active_uidx").on(table.code).where(sql`${table.deletedAt} is null`),
    uniqueIndex("lead_stages_position_active_uidx").on(table.position).where(sql`${table.deletedAt} is null and ${table.active} = true`),
    index("lead_stages_outcome_idx").on(table.outcome),
    check("lead_stages_code_check", sql`${table.code} ~ '^[A-Z][A-Z0-9_]*$'`),
    check("lead_stages_name_check", sql`length(trim(${table.name})) > 0`),
    check("lead_stages_position_check", sql`${table.position} > 0`),
    check("lead_stages_color_check", sql`${table.color} ~ '^#[0-9A-Fa-f]{6}$'`),
    check("lead_stages_outcome_check", sql`${table.outcome} in ('OPEN', 'WON', 'LOST')`),
    check("lead_stages_version_check", sql`${table.version} > 0`),
  ],
);

export const leads = pgTable(
  "leads",
  {
    ...auditedColumns(),
    convertedClientId: uuid("converted_client_id").references(() => clients.id),
    convertedAt: timestamp("converted_at", { withTimezone: true }),
    stageId: uuid("stage_id").notNull().references(() => leadStages.id),
    responsibleId: uuid("responsible_id").references(() => users.id),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 30 }),
    company: varchar("company", { length: 255 }),
    estimatedValue: numeric("estimated_value", { precision: 15, scale: 2 }),
    source: varchar("source", { length: 100 }),
    lossReason: varchar("loss_reason", { length: 100 }),
    lossNotes: text("loss_notes"),
  },
  (table) => [
    uniqueIndex("leads_converted_client_id_uidx").on(table.convertedClientId).where(sql`${table.convertedClientId} is not null`),
    index("leads_stage_created_at_idx").on(table.stageId, table.createdAt),
    index("leads_responsible_id_idx").on(table.responsibleId),
    index("leads_deleted_at_idx").on(table.deletedAt),
    index("leads_name_trgm_idx").using("gin", table.name.op("gin_trgm_ops")),
    index("leads_email_trgm_idx").using("gin", table.email.op("gin_trgm_ops")),
    check("leads_estimated_value_check", sql`${table.estimatedValue} is null or ${table.estimatedValue} >= 0`),
    check("leads_conversion_check", sql`(${table.convertedClientId} is null and ${table.convertedAt} is null) or (${table.convertedClientId} is not null and ${table.convertedAt} is not null)`),
    check("leads_loss_fields_check", sql`(${table.lossReason} is null and ${table.lossNotes} is null) or (${table.lossReason} is not null and length(trim(${table.lossNotes})) > 0)`),
    check("leads_version_check", sql`${table.version} > 0`),
  ],
);

export const leadStageHistory = pgTable(
  "lead_stage_history",
  {
    ...auditedColumns(),
    leadId: uuid("lead_id").notNull().references(() => leads.id),
    fromStageId: uuid("from_stage_id").references(() => leadStages.id),
    toStageId: uuid("to_stage_id").notNull().references(() => leadStages.id),
    lossReason: varchar("loss_reason", { length: 100 }),
    lossNotes: text("loss_notes"),
    changedAt: timestamp("changed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("lead_stage_history_lead_changed_idx").on(table.leadId, table.changedAt),
    index("lead_stage_history_to_stage_idx").on(table.toStageId),
    check("lead_stage_history_loss_fields_check", sql`(${table.lossReason} is null and ${table.lossNotes} is null) or (${table.lossReason} is not null and length(trim(${table.lossNotes})) > 0)`),
    check("lead_stage_history_version_check", sql`${table.version} > 0`),
  ],
);

export const leadFollowups = pgTable(
  "lead_followups",
  {
    ...auditedColumns(),
    leadId: uuid("lead_id").notNull().references(() => leads.id),
    responsibleId: uuid("responsible_id").references(() => users.id),
    type: varchar("type", { length: 20 }).notNull(),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    status: varchar("status", { length: 20 }).default("PENDING").notNull(),
    notes: text("notes"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("lead_followups_lead_due_idx").on(table.leadId, table.dueAt),
    index("lead_followups_status_due_idx").on(table.status, table.dueAt),
    index("lead_followups_responsible_id_idx").on(table.responsibleId),
    check("lead_followups_type_check", sql`${table.type} in ('EMAIL', 'CALL', 'MESSAGE')`),
    check("lead_followups_status_check", sql`${table.status} in ('PENDING', 'COMPLETED', 'CANCELLED')`),
    check("lead_followups_completion_check", sql`(${table.status} = 'COMPLETED' and ${table.completedAt} is not null) or (${table.status} <> 'COMPLETED' and ${table.completedAt} is null)`),
    check("lead_followups_version_check", sql`${table.version} > 0`),
  ],
);

export const meetings = pgTable(
  "meetings",
  {
    ...auditedColumns(),
    clientId: uuid("client_id").references(() => clients.id),
    leadId: uuid("lead_id").references(() => leads.id),
    title: varchar("title", { length: 255 }).notNull(),
    agenda: text("agenda"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    meetingUrl: text("meeting_url"),
  },
  (table) => [
    index("meetings_client_id_idx").on(table.clientId),
    index("meetings_lead_id_idx").on(table.leadId),
    index("meetings_deleted_at_idx").on(table.deletedAt),
    check("meetings_subject_check", sql`${table.clientId} is not null or ${table.leadId} is not null`),
    check("meetings_version_check", sql`${table.version} > 0`),
  ],
);

export const meetingNotes = pgTable(
  "meeting_notes",
  {
    ...auditedColumns(),
    meetingId: uuid("meeting_id").notNull().references(() => meetings.id),
    notes: text("notes").notNull(),
    summary: text("summary"),
    actionItems: jsonb("action_items").default([]).notNull(),
  },
  (table) => [
    index("meeting_notes_meeting_id_idx").on(table.meetingId),
    index("meeting_notes_deleted_at_idx").on(table.deletedAt),
    check("meeting_notes_notes_check", sql`length(trim(${table.notes})) > 0`),
    check("meeting_notes_version_check", sql`${table.version} > 0`),
  ],
);

export const meetingParticipants = pgTable(
  "meeting_participants",
  {
    ...auditedColumns(),
    meetingId: uuid("meeting_id").notNull().references(() => meetings.id),
    userId: uuid("user_id").references(() => users.id),
    type: varchar("type", { length: 20 }).default("INTERNAL").notNull(),
  },
  (table) => [
    index("meeting_participants_meeting_id_idx").on(table.meetingId),
    index("meeting_participants_user_id_idx").on(table.userId),
    index("meeting_participants_deleted_at_idx").on(table.deletedAt),
    check("meeting_participants_type_check", sql`${table.type} in ('CLIENT', 'LEAD', 'INTERNAL')`),
    check("meeting_participants_version_check", sql`${table.version} > 0`),
  ],
);

export const meetingTranscripts = pgTable(
  "meeting_transcripts",
  {
    ...auditedColumns(),
    meetingId: uuid("meeting_id").notNull().references(() => meetings.id),
    rawTranscript: text("raw_transcript").notNull(),
    summary: text("summary"),
    actionItems: jsonb("action_items").default([]).notNull(),
    source: varchar("source", { length: 100 }).default("MANUAL_UPLOAD").notNull(),
  },
  (table) => [
    index("meeting_transcripts_meeting_id_idx").on(table.meetingId),
    index("meeting_transcripts_deleted_at_idx").on(table.deletedAt),
    check("meeting_transcripts_raw_check", sql`length(trim(${table.rawTranscript})) > 0`),
    check("meeting_transcripts_version_check", sql`${table.version} > 0`),
  ],
);


export const services = pgTable(
  "services",
  {
    ...auditedColumns(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }).notNull(),
    unit: varchar("unit", { length: 50 }).notNull(),
    billingType: varchar("billing_type", { length: 50 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    basePrice: numeric("base_price", { precision: 15, scale: 2 }).notNull(),
  },
  (table) => [
    index("services_category_idx").on(table.category),
    index("services_deleted_at_idx").on(table.deletedAt),
    check("services_price_check", sql`${table.basePrice} >= 0`),
    check("services_version_check", sql`${table.version} > 0`),
  ],
);

export const servicePriceVersions = pgTable(
  "service_price_versions",
  {
    ...auditedColumns(),
    serviceId: uuid("service_id").notNull().references(() => services.id),
    price: numeric("price", { precision: 15, scale: 2 }).notNull(),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull().defaultNow(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
  },
  (table) => [
    index("spv_service_id_idx").on(table.serviceId),
    index("spv_effective_dates_idx").on(table.effectiveFrom, table.effectiveTo),
    check("spv_price_check", sql`${table.price} >= 0`),
    check("spv_dates_check", sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`),
    check("spv_version_check", sql`${table.version} > 0`),
  ],
);

export const proposals = pgTable(
  "proposals",
  {
    ...auditedColumns(),
    clientId: uuid("client_id").notNull().references(() => clients.id),
    status: varchar("status", { length: 20 }).default("DRAFT").notNull(),
    validUntil: date("valid_until").notNull(),
    subtotal: numeric("subtotal", { precision: 15, scale: 2 }).notNull(),
    discount: numeric("discount", { precision: 15, scale: 2 }).default("0").notNull(),
    total: numeric("total", { precision: 15, scale: 2 }).notNull(),
  },
  (table) => [
    index("proposals_client_id_idx").on(table.clientId),
    index("proposals_status_created_at_idx").on(table.status, table.createdAt),
    index("proposals_deleted_at_idx").on(table.deletedAt),
    check("proposals_amounts_check", sql`${table.subtotal} >= 0 and ${table.discount} >= 0 and ${table.total} >= 0`),
    check("proposals_version_check", sql`${table.version} > 0`),
  ],
);

export const proposalItems = pgTable(
  "proposal_items",
  {
    ...auditedColumns(),
    proposalId: uuid("proposal_id").notNull().references(() => proposals.id),
    description: varchar("description", { length: 255 }).notNull(),
    quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
    unitPrice: numeric("unit_price", { precision: 15, scale: 2 }).notNull(),
    discount: numeric("discount", { precision: 15, scale: 2 }).default("0").notNull(),
    total: numeric("total", { precision: 15, scale: 2 }).notNull(),
  },
  (table) => [
    index("proposal_items_proposal_id_idx").on(table.proposalId),
    index("proposal_items_deleted_at_idx").on(table.deletedAt),
    check("proposal_items_amounts_check", sql`${table.quantity} > 0 and ${table.unitPrice} >= 0 and ${table.discount} >= 0 and ${table.total} >= 0`),
    check("proposal_items_version_check", sql`${table.version} > 0`),
  ],
);

export const contracts = pgTable(
  "contracts",
  {
    ...auditedColumns(),
    proposalId: uuid("proposal_id").notNull().references(() => proposals.id),
    clientId: uuid("client_id").notNull().references(() => clients.id),
    number: varchar("number", { length: 100 }).notNull(),
    status: varchar("status", { length: 20 }).default("ACTIVE").notNull(),
    startsOn: date("starts_on").notNull(),
    endsOn: date("ends_on"),
    total: numeric("total", { precision: 15, scale: 2 }).notNull(),
  },
  (table) => [
    uniqueIndex("contracts_number_uidx").on(table.number),
    index("contracts_proposal_id_idx").on(table.proposalId),
    index("contracts_client_id_idx").on(table.clientId),
    index("contracts_status_created_at_idx").on(table.status, table.createdAt),
    index("contracts_deleted_at_idx").on(table.deletedAt),
    check("contracts_total_check", sql`${table.total} >= 0`),
    check("contracts_dates_check", sql`${table.endsOn} is null or ${table.endsOn} >= ${table.startsOn}`),
    check("contracts_version_check", sql`${table.version} > 0`),
  ],
);

export const projects = pgTable(
  "projects",
  {
    ...auditedColumns(),
    clientId: uuid("client_id").notNull().references(() => clients.id),
    contractId: uuid("contract_id").references(() => contracts.id),
    ownerId: uuid("owner_id").references(() => users.id),
    name: varchar("name", { length: 255 }).notNull(),
    status: varchar("status", { length: 20 }).default("PLANNED").notNull(),
    startsOn: date("starts_on"),
    dueOn: date("due_on"),
    budget: numeric("budget", { precision: 15, scale: 2 }),
  },
  (table) => [
    index("projects_client_id_idx").on(table.clientId),
    index("projects_contract_id_idx").on(table.contractId),
    index("projects_owner_id_idx").on(table.ownerId),
    index("projects_status_created_at_idx").on(table.status, table.createdAt),
    index("projects_deleted_at_idx").on(table.deletedAt),
    check("projects_dates_check", sql`${table.dueOn} is null or ${table.startsOn} is null or ${table.dueOn} >= ${table.startsOn}`),
    check("projects_budget_check", sql`${table.budget} is null or ${table.budget} >= 0`),
    check("projects_version_check", sql`${table.version} > 0`),
  ],
);

export const tasks = pgTable(
  "tasks",
  {
    ...auditedColumns(),
    projectId: uuid("project_id").notNull().references(() => projects.id),
    parentTaskId: uuid("parent_task_id").references((): AnyPgColumn => tasks.id),
    assigneeId: uuid("assignee_id").references(() => users.id),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 20 }).default("TODO").notNull(),
    priority: varchar("priority", { length: 20 }).default("MEDIUM").notNull(),
    dueOn: date("due_on"),
    required: boolean("required").default(true).notNull(),
  },
  (table) => [
    index("tasks_project_id_idx").on(table.projectId),
    index("tasks_parent_task_id_idx").on(table.parentTaskId),
    index("tasks_assignee_id_idx").on(table.assigneeId),
    index("tasks_status_created_at_idx").on(table.status, table.createdAt),
    index("tasks_deleted_at_idx").on(table.deletedAt),
    check("tasks_parent_check", sql`${table.parentTaskId} is null or ${table.parentTaskId} <> ${table.id}`),
    check("tasks_version_check", sql`${table.version} > 0`),
  ],
);

export const taskComments = pgTable(
  "task_comments",
  {
    ...auditedColumns(),
    taskId: uuid("task_id").notNull().references(() => tasks.id),
    authorId: uuid("author_id").notNull().references(() => users.id),
    body: text("body").notNull(),
  },
  (table) => [
    index("task_comments_task_id_idx").on(table.taskId),
    index("task_comments_author_id_idx").on(table.authorId),
    index("task_comments_deleted_at_idx").on(table.deletedAt),
    check("task_comments_version_check", sql`${table.version} > 0`),
  ],
);

export const taskAttachments = pgTable(
  "task_attachments",
  {
    ...auditedColumns(),
    taskId: uuid("task_id").notNull().references(() => tasks.id),
    storageKey: text("storage_key").notNull(),
    originalName: varchar("original_name", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 255 }).notNull(),
    sizeBytes: numeric("size_bytes", { precision: 20, scale: 0 }).notNull(),
    checksumSha256: varchar("checksum_sha256", { length: 64 }).notNull(),
  },
  (table) => [
    index("task_attachments_task_id_idx").on(table.taskId),
    index("task_attachments_deleted_at_idx").on(table.deletedAt),
    check("task_attachments_size_check", sql`${table.sizeBytes} > 0 and ${table.sizeBytes} < 52428800`),
    check("task_attachments_checksum_check", sql`length(${table.checksumSha256}) = 64`),
    check("task_attachments_version_check", sql`${table.version} > 0`),
  ],
);

export const financialTransactions = pgTable(
  "financial_transactions",
  {
    ...auditedColumns(),
    clientId: uuid("client_id").references(() => clients.id),
    type: varchar("type", { length: 10 }).notNull(),
    amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
    dueDate: date("due_date").notNull(),
    paymentDate: date("payment_date"),
    status: varchar("status", { length: 20 }).default("PENDING").notNull(),
  },
  (table) => [
    index("financial_transactions_client_id_idx").on(table.clientId),
    index("financial_transactions_status_created_at_idx").on(table.status, table.createdAt),
    index("financial_transactions_deleted_at_idx").on(table.deletedAt),
    check("financial_transactions_type_check", sql`${table.type} in ('INCOME', 'EXPENSE')`),
    check("financial_transactions_amount_check", sql`${table.amount} > 0`),
    check("financial_transactions_status_check", sql`${table.status} in ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED')`),
    check("financial_transactions_payment_check", sql`${table.status} <> 'PAID' or ${table.paymentDate} is not null`),
    check("financial_transactions_version_check", sql`${table.version} > 0`),
  ],
);
