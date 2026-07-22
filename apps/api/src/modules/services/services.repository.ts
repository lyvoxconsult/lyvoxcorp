import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq, isNull } from "drizzle-orm";
import { services, servicePriceVersions } from "@lyvox/database/schema";
import type { CreateServiceInput, UpdateServiceInput, UpdateServicePriceInput } from "@lyvox/validation";
import { DatabaseService } from "../auth/auth.infrastructure.js";

@Injectable()
export class ServicesRepository {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async findAll(category?: string) {
    let query = this.database.db
      .select({
        id: services.id,
        name: services.name,
        description: services.description,
        category: services.category,
        unit: services.unit,
        billingType: services.billingType,
        isActive: services.isActive,
        basePrice: services.basePrice,
        createdAt: services.createdAt,
      })
      .from(services)
      .where(
        category
          ? and(eq(services.category, category), isNull(services.deletedAt))
          : isNull(services.deletedAt)
      )
      .orderBy(desc(services.createdAt));

    return query;
  }

  async findById(id: string) {
    const [service] = await this.database.db
      .select()
      .from(services)
      .where(and(eq(services.id, id), isNull(services.deletedAt)))
      .limit(1);

    if (!service) return null;

    const priceHistory = await this.database.db
      .select()
      .from(servicePriceVersions)
      .where(and(eq(servicePriceVersions.serviceId, id), isNull(servicePriceVersions.deletedAt)))
      .orderBy(desc(servicePriceVersions.effectiveFrom));

    return {
      ...service,
      priceHistory,
    };
  }

  async create(input: CreateServiceInput, actorUserId?: string) {
    return this.database.db.transaction(async (tx) => {
      const [service] = await tx
        .insert(services)
        .values({
          name: input.name,
          description: input.description ?? null,
          category: input.category,
          unit: input.unit,
          billingType: input.billingType,
          basePrice: String(input.basePrice),
          createdById: actorUserId ?? null,
          updatedById: actorUserId ?? null,
        })
        .returning();

      const [priceVersion] = await tx
        .insert(servicePriceVersions)
        .values({
          serviceId: service.id,
          price: String(input.basePrice),
          effectiveFrom: new Date(),
          createdById: actorUserId ?? null,
          updatedById: actorUserId ?? null,
        })
        .returning();

      return {
        ...service,
        priceHistory: [priceVersion],
      };
    });
  }

  async update(id: string, input: UpdateServiceInput, actorUserId?: string) {
    const [updated] = await this.database.db
      .update(services)
      .set({
        ...input,
        updatedById: actorUserId ?? null,
        updatedAt: new Date(),
      })
      .where(and(eq(services.id, id), isNull(services.deletedAt)))
      .returning();

    return updated || null;
  }

  async updatePrice(id: string, input: UpdateServicePriceInput, actorUserId?: string) {
    return this.database.db.transaction(async (tx) => {
      const effectiveFromDate = input.effectiveFrom ? new Date(input.effectiveFrom) : new Date();

      // Close open price version
      await tx
        .update(servicePriceVersions)
        .set({
          effectiveTo: effectiveFromDate,
          updatedAt: new Date(),
          updatedById: actorUserId ?? null,
        })
        .where(
          and(
            eq(servicePriceVersions.serviceId, id),
            isNull(servicePriceVersions.effectiveTo),
            isNull(servicePriceVersions.deletedAt)
          )
        );

      // Create new price version
      const [newVersion] = await tx
        .insert(servicePriceVersions)
        .values({
          serviceId: id,
          price: String(input.price),
          effectiveFrom: effectiveFromDate,
          createdById: actorUserId ?? null,
          updatedById: actorUserId ?? null,
        })
        .returning();

      // Update current basePrice in services table
      const [updatedService] = await tx
        .update(services)
        .set({
          basePrice: String(input.price),
          updatedAt: new Date(),
          updatedById: actorUserId ?? null,
        })
        .where(and(eq(services.id, id), isNull(services.deletedAt)))
        .returning();

      return {
        service: updatedService,
        newPriceVersion: newVersion,
      };
    });
  }

  async softDelete(id: string, actorUserId?: string) {
    const [deleted] = await this.database.db
      .update(services)
      .set({
        deletedAt: new Date(),
        updatedById: actorUserId ?? null,
      })
      .where(and(eq(services.id, id), isNull(services.deletedAt)))
      .returning();

    return deleted || null;
  }
}
