import { BadRequestException, Body, Controller, Get, Headers, HttpCode, Inject, Param, Patch, Post, Query, Req, Res } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError, type ZodType } from 'zod';
import { RequirePermission, RequirePermissions } from '../../core/authorization/access-policy.js';
import { AUTHORIZATION_CONTEXT, type AuthorizationContext } from '../../core/authorization/authorization-context.js';
import { AuthService } from '../auth/auth.service.js';
import {
  changeLeadStageSchema, convertLeadSchema, createLeadFollowupSchema, createLeadSchema, customizeLeadStagesSchema,
  idempotencyKeySchema, importLeadsSchema, leadIdSchema, listLeadsQuerySchema, responsibleSearchQuerySchema,
} from './crm.schemas.js';
import { CrmService } from './crm.service.js';

type AuthorizedRequest = FastifyRequest & { [AUTHORIZATION_CONTEXT]?: AuthorizationContext };
function parse<T>(schema: ZodType<T>, value: unknown): T {
  try { return schema.parse(value); }
  catch (error) {
    if (error instanceof ZodError) throw new BadRequestException({
      code: 'REQUEST_VALIDATION_FAILED', detail: 'Request validation failed',
      validationErrors: error.issues.slice(0, 20).map((issue) => ({
        field: issue.path.map(String).join('.').slice(0, 120) || 'request',
        message: issue.message.replace(/[\r\n\t]/gu, ' ').slice(0, 160),
      })),
    });
    throw error;
  }
}
function context(request: AuthorizedRequest): AuthorizationContext {
  const value = request[AUTHORIZATION_CONTEXT];
  if (!value) throw new Error('Authorization context is unavailable');
  return value;
}

@Controller('crm')
export class CrmController {
  constructor(
    @Inject(CrmService) private readonly crm: CrmService,
    @Inject(AuthService) private readonly auth: AuthService,
  ) {}

  private mutation(request: AuthorizedRequest, csrf: string | undefined, key: string | undefined) {
    const actor = context(request);
    this.auth.verifyCsrf(actor.session, csrf);
    return { actor, key: parse(idempotencyKeySchema, key) };
  }

  @Get('leads')
  @RequirePermission('crm.read')
  list(@Query() query: unknown) { return this.crm.list(parse(listLeadsQuerySchema, query)); }

  @Post('leads')
  @HttpCode(201)
  @RequirePermission('crm.create')
  async create(@Body() body: unknown, @Req() request: AuthorizedRequest, @Headers('x-csrf-token') csrf: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined, @Res({ passthrough: true }) reply: FastifyReply) {
    const { actor, key } = this.mutation(request, csrf, idempotencyKey);
    const result = await this.crm.create(actor.session.userId, key, parse(createLeadSchema, body));
    reply.code(result.status).header('Idempotency-Replayed', String(result.replayed));
    return result.body;
  }

  @Post('leads/import')
  @RequirePermission('crm.create')
  async import(@Body() body: unknown, @Req() request: AuthorizedRequest, @Headers('x-csrf-token') csrf: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined, @Res({ passthrough: true }) reply: FastifyReply) {
    const { actor, key } = this.mutation(request, csrf, idempotencyKey);
    const result = await this.crm.import(actor.session.userId, key, parse(importLeadsSchema, body));
    reply.code(result.status).header('Idempotency-Replayed', String(result.replayed));
    return result.body;
  }

  @Patch('leads/:id/stage')
  @RequirePermission('crm.update')
  async changeStage(@Param('id') id: string, @Body() body: unknown, @Req() request: AuthorizedRequest,
    @Headers('x-csrf-token') csrf: string | undefined) {
    const actor = context(request);
    this.auth.verifyCsrf(actor.session, csrf);
    return this.crm.changeStage(actor.session.userId, parse(leadIdSchema, id), parse(changeLeadStageSchema, body));
  }

  @Post('leads/:id/followups')
  @HttpCode(201)
  @RequirePermission('crm.update')
  async followup(@Param('id') id: string, @Body() body: unknown, @Req() request: AuthorizedRequest,
    @Headers('x-csrf-token') csrf: string | undefined, @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Res({ passthrough: true }) reply: FastifyReply) {
    const { actor, key } = this.mutation(request, csrf, idempotencyKey);
    const result = await this.crm.createFollowup(actor.session.userId, key, parse(leadIdSchema, id), parse(createLeadFollowupSchema, body));
    reply.code(result.status).header('Idempotency-Replayed', String(result.replayed));
    return result.body;
  }

  @Post('leads/:id/convert')
  @RequirePermissions('crm.update', 'clients.create')
  async convert(@Param('id') id: string, @Body() body: unknown, @Req() request: AuthorizedRequest,
    @Headers('x-csrf-token') csrf: string | undefined, @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Res({ passthrough: true }) reply: FastifyReply) {
    const { actor, key } = this.mutation(request, csrf, idempotencyKey);
    const result = await this.crm.convert(actor.session.userId, key, parse(leadIdSchema, id), parse(convertLeadSchema, body));
    reply.code(result.status).header('Idempotency-Replayed', String(result.replayed));
    return result.body;
  }

  @Patch('stages')
  @RequirePermission('crm.update')
  async customizeStages(@Body() body: unknown, @Req() request: AuthorizedRequest,
    @Headers('x-csrf-token') csrf: string | undefined, @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Res({ passthrough: true }) reply: FastifyReply) {
    const { actor, key } = this.mutation(request, csrf, idempotencyKey);
    const result = await this.crm.customizeStages(actor.session.userId, key, parse(customizeLeadStagesSchema, body));
    reply.code(result.status).header('Idempotency-Replayed', String(result.replayed));
    return result.body;
  }

  @Get('responsaveis')
  @RequirePermission('crm.read')
  async responsibles(@Query() query: unknown) {
    return { items: await this.crm.listResponsibles(parse(responsibleSearchQuerySchema, query).search) };
  }
}
