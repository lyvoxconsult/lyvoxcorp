import { z } from "zod";

export const proposalItemSchema = z.object({
  description: z.string().trim().min(1, "Descrição do item é obrigatória").max(255),
  quantity: z.coerce.number().positive("Quantidade deve ser maior que zero"),
  unitPrice: z.coerce.number().min(0, "Preço unitário deve ser maior ou igual a zero"),
  discount: z.coerce.number().min(0, "Desconto não pode ser negativo").default(0),
});

export type ProposalItemInput = z.infer<typeof proposalItemSchema>;

export const createProposalSchema = z.object({
  clientId: z.string().uuid("ID do cliente é inválido"),
  validUntil: z.string().min(1, "Data de validade é obrigatória"),
  discount: z.coerce.number().min(0, "Desconto geral não pode ser negativo").default(0),
  items: z.array(proposalItemSchema).min(1, "A proposta deve conter ao menos um item"),
});

export type CreateProposalInput = z.infer<typeof createProposalSchema>;

export const updateProposalSchema = createProposalSchema.partial();
export type UpdateProposalInput = z.infer<typeof updateProposalSchema>;

export const convertProposalToContractSchema = z.object({
  number: z.string().trim().min(1, "Número do contrato é obrigatório").max(100),
  startsOn: z.string().min(1, "Data de início é obrigatória"),
  endsOn: z.string().optional().nullable(),
});

export type ConvertProposalToContractInput = z.infer<typeof convertProposalToContractSchema>;
