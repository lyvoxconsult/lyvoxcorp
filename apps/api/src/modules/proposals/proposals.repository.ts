import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import { and, desc, eq, isNull } from "drizzle-orm";
import { proposals, proposalItems, contracts, clients } from "@lyvox/database/schema";
import type { CreateProposalInput, ConvertProposalToContractInput, UpdateProposalInput } from "@lyvox/validation";
import { DatabaseService } from "../auth/auth.infrastructure.js";

@Injectable()
export class ProposalsRepository {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async findAll(clientId?: string) {
    return this.database.db
      .select({
        id: proposals.id,
        clientId: proposals.clientId,
        clientName: clients.name,
        status: proposals.status,
        validUntil: proposals.validUntil,
        subtotal: proposals.subtotal,
        discount: proposals.discount,
        total: proposals.total,
        createdAt: proposals.createdAt,
      })
      .from(proposals)
      .leftJoin(clients, eq(proposals.clientId, clients.id))
      .where(
        clientId
          ? and(eq(proposals.clientId, clientId), isNull(proposals.deletedAt))
          : isNull(proposals.deletedAt)
      )
      .orderBy(desc(proposals.createdAt));
  }

  async findById(id: string) {
    const [proposal] = await this.database.db
      .select({
        id: proposals.id,
        clientId: proposals.clientId,
        clientName: clients.name,
        status: proposals.status,
        validUntil: proposals.validUntil,
        subtotal: proposals.subtotal,
        discount: proposals.discount,
        total: proposals.total,
        createdAt: proposals.createdAt,
      })
      .from(proposals)
      .leftJoin(clients, eq(proposals.clientId, clients.id))
      .where(and(eq(proposals.id, id), isNull(proposals.deletedAt)))
      .limit(1);

    if (!proposal) return null;

    const items = await this.database.db
      .select()
      .from(proposalItems)
      .where(and(eq(proposalItems.proposalId, id), isNull(proposalItems.deletedAt)));

    return {
      ...proposal,
      items,
    };
  }

  async create(input: CreateProposalInput, actorUserId?: string) {
    return this.database.db.transaction(async (tx) => {
      let subtotalNum = 0;
      const itemsToInsert = input.items.map((item) => {
        const itemTotal = item.quantity * item.unitPrice - (item.discount || 0);
        subtotalNum += itemTotal;
        return {
          description: item.description,
          quantity: String(item.quantity),
          unitPrice: String(item.unitPrice),
          discount: String(item.discount || 0),
          total: String(Math.max(0, itemTotal)),
        };
      });

      const generalDiscount = input.discount || 0;
      const totalNum = Math.max(0, subtotalNum - generalDiscount);

      const [proposal] = await tx
        .insert(proposals)
        .values({
          clientId: input.clientId,
          status: "DRAFT",
          validUntil: input.validUntil,
          subtotal: String(subtotalNum),
          discount: String(generalDiscount),
          total: String(totalNum),
          createdById: actorUserId ?? null,
          updatedById: actorUserId ?? null,
        })
        .returning();

      const createdItems = await Promise.all(
        itemsToInsert.map((item) =>
          tx
            .insert(proposalItems)
            .values({
              proposalId: proposal.id,
              ...item,
              createdById: actorUserId ?? null,
              updatedById: actorUserId ?? null,
            })
            .returning()
            .then(([res]) => res)
        )
      );

      return {
        ...proposal,
        items: createdItems,
      };
    });
  }

