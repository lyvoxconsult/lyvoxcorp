import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  date,
  index,
  numeric,
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
    document: varchar("document", { length: 20 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    status: varchar("status", { length: 20 }).default("ACTIVE").notNull(),
  },
  (table) => [
    check("clients_type_check", sql`${table.type} in ('PJ', 'PF')`),
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

export const leads = pgTable(
  "leads",
  {
    ...auditedColumns(),
    convertedClientId: uuid("converted_client_id").references(() => clients.id),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    stage: varchar("stage", { length: 50 }).default("NEW").notNull(),
    lossReason: varchar("loss_reason", { length: 100 }),
    lossNotes: text("loss_notes"),
  },
  (table) => [
    index("leads_converted_client_id_idx").on(table.convertedClientId),
    index("leads_stage_created_at_idx").on(table.stage, table.createdAt),
    index("leads_deleted_at_idx").on(table.deletedAt),
    check("leads_version_check", sql`${table.version} > 0`),
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
