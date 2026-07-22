import { z } from 'zod';

export {
  clientAddressSchema, clientContactSchema, clientDetailQuerySchema, createClientSchema, listClientsQuerySchema, updateClientSchema,
} from '@lyvox/validation';
export type { ClientDetailQuery, CreateClientInput, ListClientsQuery, UpdateClientInput } from '@lyvox/validation';

export const clientIdSchema = z.uuid();
export const idempotencyKeySchema = z.uuid();
export const versionHeaderSchema = z.coerce.number().int().positive();
export const responsibleSearchQuerySchema = z.object({ search: z.string().trim().max(120).default('') }).strict();
