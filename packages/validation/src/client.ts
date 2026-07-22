import { z } from "zod";
import { isValidPersonDocument, normalizePersonDocument } from "./person-document.js";

const unique = <T>(values: readonly T[]) => new Set(values).size === values.length;
const trimmed = (max: number) => z.string().trim().min(1).max(max);

export const clientAddressSchema = z.object({
  label: trimmed(50).default("PRIMARY"),
  postalCode: z.string().transform((value) => value.replace(/\D/gu, "")).pipe(z.string().regex(/^\d{8}$/u)),
  street: trimmed(255), number: trimmed(30), complement: trimmed(255).optional(),
  district: trimmed(120), city: trimmed(120),
  state: z.string().trim().toUpperCase().pipe(z.string().regex(/^[A-Z]{2}$/u)),
  country: z.string().trim().toUpperCase().pipe(z.string().regex(/^[A-Z]{2}$/u)).default("BR"),
}).strict();

export const clientContactSchema = z.object({
  type: z.enum(["EMAIL", "PHONE", "WHATSAPP", "OTHER"]),
  label: trimmed(50).optional(), value: trimmed(255), isPrimary: z.boolean().default(false),
}).strict().superRefine((contact, context) => {
  if (contact.type === "EMAIL" && !z.email().safeParse(contact.value).success) {
    context.addIssue({ code: "custom", path: ["value"], message: "Invalid email contact" });
  }
});

const baseClientSchema = z.object({
  type: z.enum(["PF", "PJ"]), name: trimmed(255), tradeName: trimmed(255).optional(),
  document: z.string().max(20).transform(normalizePersonDocument),
  email: z.email().max(255).transform((value) => value.trim().toLowerCase()),
  status: z.enum(["ACTIVE", "INACTIVE", "CHURNED"]).default("ACTIVE"),
  address: clientAddressSchema.optional(), contacts: z.array(clientContactSchema).max(20).default([]),
  tags: z.array(trimmed(50).transform((value) => value.replace(/\s+/gu, " "))).max(20).default([])
    .refine((values) => unique(values.map((value) => value.toLocaleLowerCase("pt-BR"))), "Duplicate tags"),
  responsibleIds: z.array(z.uuid()).max(20).default([]).refine(unique, "Duplicate responsibles"),
}).strict().superRefine((client, context) => {
  if (!isValidPersonDocument(client.type, client.document)) {
    context.addIssue({ code: "custom", path: ["document"], message: `Invalid ${client.type === "PF" ? "CPF" : "CNPJ"}` });
  }
});

export const createClientSchema = baseClientSchema;
export const updateClientSchema = baseClientSchema.safeExtend({ version: z.number().int().positive() });
export const listClientsQuerySchema = z.object({
  search: z.string().trim().max(255).optional(), status: z.enum(["ACTIVE", "INACTIVE", "CHURNED"]).optional(),
  tag: z.string().trim().min(1).max(50).optional(), cursor: z.string().max(500).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
}).strict();
export const clientDetailQuerySchema = z.object({
  timelineCursor: z.string().max(500).optional(),
  timelinePageSize: z.coerce.number().int().min(1).max(100).default(20),
}).strict();
export const cursorIdentifierSchema = z.uuid();

const clientTypeSchema = z.enum(["PF", "PJ"]);
const clientStatusSchema = z.enum(["ACTIVE", "INACTIVE", "CHURNED"]);
const wireDateTimeSchema = z.iso.datetime({ offset: true });

export const responsibleSchema = z.object({ id: z.uuid(), fullName: z.string().min(1).max(255) }).strict();
export const cursorMetaSchema = z.object({
  pageSize: z.number().int().min(1).max(100), hasMore: z.boolean(), nextCursor: z.string().nullable(),
}).strict();

export const clientMutationResponseSchema = z.object({
  id: z.uuid(), version: z.number().int().positive(),
}).strict();
const clientCoreResponseSchema = z.object({
  id: z.uuid(), type: clientTypeSchema, name: z.string(), tradeName: z.string().nullable(),
  document: z.string(), email: z.email(), status: clientStatusSchema, version: z.number().int().positive(),
  createdAt: wireDateTimeSchema, updatedAt: wireDateTimeSchema,
}).strict();

export const clientListItemResponseSchema = clientCoreResponseSchema.extend({
  tags: z.array(z.string()), responsibles: z.array(responsibleSchema),
});
export const clientListResponseSchema = z.object({
  data: z.array(clientListItemResponseSchema), meta: cursorMetaSchema,
}).strict();

const persistedClientAddressSchema = clientAddressSchema.extend({
  id: z.uuid(), complement: z.string().nullable().optional(),
});
const persistedClientContactSchema = z.object({
  id: z.uuid(), type: z.enum(["EMAIL", "PHONE", "WHATSAPP", "OTHER"]),
  label: z.string().max(50).nullable(), value: z.string().min(1).max(255), isPrimary: z.boolean(),
}).strict().superRefine((contact, context) => {
  if (contact.type === "EMAIL" && !z.email().safeParse(contact.value).success) {
    context.addIssue({ code: "custom", path: ["value"], message: "Invalid email contact" });
  }
});
export const clientTimelineItemSchema = z.object({
  id: z.uuid(), eventType: z.string().max(100), sourceModule: z.string().max(100), sourceEntityType: z.string().max(100),
  sourceEntityId: z.uuid().nullable(), summary: z.string().max(255), occurredAt: wireDateTimeSchema,
}).strict();
export const clientDetailResponseSchema = z.object({
  client: clientCoreResponseSchema.extend({
    address: persistedClientAddressSchema.nullable(), contacts: z.array(persistedClientContactSchema),
    responsibles: z.array(responsibleSchema), tags: z.array(z.string()),
  }),
  timeline: z.object({ data: z.array(clientTimelineItemSchema), meta: cursorMetaSchema }).strict(),
}).strict();
export const responsibleListResponseSchema = z.object({ items: z.array(responsibleSchema) }).strict();

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>;
export type ClientDetailQuery = z.infer<typeof clientDetailQuerySchema>;
export type ResponsibleResponse = z.infer<typeof responsibleSchema>;
export type CursorMetaResponse = z.infer<typeof cursorMetaSchema>;
export type ClientMutationResponse = z.infer<typeof clientMutationResponseSchema>;
export type ClientListItemResponse = z.infer<typeof clientListItemResponseSchema>;
export type ClientListResponse = z.infer<typeof clientListResponseSchema>;
export type ClientDetailResponse = z.infer<typeof clientDetailResponseSchema>;
export type ResponsibleListResponse = z.infer<typeof responsibleListResponseSchema>;