  async update(id: string, input: UpdateProposalInput, actorUserId?: string) {
    const existing = await this.findById(id);
    if (!existing) return null;

    return this.database.db.transaction(async (tx) => {
      let subtotalNum = Number(existing.subtotal);
      let generalDiscount = input.discount !== undefined ? input.discount : Number(existing.discount);

      if (input.items && input.items.length > 0) {
        // Soft delete old items
        await tx
          .update(proposalItems)
          .set({ deletedAt: new Date(), updatedById: actorUserId ?? null })
          .where(eq(proposalItems.proposalId, id));

        subtotalNum = 0;
        for (const item of input.items) {
          const itemTotal = item.quantity * item.unitPrice - (item.discount || 0);
          subtotalNum += itemTotal;
          await tx.insert(proposalItems).values({
            proposalId: id,
            description: item.description,
            quantity: String(item.quantity),
            unitPrice: String(item.unitPrice),
            discount: String(item.discount || 0),
            total: String(Math.max(0, itemTotal)),
            createdById: actorUserId ?? null,
            updatedById: actorUserId ?? null,
          });
        }
      }

      const totalNum = Math.max(0, subtotalNum - generalDiscount);

      const [updated] = await tx
        .update(proposals)
        .set({
          clientId: input.clientId ?? existing.clientId,
          validUntil: input.validUntil ?? existing.validUntil,
          subtotal: String(subtotalNum),
          discount: String(generalDiscount),
          total: String(totalNum),
          updatedAt: new Date(),
          updatedById: actorUserId ?? null,
        })
        .where(and(eq(proposals.id, id), isNull(proposals.deletedAt)))
        .returning();

      return updated;
    });
  }

  async approve(id: string, actorUserId?: string) {
    const [approved] = await this.database.db
      .update(proposals)
      .set({
        status: "APPROVED",
        updatedAt: new Date(),
        updatedById: actorUserId ?? null,
      })
      .where(and(eq(proposals.id, id), isNull(proposals.deletedAt)))
      .returning();

    return approved || null;
  }

  async convertToContract(proposalId: string, input: ConvertProposalToContractInput, actorUserId?: string) {
    const proposal = await this.findById(proposalId);
    if (!proposal) {
      throw new BadRequestException("Proposta não foi encontrada");
    }
    if (proposal.status !== "APPROVED") {
      throw new BadRequestException("Somente propostas com status APROVADA podem ser convertidas em contrato (FR-062/FR-063)");
    }

    return this.database.db.transaction(async (tx) => {
      // Create contract record
      const [contract] = await tx
        .insert(contracts)
        .values({
          proposalId: proposal.id,
          clientId: proposal.clientId,
          number: input.number,
          status: "ACTIVE",
          startsOn: input.startsOn,
          endsOn: input.endsOn ?? null,
          total: proposal.total,
          createdById: actorUserId ?? null,
          updatedById: actorUserId ?? null,
        })
        .returning();

      // Update proposal status
      await tx
        .update(proposals)
        .set({
          status: "CONTRACTED",
          updatedAt: new Date(),
          updatedById: actorUserId ?? null,
        })
        .where(eq(proposals.id, proposalId));

      return {
        contract,
        note: "PARTIAL_CROSS_PHASE_DEPENDENCY: Geração de parcelas no Contas a Receber (FR-063) será concluída na PHASE-016 (Financeiro).",
      };
    });
  }

  async listContracts(clientId?: string) {
    return this.database.db
      .select({
        id: contracts.id,
        proposalId: contracts.proposalId,
        clientId: contracts.clientId,
        clientName: clients.name,
        number: contracts.number,
        status: contracts.status,
        startsOn: contracts.startsOn,
        endsOn: contracts.endsOn,
        total: contracts.total,
        createdAt: contracts.createdAt,
      })
      .from(contracts)
      .leftJoin(clients, eq(contracts.clientId, clients.id))
      .where(
        clientId
          ? and(eq(contracts.clientId, clientId), isNull(contracts.deletedAt))
          : isNull(contracts.deletedAt)
      )
      .orderBy(desc(contracts.createdAt));
  }

  async getContractById(id: string) {
    const [contract] = await this.database.db
      .select({
        id: contracts.id,
        proposalId: contracts.proposalId,
        clientId: contracts.clientId,
        clientName: clients.name,
        number: contracts.number,
        status: contracts.status,
        startsOn: contracts.startsOn,
        endsOn: contracts.endsOn,
        total: contracts.total,
        createdAt: contracts.createdAt,
      })
      .from(contracts)
      .leftJoin(clients, eq(contracts.clientId, clients.id))
      .where(and(eq(contracts.id, id), isNull(contracts.deletedAt)))
      .limit(1);

    return contract || null;
  }
}
