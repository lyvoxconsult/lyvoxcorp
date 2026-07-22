import { z } from "zod";

export const serviceUnitSchema = z.enum(["HOUR", "UNIT", "MONTH", "PROJECT"]);
export type ServiceUnit = z.infer<typeof serviceUnitSchema>;

export const serviceBillingTypeSchema = z.enum(["ONE_TIME", "RECURRING"]);
export type ServiceBillingType = z.infer<typeof serviceBillingTypeSchema>;

export const createServiceSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  description: z.string().trim().max(2000, "Descrição muito longa").optional().nullable(),
  category: z.string().trim().min(1, "Categoria é obrigatória").max(100, "Categoria muito longa"),
  unit: serviceUnitSchema,
  billingType: serviceBillingTypeSchema,
  basePrice: z.coerce.number().min(0, "Preço base deve ser maior ou igual a zero"),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;

export const updateServiceSchema = createServiceSchema.omit({ basePrice: true }).partial();
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

export const updateServicePriceSchema = z.object({
  price: z.coerce.number().min(0, "Novo preço deve ser maior ou igual a zero"),
  effectiveFrom: z.string().datetime({ offset: true }).optional().or(z.string().datetime()),
});

export type UpdateServicePriceInput = z.infer<typeof updateServicePriceSchema>;
