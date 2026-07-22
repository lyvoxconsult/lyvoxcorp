import { ConflictException, Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import {
  auditLogs, clientTimelineEvents, idempotencyKeys, leadFollowups, leads, leadStageHistory, leadStages,
  outboxEvents, users,
} from '@lyvox/database/schema';
import {
  LEAD_LOSS_REASONS, cursorIdentifierSchema,
  type ChangeLeadStageInput, type ConvertLeadInput, type CreateLeadFollowupInput, type CreateLeadInput,
  type CustomizeLeadStagesInput, type ImportLeadsInput, type ListLeadsQuery,
} from '@lyvox/validation';
import { and, asc, count, desc, eq, ilike, inArray, isNull, lt, or, sql, sum } from 'drizzle-orm';
import { createHash, randomUUID } from 'node:crypto';
import { DatabaseService } from '../auth/auth.infrastructure.js';
import { ClientsService } from '../clients/clients.service.js';

type Transaction = Parameters<Parameters<DatabaseService['db']['transaction']>[0]>[0];
type MutationResult<T> = { status: number; body: T; replayed: boolean };
const CANONICAL_STAGE_CODES = new Set(['NEW', 'QUALIFIED', 'MEETING_SCHEDULED', 'PROPOSAL_SENT', 'WON', 'LOST']);

function requestHash(value: unknown): string { return createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
function databaseCode(error: unknown): string | undefined {
  const value = error as { code?: string; cause?: { code?: string } };
  return value.code ?? value.cause?.code;
}
function publicErrorCode(error: unknown): string {
  const response = (error as { getResponse?: () => unknown }).getResponse?.();
  if (typeof response === 'object' && response !== null && 'code' in response && typeof response.code === 'string') return response.code;
  return 'LEAD_IMPORT_ROW_FAILED';
}

@Injectable()
export class CrmService {
  constructor(
    @Inject(DatabaseService) private readonly database: DatabaseService,
    @Inject(ClientsService) private readonly clients: ClientsService,
  ) {}

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
    } catch { throw new ConflictException({ code: 'LEAD_CURSOR_INVALID' }); }
  }

  private filterConditions(query: ListLeadsQuery) {
    const term = query.search?.trim();
    return [
      isNull(leads.deletedAt),
      query.stageId ? eq(leads.stageId, query.stageId) : undefined,
      query.responsibleId ? eq(leads.responsibleId, query.responsibleId) : undefined,
      term ? or(ilike(leads.name, `%${term}%`), ilike(leads.email, `%${term}%`), ilike(leads.phone, `%${term}%`), ilike(leads.company, `%${term}%`)) : undefined,
    ] as const;
  }

  async list(query: ListLeadsQuery) {
    const cursor = this.decodeCursor(query.cursor);
    const conditions = this.filterConditions(query);
    const [stageRows, rows, totals, grouped] = await Promise.all([
      this.database.db.select({ id: leadStages.id, code: leadStages.code, name: leadStages.name, position: leadStages.position,
        color: leadStages.color, outcome: leadStages.outcome, active: leadStages.active, version: leadStages.version })
        .from(leadStages).where(and(isNull(leadStages.deletedAt), eq(leadStages.active, true))).orderBy(asc(leadStages.position)),
      this.database.db.select({
        id: leads.id, name: leads.name, email: leads.email, phone: leads.phone, company: leads.company,
        estimatedValue: leads.estimatedValue, source: leads.source, stageId: leads.stageId,
        convertedClientId: leads.convertedClientId, responsibleId: users.id, responsibleName: users.fullName,
        version: leads.version, createdAt: leads.createdAt, updatedAt: leads.updatedAt,
      }).from(leads).leftJoin(users, and(eq(leads.responsibleId, users.id), eq(users.status, 'ACTIVE'), isNull(users.deletedAt)))
        .where(and(...conditions, cursor ? or(lt(leads.createdAt, cursor.createdAt), and(eq(leads.createdAt, cursor.createdAt), lt(leads.id, cursor.id))) : undefined))
        .orderBy(desc(leads.createdAt), desc(leads.id)).limit(query.pageSize + 1),
      this.database.db.select({ total: count(), estimatedValue: sum(leads.estimatedValue) }).from(leads).where(and(...conditions)),
      this.database.db.select({ stageId: leads.stageId, total: count(), estimatedValue: sum(leads.estimatedValue) })
        .from(leads).where(and(...conditions)).groupBy(leads.stageId),
    ]);
    const hasMore = rows.length > query.pageSize;
    const baseData = rows.slice(0, query.pageSize);
    const ids = baseData.map((row) => row.id);
    const followups = ids.length === 0 ? [] : await this.database.db.select({
      id: leadFollowups.id, leadId: leadFollowups.leadId, type: leadFollowups.type, dueAt: leadFollowups.dueAt,
    }).from(leadFollowups).where(and(inArray(leadFollowups.leadId, ids), eq(leadFollowups.status, 'PENDING'), isNull(leadFollowups.deletedAt)))
      .orderBy(asc(leadFollowups.dueAt), asc(leadFollowups.id));
    const data = baseData.map(({ responsibleId, responsibleName, ...lead }) => {
      const followup = followups.find((item) => item.leadId === lead.id);
      return {
        ...lead,
        responsible: responsibleId && responsibleName ? { id: responsibleId, fullName: responsibleName } : null,
        nextFollowup: followup ? { id: followup.id, type: followup.type, dueAt: followup.dueAt, overdue: followup.dueAt < new Date() } : null,
      };
    });
    const last = data.at(-1);
    const groupedByStage = new Map(grouped.map((item) => [item.stageId, item]));
    return {
      data,
      meta: { pageSize: query.pageSize, hasMore, nextCursor: hasMore && last ? this.encodeCursor(last) : null },
      stages: stageRows,
      lossReasons: LEAD_LOSS_REASONS,
      metrics: {
        total: Number(totals[0]?.total ?? 0), estimatedValue: totals[0]?.estimatedValue ?? '0',
        byStage: stageRows.map((stage) => ({
          stageId: stage.id, count: Number(groupedByStage.get(stage.id)?.total ?? 0),
          estimatedValue: groupedByStage.get(stage.id)?.estimatedValue ?? '0',
        })),
      },
    };
  }

  private async idempotent<T>(actorUserId: string, operationId: string, key: string, request: unknown,
    action: (tx: Transaction) => Promise<{ status: number; body: T }>): Promise<MutationResult<T>> {
    const hash = requestHash(request);
    return this.database.db.transaction(async (tx) => {
      const scope = `${actorUserId}:${operationId}`;
      await tx.delete(idempotencyKeys).where(lt(idempotencyKeys.expiresAt, new Date()));
      const [reservation] = await tx.insert(idempotencyKeys).values({
        scope, key, requestHash: hash, expiresAt: new Date(Date.now() + 86_400_000), createdById: actorUserId, updatedById: actorUserId,
      }).onConflictDoNothing().returning({ id: idempotencyKeys.id });
      if (!reservation) {
        const [existing] = await tx.select({ requestHash: idempotencyKeys.requestHash, responseStatus: idempotencyKeys.responseStatus, responseBody: idempotencyKeys.responseBody })
          .from(idempotencyKeys).where(and(eq(idempotencyKeys.scope, scope), eq(idempotencyKeys.key, key))).limit(1);
        if (!existing || existing.requestHash !== hash) throw new ConflictException({ code: 'IDEMPOTENCY_KEY_REUSED' });
        if (existing.responseStatus === null) throw new ConflictException({ code: 'IDEMPOTENCY_REQUEST_IN_PROGRESS' });
        return { status: existing.responseStatus, body: existing.responseBody as T, replayed: true };
      }
      const result = await action(tx);
      await tx.update(idempotencyKeys).set({ responseStatus: result.status, responseBody: result.body as object, updatedAt: new Date() })
        .where(eq(idempotencyKeys.id, reservation.id));
      return { ...result, replayed: false };
    });
  }

  private async validateResponsible(tx: Transaction, id: string | undefined): Promise<void> {
    if (!id) return;
    const [user] = await tx.select({ id: users.id }).from(users)
      .where(and(eq(users.id, id), eq(users.status, 'ACTIVE'), isNull(users.deletedAt))).limit(1);
    if (!user) throw new UnprocessableEntityException({ code: 'LEAD_RESPONSIBLE_INVALID' });
  }

  private async resolveOpenStage(tx: Transaction, id: string | undefined) {
    const [stage] = await tx.select({ id: leadStages.id }).from(leadStages).where(and(
      id ? eq(leadStages.id, id) : eq(leadStages.code, 'NEW'), eq(leadStages.outcome, 'OPEN'),
      eq(leadStages.active, true), isNull(leadStages.deletedAt),
    )).limit(1);
    if (!stage) throw new UnprocessableEntityException({ code: 'LEAD_STAGE_INVALID' });
    return stage.id;
  }

  private async insertLead(tx: Transaction, actorUserId: string, input: CreateLeadInput) {
    const stageId = await this.resolveOpenStage(tx, input.stageId);
    await this.validateResponsible(tx, input.responsibleId);
    const [lead] = await tx.insert(leads).values({
      name: input.name, email: input.email, phone: input.phone, company: input.company,
      estimatedValue: input.estimatedValue, source: input.source, stageId, responsibleId: input.responsibleId,
      createdById: actorUserId, updatedById: actorUserId,
    }).returning({ id: leads.id, version: leads.version });
    if (!lead) throw new Error('Lead creation failed');
    await tx.insert(leadStageHistory).values({ leadId: lead.id, toStageId: stageId, createdById: actorUserId, updatedById: actorUserId });
    await tx.insert(outboxEvents).values({ aggregateType: 'LEAD', aggregateId: lead.id, eventType: 'LeadCreated', payload: { leadId: lead.id }, createdById: actorUserId, updatedById: actorUserId });
    await tx.insert(auditLogs).values({ actorUserId, action: 'leads.created', module: 'crm', entityType: 'LEAD', entityId: lead.id });
    return lead;
  }

  create(actorUserId: string, key: string, input: CreateLeadInput) {
    return this.idempotent(actorUserId, 'crm.leads.create', key, input, async (tx) => ({
      status: 201, body: await this.insertLead(tx, actorUserId, input),
    }));
  }

  import(actorUserId: string, key: string, input: ImportLeadsInput) {
    return this.idempotent(actorUserId, 'crm.leads.import', key, input, async (tx) => {
      const created: Array<{ row: number; id: string; version: number }> = [];
      const errors: Array<{ row: number; code: string }> = [];
      for (const item of input.rows) {
        try {
          const lead = await tx.transaction((savepoint) => this.insertLead(savepoint, actorUserId, item.data));
          created.push({ row: item.row, ...lead });
        } catch (error) { errors.push({ row: item.row, code: publicErrorCode(error) }); }
      }
      return { status: 200, body: { created, errors, total: input.rows.length } };
    });
  }

  async changeStage(actorUserId: string, id: string, input: ChangeLeadStageInput) {
    return this.database.db.transaction(async (tx) => {
      const [lead] = await tx.select({ id: leads.id, stageId: leads.stageId, version: leads.version, convertedClientId: leads.convertedClientId })
        .from(leads).where(and(eq(leads.id, id), isNull(leads.deletedAt))).limit(1).for('update');
      if (!lead) throw new NotFoundException({ code: 'LEAD_NOT_FOUND' });
      if (lead.convertedClientId) throw new ConflictException({ code: 'LEAD_ALREADY_CONVERTED' });
      if (lead.version !== input.version) throw new ConflictException({ code: 'LEAD_VERSION_CONFLICT' });
      if (lead.stageId === input.stageId) throw new UnprocessableEntityException({ code: 'LEAD_STAGE_UNCHANGED' });
      const [target] = await tx.select({ id: leadStages.id, outcome: leadStages.outcome }).from(leadStages)
        .where(and(eq(leadStages.id, input.stageId), eq(leadStages.active, true), isNull(leadStages.deletedAt))).limit(1);
      if (!target) throw new UnprocessableEntityException({ code: 'LEAD_STAGE_INVALID' });
      if (target.outcome === 'LOST' && (!input.lossReasonCode || !input.lossNotes)) {
        throw new UnprocessableEntityException({ code: 'LEAD_LOSS_REASON_REQUIRED' });
      }
      if (target.outcome !== 'LOST' && (input.lossReasonCode || input.lossNotes)) {
        throw new UnprocessableEntityException({ code: 'LEAD_LOSS_REASON_NOT_ALLOWED' });
      }
      const [updated] = await tx.update(leads).set({
        stageId: target.id, lossReason: input.lossReasonCode ?? null, lossNotes: input.lossNotes ?? null,
        version: sql`${leads.version} + 1`, updatedAt: new Date(), updatedById: actorUserId,
      }).where(and(eq(leads.id, id), eq(leads.version, input.version), isNull(leads.deletedAt)))
        .returning({ id: leads.id, stageId: leads.stageId, version: leads.version });
      if (!updated) throw new ConflictException({ code: 'LEAD_VERSION_CONFLICT' });
      await tx.insert(leadStageHistory).values({
        leadId: id, fromStageId: lead.stageId, toStageId: target.id, lossReason: input.lossReasonCode,
        lossNotes: input.lossNotes, createdById: actorUserId, updatedById: actorUserId,
      });
      await tx.insert(outboxEvents).values({
        aggregateType: 'LEAD', aggregateId: id, eventType: 'StageChanged',
        payload: { leadId: id, fromStageId: lead.stageId, toStageId: target.id, version: updated.version },
        createdById: actorUserId, updatedById: actorUserId,
      });
      await tx.insert(auditLogs).values({ actorUserId, action: 'leads.stage_changed', module: 'crm', entityType: 'LEAD', entityId: id,
        metadata: { fromStageId: lead.stageId, toStageId: target.id, version: updated.version } });
      return updated;
    });
  }

  createFollowup(actorUserId: string, key: string, id: string, input: CreateLeadFollowupInput) {
    return this.idempotent(actorUserId, 'crm.leads.followups.create', key, { id, ...input }, async (tx) => {
      if (new Date(input.dueAt) <= new Date()) throw new UnprocessableEntityException({ code: 'LEAD_FOLLOWUP_DUE_AT_INVALID' });
      const [lead] = await tx.select({ id: leads.id, convertedClientId: leads.convertedClientId }).from(leads)
        .where(and(eq(leads.id, id), isNull(leads.deletedAt))).limit(1);
      if (!lead) throw new NotFoundException({ code: 'LEAD_NOT_FOUND' });
      if (lead.convertedClientId) throw new ConflictException({ code: 'LEAD_ALREADY_CONVERTED' });
      await this.validateResponsible(tx, input.responsibleId);
      const [followup] = await tx.insert(leadFollowups).values({
        leadId: id, type: input.type, dueAt: new Date(input.dueAt), notes: input.notes, responsibleId: input.responsibleId,
        createdById: actorUserId, updatedById: actorUserId,
      }).returning({ id: leadFollowups.id, version: leadFollowups.version, dueAt: leadFollowups.dueAt });
      if (!followup) throw new Error('Follow-up creation failed');
      await tx.insert(outboxEvents).values({ aggregateType: 'LEAD', aggregateId: id, eventType: 'FollowupScheduled',
        payload: { leadId: id, followupId: followup.id, dueAt: followup.dueAt.toISOString(), type: input.type }, createdById: actorUserId, updatedById: actorUserId });
      await tx.insert(auditLogs).values({ actorUserId, action: 'leads.followup_scheduled', module: 'crm', entityType: 'LEAD', entityId: id,
        metadata: { followupId: followup.id } });
      return { status: 201, body: { id: followup.id, version: followup.version } };
    });
  }

  async customizeStages(actorUserId: string, key: string, input: CustomizeLeadStagesInput) {
    return this.idempotent(actorUserId, 'crm.stages.customize', key, input, async (tx) => {
      const current = await tx.select({ id: leadStages.id, code: leadStages.code, outcome: leadStages.outcome,
        position: leadStages.position, version: leadStages.version })
        .from(leadStages).where(and(eq(leadStages.active, true), isNull(leadStages.deletedAt))).orderBy(asc(leadStages.position)).for('update');
      const currentById = new Map(current.map((stage) => [stage.id, stage]));
      const requestedIds = new Set(input.stages.flatMap((stage) => stage.id ? [stage.id] : []));
      for (const stage of input.stages) {
        if (stage.id && !currentById.has(stage.id)) throw new UnprocessableEntityException({ code: 'LEAD_STAGE_INVALID' });
        if (stage.id && currentById.get(stage.id)?.version !== stage.version) throw new ConflictException({ code: 'LEAD_STAGE_VERSION_CONFLICT' });
      }
      const omitted = current.filter((stage) => !requestedIds.has(stage.id));
      if (omitted.some((stage) => CANONICAL_STAGE_CODES.has(stage.code) || stage.outcome !== 'OPEN')) {
        throw new UnprocessableEntityException({ code: 'LEAD_STAGE_PROTECTED' });
      }
      if (omitted.length) {
        const [usage] = await tx.select({ total: count() }).from(leads)
          .where(and(inArray(leads.stageId, omitted.map((stage) => stage.id)), isNull(leads.deletedAt)));
        if (Number(usage?.total ?? 0) > 0) throw new ConflictException({ code: 'LEAD_STAGE_IN_USE' });
      }
      const maximumPosition = Math.max(0, ...current.map((stage) => stage.position));
      for (const [index, stage] of current.entries()) {
        await tx.update(leadStages).set({ position: maximumPosition + 1_000 + index }).where(eq(leadStages.id, stage.id));
      }
      for (const stage of omitted) {
        await tx.update(leadStages).set({ active: false, deletedAt: new Date(), version: sql`${leadStages.version} + 1`, updatedAt: new Date(), updatedById: actorUserId })
          .where(eq(leadStages.id, stage.id));
      }
      for (const stage of input.stages) {
        if (stage.id && stage.version) {
          const [updated] = await tx.update(leadStages).set({ name: stage.name, position: stage.position, color: stage.color,
            version: sql`${leadStages.version} + 1`, updatedAt: new Date(), updatedById: actorUserId })
            .where(and(eq(leadStages.id, stage.id), eq(leadStages.version, stage.version))).returning({ id: leadStages.id });
          if (!updated) throw new ConflictException({ code: 'LEAD_STAGE_VERSION_CONFLICT' });
        } else {
          await tx.insert(leadStages).values({ code: `CUSTOM_${randomUUID().replaceAll('-', '').toUpperCase()}`, name: stage.name,
            position: stage.position, color: stage.color, outcome: 'OPEN', createdById: actorUserId, updatedById: actorUserId });
        }
      }
      await tx.insert(auditLogs).values({ actorUserId, action: 'leads.stages_customized', module: 'crm', entityType: 'LEAD_STAGE',
        metadata: { activeCount: input.stages.length } });
      const stages = await tx.select({ id: leadStages.id, code: leadStages.code, name: leadStages.name, position: leadStages.position,
        color: leadStages.color, outcome: leadStages.outcome, active: leadStages.active, version: leadStages.version })
        .from(leadStages).where(and(eq(leadStages.active, true), isNull(leadStages.deletedAt))).orderBy(asc(leadStages.position));
      return { status: 200, body: { stages } };
    });
  }

  async convert(actorUserId: string, key: string, id: string, input: ConvertLeadInput) {
    try {
      return await this.idempotent(actorUserId, 'crm.leads.convert', key, { id, ...input }, async (tx) => {
        const [lead] = await tx.select({ id: leads.id, stageId: leads.stageId, version: leads.version,
          convertedClientId: leads.convertedClientId, outcome: leadStages.outcome })
          .from(leads).innerJoin(leadStages, eq(leads.stageId, leadStages.id))
          .where(and(eq(leads.id, id), isNull(leads.deletedAt))).limit(1).for('update');
        if (!lead) throw new NotFoundException({ code: 'LEAD_NOT_FOUND' });
        if (lead.convertedClientId) throw new ConflictException({ code: 'LEAD_ALREADY_CONVERTED' });
        if (lead.version !== input.version) throw new ConflictException({ code: 'LEAD_VERSION_CONFLICT' });
        if (lead.outcome !== 'WON') throw new UnprocessableEntityException({ code: 'LEAD_NOT_WON' });
        const client = await this.clients.createInTransaction(tx, actorUserId, input.client);
        const convertedAt = new Date();
        const [updated] = await tx.update(leads).set({ convertedClientId: client.id, convertedAt,
          version: sql`${leads.version} + 1`, updatedAt: convertedAt, updatedById: actorUserId })
          .where(and(eq(leads.id, id), eq(leads.version, input.version), isNull(leads.convertedClientId), isNull(leads.deletedAt)))
          .returning({ version: leads.version });
        if (!updated) throw new ConflictException({ code: 'LEAD_VERSION_CONFLICT' });
        await tx.insert(clientTimelineEvents).values({ clientId: client.id, eventType: 'LEAD_CONVERTED', sourceModule: 'crm',
          sourceEntityType: 'LEAD', sourceEntityId: id, summary: 'Lead convertido em cliente', createdById: actorUserId, updatedById: actorUserId });
        await tx.insert(outboxEvents).values({ aggregateType: 'LEAD', aggregateId: id, eventType: 'LeadConverted',
          payload: { leadId: id, clientId: client.id }, createdById: actorUserId, updatedById: actorUserId });
        await tx.insert(auditLogs).values({ actorUserId, action: 'leads.converted', module: 'crm', entityType: 'LEAD', entityId: id,
          metadata: { clientId: client.id, version: updated.version } });
        return { status: 200, body: { leadId: id, clientId: client.id, version: updated.version } };
      });
    } catch (error) {
      if (databaseCode(error) === '23505') throw new UnprocessableEntityException({ code: 'CLIENT_DOCUMENT_DUPLICATED' });
      throw error;
    }
  }

  listResponsibles(search: string) {
    return this.database.db.select({ id: users.id, fullName: users.fullName }).from(users)
      .where(and(eq(users.status, 'ACTIVE'), isNull(users.deletedAt), search ? ilike(users.fullName, `%${search}%`) : undefined))
      .orderBy(users.fullName).limit(20);
  }
}
