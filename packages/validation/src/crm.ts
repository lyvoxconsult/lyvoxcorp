import { z } from "zod";
import { createClientSchema, cursorMetaSchema, responsibleSchema } from "./client.js";

const trimmed = (maximum: number) => z.string().trim().min(1).max(maximum);
const wireDateTimeSchema = z.iso.datetime({ offset: true });
const decimalMoneySchema = z.string().trim().regex(/^\d{1,13}(?:\.\d{1,2})?$/u);
const aggregateDecimalMoneySchema = z.string().trim().regex(/^\d{1,30}(?:\.\d{1,2})?$/u);

export const LEAD_LOSS_REASONS = [
  { code: "NO_BUDGET", label: "Sem orçamento" },
  { code: "NO_FIT", label: "Sem aderência" },
  { code: "NO_RESPONSE", label: "Sem retorno" },
  { code: "COMPETITOR", label: "Escolheu concorrente" },
  { code: "TIMING", label: "Momento inadequado" },
  { code: "OTHER", label: "Outro" },
] as const;

export const leadLossReasonCodeSchema = z.enum(LEAD_LOSS_REASONS.map((reason) => reason.code));
export const leadStageOutcomeSchema = z.enum(["OPEN", "WON", "LOST"]);
export const leadFollowupTypeSchema = z.enum(["EMAIL", "CALL", "MESSAGE"]);

export const createLeadSchema = z.object({
  name: trimmed(255),
  email: z.email().max(255).transform((value) => value.trim().toLowerCase()).optional(),
  phone: trimmed(30).optional(),
  company: trimmed(255).optional(),
  estimatedValue: decimalMoneySchema.optional(),
  source: trimmed(100).optional(),
  stageId: z.uuid().optional(),
  responsibleId: z.uuid().optional(),
}).strict();

export const listLeadsQuerySchema = z.object({
  search: z.string().trim().max(255).optional(),
  stageId: z.uuid().optional(),
  responsibleId: z.uuid().optional(),
  cursor: z.string().max(500).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
}).strict();

export const leadStageResponseSchema = z.object({
  id: z.uuid(), code: z.string().max(50), name: z.string().max(100), position: z.number().int().positive(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/u), outcome: leadStageOutcomeSchema, active: z.boolean(),
  version: z.number().int().positive(),
}).strict();

export const leadFollowupSummarySchema = z.object({
  id: z.uuid(), type: leadFollowupTypeSchema, dueAt: wireDateTimeSchema, overdue: z.boolean(),
}).strict();

export const leadCardResponseSchema = z.object({
  id: z.uuid(), name: z.string().max(255), email: z.string().max(255).nullable(), phone: z.string().max(30).nullable(),
  company: z.string().max(255).nullable(), estimatedValue: decimalMoneySchema.nullable(), source: z.string().max(100).nullable(),
  stageId: z.uuid(), convertedClientId: z.uuid().nullable(), responsible: responsibleSchema.nullable(), version: z.number().int().positive(),
  createdAt: wireDateTimeSchema, updatedAt: wireDateTimeSchema, nextFollowup: leadFollowupSummarySchema.nullable(),
}).strict();

const lossReasonResponseSchema = z.object({ code: leadLossReasonCodeSchema, label: z.string() }).strict();
export const leadPipelineResponseSchema = z.object({
  data: z.array(leadCardResponseSchema), meta: cursorMetaSchema, stages: z.array(leadStageResponseSchema),
  lossReasons: z.array(lossReasonResponseSchema),
  metrics: z.object({
    total: z.number().int().nonnegative(), estimatedValue: aggregateDecimalMoneySchema,
    byStage: z.array(z.object({ stageId: z.uuid(), count: z.number().int().nonnegative(), estimatedValue: aggregateDecimalMoneySchema }).strict()),
  }).strict(),
}).strict();

export const leadMutationResponseSchema = z.object({ id: z.uuid(), version: z.number().int().positive() }).strict();
export const changeLeadStageSchema = z.object({
  stageId: z.uuid(), version: z.number().int().positive(),
  lossReasonCode: leadLossReasonCodeSchema.optional(), lossNotes: z.string().trim().min(3).max(2_000).optional(),
}).strict().superRefine((value, context) => {
  if ((value.lossReasonCode === undefined) !== (value.lossNotes === undefined)) {
    context.addIssue({ code: "custom", path: ["lossReasonCode"], message: "Loss reason and notes must be provided together" });
  }
});
export const leadStageMutationResponseSchema = z.object({
  id: z.uuid(), stageId: z.uuid(), version: z.number().int().positive(),
}).strict();

