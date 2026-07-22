export {
  changeLeadStageSchema, createLeadFollowupSchema, createLeadSchema, customizeLeadStagesSchema,
  importLeadsSchema, listLeadsQuerySchema, convertLeadSchema,
} from '@lyvox/validation';
export type {
  ChangeLeadStageInput, CreateLeadFollowupInput, CreateLeadInput, CustomizeLeadStagesInput,
  ImportLeadsInput, ListLeadsQuery, ConvertLeadInput,
} from '@lyvox/validation';
import { z } from 'zod';

export const leadIdSchema = z.uuid();
export const idempotencyKeySchema = z.uuid();
export const responsibleSearchQuerySchema = z.object({ search: z.string().trim().max(120).default('') }).strict();
