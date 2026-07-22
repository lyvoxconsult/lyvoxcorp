import { ConflictException, Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import {
  auditLogs, clientAddresses, clientContacts, clientResponsibles, clients, clientTagAssignments,
  clientTags, clientTimelineEvents, idempotencyKeys, outboxEvents, users,
} from '@lyvox/database/schema';
import { effectiveGrant, type PermissionGrant } from '@lyvox/permissions';
import { cursorIdentifierSchema, normalizePersonDocument } from '@lyvox/validation';
import { and, desc, eq, exists, ilike, inArray, isNull, lt, or, sql } from 'drizzle-orm';
import { createHash } from 'node:crypto';
import { DatabaseService } from '../auth/auth.infrastructure.js';
import type { ClientDetailQuery, CreateClientInput, ListClientsQuery, UpdateClientInput } from './clients.schemas.js';

type Transaction = Parameters<Parameters<DatabaseService['db']['transaction']>[0]>[0];
type MutationResult<T> = { status: number; body: T; replayed: boolean };

function normalizedTag(value: string): string { return value.normalize('NFKC').toLocaleLowerCase('pt-BR'); }
function requestHash(value: unknown): string { return createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
function duplicateDocument(): never {
  throw new UnprocessableEntityException({ code: 'CLIENT_DOCUMENT_DUPLICATED' });
}
function databaseCode(error: unknown): string | undefined {
  const value = error as { code?: string; cause?: { code?: string } };
  return value.code ?? value.cause?.code;
}

@Injectable()
export class ClientsService {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  private scopeCondition(actorUserId: string, grants: readonly PermissionGrant[]) {
    const grant = effectiveGrant(grants, 'clients.read');
    if (!grant) return sql`false`;
    if (grant.scope === 'ALL') return sql`true`;
    return or(
      eq(clients.createdById, actorUserId),
      exists(this.database.db.select({ value: sql`1` }).from(clientResponsibles)
        .where(and(eq(clientResponsibles.clientId, clients.id), eq(clientResponsibles.userId, actorUserId)))),
    );
  }

  private encodeCursor(value: { createdAt: Date; id: string }): string {
    return Buffer.from(JSON.stringify({ createdAt: value.createdAt.toISOString(), id: value.id })).toString('base64url');
  }

  private decodeCursor(value: string | undefined): { createdAt: Date; id: string } | undefined {
    if (!value) return undefined;
    try {
      const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as { createdAt?: unknown; id?: unknown };
      const createdAt = new Date(String(parsed.createdAt));
      const id = cursorIdentifierSchema.safeParse(parsed.id);
      if (!Number.isFinite(createdAt.getTime()) || !id.success) throw new Error();
      return { createdAt, id: id.data };
    } catch {
      throw new ConflictException({ code: 'CLIENT_CURSOR_INVALID' });
    }
  }

  async list(actorUserId: string, grants: readonly PermissionGrant[], query: ListClientsQuery) {
    const cursor = this.decodeCursor(query.cursor);
    const term = query.search?.trim();
    const normalizedDocument = term ? normalizePersonDocument(term) : undefined;
    const rows = await this.database.db.select({
      id: clients.id, type: clients.type, name: clients.name, tradeName: clients.tradeName,
      document: clients.document, email: clients.email, status: clients.status,
      version: clients.version, createdAt: clients.createdAt, updatedAt: clients.updatedAt,
    }).from(clients).where(and(
      isNull(clients.deletedAt),
      this.scopeCondition(actorUserId, grants),
      query.status ? eq(clients.status, query.status) : undefined,
      term ? or(ilike(clients.name, `%${term}%`), ilike(clients.tradeName, `%${term}%`), ilike(clients.email, `%${term}%`), normalizedDocument ? eq(clients.document, normalizedDocument) : undefined) : undefined,
      query.tag ? exists(this.database.db.select({ value: sql`1` }).from(clientTagAssignments)
        .innerJoin(clientTags, eq(clientTagAssignments.tagId, clientTags.id))
        .where(and(eq(clientTagAssignments.clientId, clients.id), eq(clientTags.normalizedName, normalizedTag(query.tag)), isNull(clientTags.deletedAt)))) : undefined,
      cursor ? or(lt(clients.createdAt, cursor.createdAt), and(eq(clients.createdAt, cursor.createdAt), lt(clients.id, cursor.id))) : undefined,
    )).orderBy(desc(clients.createdAt), desc(clients.id)).limit(query.pageSize + 1);
    const hasMore = rows.length > query.pageSize;
    const baseData = rows.slice(0, query.pageSize);
    const ids = baseData.map((row) => row.id);
    const [tagRows, responsibleRows] = ids.length === 0 ? [[], []] : await Promise.all([
      this.database.db.select({ clientId: clientTagAssignments.clientId, id: clientTags.id, name: clientTags.name })
        .from(clientTagAssignments).innerJoin(clientTags, eq(clientTagAssignments.tagId, clientTags.id))
        .where(and(inArray(clientTagAssignments.clientId, ids), isNull(clientTags.deletedAt))),
      this.database.db.select({ clientId: clientResponsibles.clientId, id: users.id, fullName: users.fullName })
        .from(clientResponsibles).innerJoin(users, eq(clientResponsibles.userId, users.id))
        .where(and(inArray(clientResponsibles.clientId, ids), eq(users.status, 'ACTIVE'), isNull(users.deletedAt))),
    ]);
    const data = baseData.map((row) => ({
      ...row,
      tags: tagRows.filter((tag) => tag.clientId === row.id).map((tag) => tag.name),
      responsibles: responsibleRows.filter((responsible) => responsible.clientId === row.id).map(({ clientId: _clientId, ...responsible }) => responsible),
    }));
    const last = data.at(-1);
    return { data, meta: { pageSize: query.pageSize, hasMore, nextCursor: hasMore && last ? this.encodeCursor(last) : null } };
  }

  async get(actorUserId: string, grants: readonly PermissionGrant[], id: string, query: ClientDetailQuery) {
    const [client] = await this.database.db.select({
      id: clients.id, type: clients.type, name: clients.name, tradeName: clients.tradeName,
      document: clients.document, email: clients.email, status: clients.status, version: clients.version,
      createdAt: clients.createdAt, updatedAt: clients.updatedAt,
    }).from(clients).where(and(eq(clients.id, id), isNull(clients.deletedAt), this.scopeCondition(actorUserId, grants))).limit(1);
    if (!client) throw new NotFoundException({ code: 'CLIENT_NOT_FOUND' });
    const timelineCursor = this.decodeTimelineCursor(query.timelineCursor);
    const [addresses, contacts, responsibleRows, tagRows, timelineRows] = await Promise.all([
      this.database.db.select({ id: clientAddresses.id, label: clientAddresses.label, postalCode: clientAddresses.postalCode,
        street: clientAddresses.street, number: clientAddresses.number, complement: clientAddresses.complement,
        district: clientAddresses.district, city: clientAddresses.city, state: clientAddresses.state, country: clientAddresses.country })
        .from(clientAddresses).where(and(eq(clientAddresses.clientId, id), isNull(clientAddresses.deletedAt))),
      this.database.db.select({ id: clientContacts.id, type: clientContacts.type, label: clientContacts.label,
        value: clientContacts.value, isPrimary: clientContacts.isPrimary })
        .from(clientContacts).where(and(eq(clientContacts.clientId, id), isNull(clientContacts.deletedAt))),
      this.database.db.select({ id: users.id, fullName: users.fullName }).from(clientResponsibles)
        .innerJoin(users, eq(clientResponsibles.userId, users.id)).where(and(eq(clientResponsibles.clientId, id), eq(users.status, 'ACTIVE'), isNull(users.deletedAt))),
      this.database.db.select({ id: clientTags.id, name: clientTags.name }).from(clientTagAssignments)
        .innerJoin(clientTags, eq(clientTagAssignments.tagId, clientTags.id)).where(and(eq(clientTagAssignments.clientId, id), isNull(clientTags.deletedAt))),
      this.database.db.select({ id: clientTimelineEvents.id, eventType: clientTimelineEvents.eventType, sourceModule: clientTimelineEvents.sourceModule,
        sourceEntityType: clientTimelineEvents.sourceEntityType, sourceEntityId: clientTimelineEvents.sourceEntityId,
        summary: clientTimelineEvents.summary, occurredAt: clientTimelineEvents.occurredAt })
        .from(clientTimelineEvents).where(and(eq(clientTimelineEvents.clientId, id), isNull(clientTimelineEvents.deletedAt),
          timelineCursor ? or(lt(clientTimelineEvents.occurredAt, timelineCursor.occurredAt), and(eq(clientTimelineEvents.occurredAt, timelineCursor.occurredAt), lt(clientTimelineEvents.id, timelineCursor.id))) : undefined))
        .orderBy(desc(clientTimelineEvents.occurredAt), desc(clientTimelineEvents.id)).limit(query.timelinePageSize + 1),
    ]);
    const timelineHasMore = timelineRows.length > query.timelinePageSize;
    const timelineData = timelineRows.slice(0, query.timelinePageSize);
    const timelineLast = timelineData.at(-1);
    return {
      client: { ...client, address: addresses[0] ?? null, contacts, responsibles: responsibleRows, tags: tagRows.map((tag) => tag.name) },
      timeline: {
        data: timelineData,
        meta: { pageSize: query.timelinePageSize, hasMore: timelineHasMore, nextCursor: timelineHasMore && timelineLast ? this.encodeTimelineCursor(timelineLast) : null },
      },
    };
  }

  private encodeTimelineCursor(value: { occurredAt: Date; id: string }): string {
    return Buffer.from(JSON.stringify({ occurredAt: value.occurredAt.toISOString(), id: value.id })).toString('base64url');
  }

  private decodeTimelineCursor(value: string | undefined): { occurredAt: Date; id: string } | undefined {
    if (!value) return undefined;
    try {
      const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as { occurredAt?: unknown; id?: unknown };
      const occurredAt = new Date(String(parsed.occurredAt));
      const id = cursorIdentifierSchema.safeParse(parsed.id);
      if (!Number.isFinite(occurredAt.getTime()) || !id.success) throw new Error();
      return { occurredAt, id: id.data };
    } catch { throw new ConflictException({ code: 'CLIENT_TIMELINE_CURSOR_INVALID' }); }
  }

  async listResponsibles(search: string) {
    return this.database.db.select({ id: users.id, fullName: users.fullName }).from(users)
      .where(and(eq(users.status, 'ACTIVE'), isNull(users.deletedAt), search ? ilike(users.fullName, `%${search}%`) : undefined))
      .orderBy(users.fullName).limit(20);
  }

  private async validateResponsibles(tx: Transaction, ids: readonly string[]): Promise<void> {
    if (ids.length === 0) return;
    const rows = await tx.select({ id: users.id }).from(users)
      .where(and(inArray(users.id, [...ids]), eq(users.status, 'ACTIVE'), isNull(users.deletedAt)));
    if (rows.length !== ids.length) throw new UnprocessableEntityException({ code: 'CLIENT_RESPONSIBLE_INVALID' });
  }

  private async replaceRelations(tx: Transaction, clientId: string, actorUserId: string, input: CreateClientInput): Promise<void> {
    await tx.update(clientAddresses).set({ deletedAt: new Date(), updatedAt: new Date(), updatedById: actorUserId }).where(and(eq(clientAddresses.clientId, clientId), isNull(clientAddresses.deletedAt)));
    await tx.update(clientContacts).set({ deletedAt: new Date(), updatedAt: new Date(), updatedById: actorUserId }).where(and(eq(clientContacts.clientId, clientId), isNull(clientContacts.deletedAt)));
    await tx.delete(clientTagAssignments).where(eq(clientTagAssignments.clientId, clientId));
    await tx.delete(clientResponsibles).where(eq(clientResponsibles.clientId, clientId));
    await this.validateResponsibles(tx, input.responsibleIds);
    if (input.address) await tx.insert(clientAddresses).values({ clientId, ...input.address, createdById: actorUserId, updatedById: actorUserId });
    if (input.contacts.length) await tx.insert(clientContacts).values(input.contacts.map((contact) => ({ clientId, ...contact, createdById: actorUserId, updatedById: actorUserId })));
    if (input.responsibleIds.length) await tx.insert(clientResponsibles).values(input.responsibleIds.map((userId) => ({ clientId, userId, assignedById: actorUserId })));
    for (const name of input.tags) {
      const normalizedName = normalizedTag(name);
      const [tag] = await tx.insert(clientTags).values({ name, normalizedName, createdById: actorUserId, updatedById: actorUserId })
        .onConflictDoUpdate({ target: clientTags.normalizedName, set: { name, deletedAt: null, updatedAt: new Date(), updatedById: actorUserId } })
        .returning({ id: clientTags.id });
      if (tag) await tx.insert(clientTagAssignments).values({ clientId, tagId: tag.id, assignedById: actorUserId });
    }
  }

  private async idempotent<T>(actorUserId: string, operationId: string, key: string, request: unknown, action: (tx: Transaction) => Promise<{ status: number; body: T }>): Promise<MutationResult<T>> {
    const hash = requestHash(request);
    return this.database.db.transaction(async (tx) => {
      const scope = `${actorUserId}:${operationId}`;
      await tx.delete(idempotencyKeys).where(lt(idempotencyKeys.expiresAt, new Date()));
      const [reservation] = await tx.insert(idempotencyKeys).values({
        scope, key, requestHash: hash, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1_000), createdById: actorUserId, updatedById: actorUserId,
      }).onConflictDoNothing().returning({ id: idempotencyKeys.id });
      if (!reservation) {
        const [existing] = await tx.select({ requestHash: idempotencyKeys.requestHash, responseStatus: idempotencyKeys.responseStatus, responseBody: idempotencyKeys.responseBody })
          .from(idempotencyKeys).where(and(eq(idempotencyKeys.scope, scope), eq(idempotencyKeys.key, key))).limit(1);
        if (!existing || existing.requestHash !== hash) throw new ConflictException({ code: 'IDEMPOTENCY_KEY_REUSED' });
        if (existing.responseStatus === null) throw new ConflictException({ code: 'IDEMPOTENCY_REQUEST_IN_PROGRESS' });
        return { status: existing.responseStatus, body: existing.responseBody as T, replayed: true };
      }
      const result = await action(tx);
      await tx.update(idempotencyKeys).set({ responseStatus: result.status, responseBody: result.body as object, updatedAt: new Date() }).where(eq(idempotencyKeys.id, reservation.id));
      return { ...result, replayed: false };
    });
  }

  async create(actorUserId: string, key: string, input: CreateClientInput) {
    try {
      return await this.idempotent(actorUserId, 'clients.create', key, input, async (tx) => {
        const [client] = await tx.insert(clients).values({
          type: input.type, name: input.name, tradeName: input.tradeName, document: input.document,
          email: input.email, status: input.status, createdById: actorUserId, updatedById: actorUserId,
        }).returning({ id: clients.id, version: clients.version });
        if (!client) throw new Error('Client creation failed');
        await this.replaceRelations(tx, client.id, actorUserId, input);
        await tx.insert(clientTimelineEvents).values({ clientId: client.id, eventType: 'CLIENT_CREATED', sourceModule: 'clients', sourceEntityType: 'CLIENT', sourceEntityId: client.id, summary: 'Cliente cadastrado', createdById: actorUserId, updatedById: actorUserId });
        await tx.insert(outboxEvents).values({ aggregateType: 'CLIENT', aggregateId: client.id, eventType: 'ClientCreated', payload: { clientId: client.id }, createdById: actorUserId, updatedById: actorUserId });
        await tx.insert(auditLogs).values({ actorUserId, action: 'clients.created', module: 'clients', entityType: 'CLIENT', entityId: client.id });
        return { status: 201, body: client };
      });
    } catch (error) {
      if (databaseCode(error) === '23505') duplicateDocument();
      throw error;
    }
  }

  async update(actorUserId: string, key: string, id: string, input: UpdateClientInput) {
    try {
      return await this.idempotent(actorUserId, 'clients.update', key, { id, ...input }, async (tx) => {
        const [client] = await tx.update(clients).set({ type: input.type, name: input.name, tradeName: input.tradeName,
          document: input.document, email: input.email, status: input.status, version: sql`${clients.version} + 1`, updatedAt: new Date(), updatedById: actorUserId })
          .where(and(eq(clients.id, id), eq(clients.version, input.version), isNull(clients.deletedAt)))
          .returning({ id: clients.id, version: clients.version });
        if (!client) {
          const [existsRecord] = await tx.select({ version: clients.version }).from(clients).where(and(eq(clients.id, id), isNull(clients.deletedAt))).limit(1);
          if (!existsRecord) throw new NotFoundException({ code: 'CLIENT_NOT_FOUND' });
          throw new ConflictException({ code: 'CLIENT_VERSION_CONFLICT' });
        }
        await this.replaceRelations(tx, id, actorUserId, input);
        await tx.insert(clientTimelineEvents).values({ clientId: id, eventType: 'CLIENT_UPDATED', sourceModule: 'clients', sourceEntityType: 'CLIENT', sourceEntityId: id, summary: 'Cliente atualizado', createdById: actorUserId, updatedById: actorUserId });
        await tx.insert(outboxEvents).values({ aggregateType: 'CLIENT', aggregateId: id, eventType: 'ClientUpdated', payload: { clientId: id, version: client.version }, createdById: actorUserId, updatedById: actorUserId });
        await tx.insert(auditLogs).values({ actorUserId, action: 'clients.updated', module: 'clients', entityType: 'CLIENT', entityId: id, metadata: { version: client.version } });
        return { status: 200, body: client };
      });
    } catch (error) {
      if (databaseCode(error) === '23505') duplicateDocument();
      throw error;
    }
  }

  async archive(actorUserId: string, key: string, id: string, version: number) {
    return this.idempotent(actorUserId, 'clients.archive', key, { id, version }, async (tx) => {
      const [client] = await tx.update(clients).set({ status: 'INACTIVE', deletedAt: new Date(), updatedAt: new Date(), updatedById: actorUserId, version: sql`${clients.version} + 1` })
        .where(and(eq(clients.id, id), eq(clients.version, version), isNull(clients.deletedAt))).returning({ id: clients.id, version: clients.version });
      if (!client) {
        const [existsRecord] = await tx.select({ version: clients.version }).from(clients).where(and(eq(clients.id, id), isNull(clients.deletedAt))).limit(1);
        if (!existsRecord) throw new NotFoundException({ code: 'CLIENT_NOT_FOUND' });
        throw new ConflictException({ code: 'CLIENT_VERSION_CONFLICT' });
      }
      await tx.insert(clientTimelineEvents).values({ clientId: id, eventType: 'CLIENT_ARCHIVED', sourceModule: 'clients', sourceEntityType: 'CLIENT', sourceEntityId: id, summary: 'Cliente arquivado', createdById: actorUserId, updatedById: actorUserId });
      await tx.insert(outboxEvents).values({ aggregateType: 'CLIENT', aggregateId: id, eventType: 'ClientArchived', payload: { clientId: id, version: client.version }, createdById: actorUserId, updatedById: actorUserId });
      await tx.insert(auditLogs).values({ actorUserId, action: 'clients.archived', module: 'clients', entityType: 'CLIENT', entityId: id, metadata: { version: client.version } });
      return { status: 204, body: {} };
    });
  }
}