export const createLeadFollowupSchema = z.object({
  type: leadFollowupTypeSchema, dueAt: wireDateTimeSchema, notes: trimmed(2_000).optional(), responsibleId: z.uuid().optional(),
}).strict();
export const leadFollowupMutationResponseSchema = leadMutationResponseSchema;

export const convertLeadSchema = z.object({ version: z.number().int().positive(), client: createClientSchema }).strict()
  .superRefine((value, context) => {
    if (value.client.status !== "ACTIVE") context.addIssue({ code: "custom", path: ["client", "status"], message: "Converted client must be active" });
  });
export const leadConversionResponseSchema = z.object({
  leadId: z.uuid(), clientId: z.uuid(), version: z.number().int().positive(),
}).strict();

export const importLeadsSchema = z.object({
  rows: z.array(z.object({ row: z.number().int().positive(), data: createLeadSchema }).strict()).min(1).max(500)
    .refine((rows) => new Set(rows.map((item) => item.row)).size === rows.length, "Duplicate source rows"),
}).strict();
export const leadImportResponseSchema = z.object({
  created: z.array(z.object({ row: z.number().int().positive(), id: z.uuid(), version: z.number().int().positive() }).strict()),
  errors: z.array(z.object({ row: z.number().int().positive(), code: z.string().max(100) }).strict()),
  total: z.number().int().positive(),
}).strict();

export const customizeLeadStagesSchema = z.object({
  stages: z.array(z.object({
    id: z.uuid().optional(), version: z.number().int().positive().optional(), name: trimmed(100),
    position: z.number().int().positive(), color: z.string().regex(/^#[0-9A-Fa-f]{6}$/u),
  }).strict().superRefine((stage, context) => {
    if ((stage.id === undefined) !== (stage.version === undefined)) {
      context.addIssue({ code: "custom", path: ["id"], message: "Stage id and version must be provided together" });
    }
  })).min(1).max(20).refine((stages) => new Set(stages.flatMap((stage) => stage.id ? [stage.id] : [])).size === stages.filter((stage) => stage.id).length, "Duplicate stages")
    .refine((stages) => new Set(stages.map((stage) => stage.position)).size === stages.length, "Duplicate positions")
    .refine((stages) => [...stages].map((stage) => stage.position).sort((left, right) => left - right)
      .every((position, index) => position === index + 1), "Stage positions must be contiguous"),
}).strict();
export const leadStagesMutationResponseSchema = z.object({ stages: z.array(leadStageResponseSchema) }).strict();

export const crmResponsibleListResponseSchema = z.object({ items: z.array(responsibleSchema) }).strict();

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;
export type LeadStageResponse = z.infer<typeof leadStageResponseSchema>;
export type LeadCardResponse = z.infer<typeof leadCardResponseSchema>;
export type LeadPipelineResponse = z.infer<typeof leadPipelineResponseSchema>;
export type LeadMutationResponse = z.infer<typeof leadMutationResponseSchema>;
export type ChangeLeadStageInput = z.infer<typeof changeLeadStageSchema>;
export type LeadStageMutationResponse = z.infer<typeof leadStageMutationResponseSchema>;
export type CreateLeadFollowupInput = z.infer<typeof createLeadFollowupSchema>;
export type LeadFollowupMutationResponse = z.infer<typeof leadFollowupMutationResponseSchema>;
export type ConvertLeadInput = z.infer<typeof convertLeadSchema>;
export type LeadConversionResponse = z.infer<typeof leadConversionResponseSchema>;
export type ImportLeadsInput = z.infer<typeof importLeadsSchema>;
export type LeadImportResponse = z.infer<typeof leadImportResponseSchema>;
export type CustomizeLeadStagesInput = z.infer<typeof customizeLeadStagesSchema>;
export type LeadStagesMutationResponse = z.infer<typeof leadStagesMutationResponseSchema>;
