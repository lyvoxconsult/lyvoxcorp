import { BadRequestException, Body, Controller, Get, Headers, HttpCode, Inject, Post, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { z, ZodError } from 'zod';
import { RequirePermission } from '../../core/authorization/access-policy.js';
import { AUTHORIZATION_CONTEXT, type AuthorizationContext } from '../../core/authorization/authorization-context.js';
import { AuthorizationService } from '../../core/authorization/authorization.service.js';
import { AuthService } from '../auth/auth.service.js';

type AuthorizedRequest = FastifyRequest & { [AUTHORIZATION_CONTEXT]?: AuthorizationContext };

const createRoleSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(1).max(2_000).optional(),
  permissions: z.array(z.object({
    key: z.string().regex(/^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/),
    scope: z.enum(['ALL', 'OWN', 'ASSIGNED']).default('ALL'),
  })).max(100).refine((items) => new Set(items.map((item) => item.key)).size === items.length, 'Duplicate permission'),
}).strict();

function context(request: AuthorizedRequest): AuthorizationContext {
  const value = request[AUTHORIZATION_CONTEXT];
  if (!value) throw new Error('Authorization context is unavailable');
  return value;
}

@Controller()
export class AuthorizationController {
  constructor(
    @Inject(AuthorizationService) private readonly authorization: AuthorizationService,
    @Inject(AuthService) private readonly auth: AuthService,
  ) {}

  @Get('users')
  @RequirePermission('users.manage')
  async users() { return { items: await this.authorization.listUsers() }; }

  @Get('roles')
  @RequirePermission('roles.manage')
  async roles() { return { items: await this.authorization.listRoles() }; }

  @Post('roles')
  @HttpCode(201)
  @RequirePermission('roles.manage')
  async createRole(@Body() body: unknown, @Req() request: AuthorizedRequest, @Headers('x-csrf-token') csrf: string | undefined) {
    const actor = context(request);
    this.auth.verifyCsrf(actor.session, csrf);
    try {
      const input = createRoleSchema.parse(body);
      return await this.authorization.createRole(actor.session.userId, {
        name: input.name,
        ...(input.description === undefined ? {} : { description: input.description }),
        permissions: input.permissions,
      });
    } catch (error) {
      if (error instanceof ZodError) throw new BadRequestException('Request validation failed');
      throw error;
    }
  }
}
