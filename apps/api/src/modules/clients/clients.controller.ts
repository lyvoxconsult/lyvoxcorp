import { BadRequestException, Body, Controller, Delete, Get, Headers, HttpCode, Inject, Param, Put, Post, Query, Req, Res } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError, type ZodType } from 'zod';
import { RequireOwnedPermission, RequirePermission } from '../../core/authorization/access-policy.js';
import { AUTHORIZATION_CONTEXT, type AuthorizationContext } from '../../core/authorization/authorization-context.js';
import { AuthService } from '../auth/auth.service.js';
import {
  clientDetailQuerySchema, clientIdSchema, createClientSchema, idempotencyKeySchema, listClientsQuerySchema,
  responsibleSearchQuerySchema, updateClientSchema, versionHeaderSchema,
} from './clients.schemas.js';
import { ClientsService } from './clients.service.js';

type AuthorizedRequest = FastifyRequest & { [AUTHORIZATION_CONTEXT]?: AuthorizationContext };

function parse<T>(schema: ZodType<T>, value: unknown): T {
  try { return schema.parse(value); }
  catch (error) {
    if (error instanceof ZodError) throw new BadRequestException({
      code: 'REQUEST_VALIDATION_FAILED',
      detail: 'Request validation failed',
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

@Controller('clientes')
export class ClientsController {
  constructor(
    @Inject(ClientsService) private readonly clients: ClientsService,
    @Inject(AuthService) private readonly auth: AuthService,
  ) {}

  private mutation(request: AuthorizedRequest, csrf: string | undefined, key: string | undefined) {
    const actor = context(request);
    this.auth.verifyCsrf(actor.session, csrf);
    return { actor, key: parse(idempotencyKeySchema, key) };
  }

  @Get()
  @RequireOwnedPermission('clients.read')
  list(@Query() query: unknown, @Req() request: AuthorizedRequest) {
    const actor = context(request);
    return this.clients.list(actor.session.userId, actor.grants, parse(listClientsQuerySchema, query));
  }

  @Get('responsaveis')
  @RequirePermission('clients.read')
  async responsibles(@Query() query: unknown) {
    const input = parse(responsibleSearchQuerySchema, query);
    return { items: await this.clients.listResponsibles(input.search) };
  }

  @Post()
  @HttpCode(201)
  @RequirePermission('clients.create')
  async create(@Body() body: unknown, @Req() request: AuthorizedRequest, @Headers('x-csrf-token') csrf: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined, @Res({ passthrough: true }) reply: FastifyReply) {
    const { actor, key } = this.mutation(request, csrf, idempotencyKey);
    const result = await this.clients.create(actor.session.userId, key, parse(createClientSchema, body));
    reply.code(result.status).header('Idempotency-Replayed', String(result.replayed));
    return result.body;
  }

  @Get(':id')
  @RequireOwnedPermission('clients.read')
  get(@Param('id') id: string, @Query() query: unknown, @Req() request: AuthorizedRequest) {
    const actor = context(request);
    return this.clients.get(actor.session.userId, actor.grants, parse(clientIdSchema, id), parse(clientDetailQuerySchema, query));
  }

  @Put(':id')
  @RequirePermission('clients.update')
  async update(@Param('id') id: string, @Body() body: unknown, @Req() request: AuthorizedRequest,
    @Headers('x-csrf-token') csrf: string | undefined, @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Res({ passthrough: true }) reply: FastifyReply) {
    const { actor, key } = this.mutation(request, csrf, idempotencyKey);
    const result = await this.clients.update(actor.session.userId, key, parse(clientIdSchema, id), parse(updateClientSchema, body));
    reply.code(result.status).header('Idempotency-Replayed', String(result.replayed));
    return result.body;
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermission('clients.archive')
  async archive(@Param('id') id: string, @Req() request: AuthorizedRequest, @Headers('x-csrf-token') csrf: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined, @Headers('if-match') ifMatch: string | undefined,
    @Res({ passthrough: true }) reply: FastifyReply) {
    const { actor, key } = this.mutation(request, csrf, idempotencyKey);
    const version = parse(versionHeaderSchema, ifMatch?.replaceAll('"', ''));
    const result = await this.clients.archive(actor.session.userId, key, parse(clientIdSchema, id), version);
    reply.code(result.status).header('Idempotency-Replayed', String(result.replayed));
    return undefined;
  }
}
