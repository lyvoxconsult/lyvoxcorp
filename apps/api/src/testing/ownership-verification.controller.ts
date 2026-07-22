import { Controller, Get, Inject, NotFoundException, Param, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { RequireAssignedPermission, RequireOwnedPermission } from '../core/authorization/access-policy.js';
import { AUTHORIZATION_CONTEXT, type AuthorizationContext } from '../core/authorization/authorization-context.js';
import { AuthorizationService } from '../core/authorization/authorization.service.js';

type AuthorizedRequest = FastifyRequest & { [AUTHORIZATION_CONTEXT]?: AuthorizationContext };

function actor(request: AuthorizedRequest): AuthorizationContext {
  const value = request[AUTHORIZATION_CONTEXT];
  if (!value) throw new Error('Authorization context is unavailable');
  return value;
}

@Controller('__test/authorization')
export class OwnershipVerificationController {
  constructor(@Inject(AuthorizationService) private readonly authorization: AuthorizationService) {}

  @Get('clients/:id')
  @RequireOwnedPermission('clients.read')
  async client(@Param('id') id: string, @Req() request: AuthorizedRequest) {
    const context = actor(request);
    const record = await this.authorization.findScopedClient(context.session.userId, context.grants, id);
    if (!record) throw new NotFoundException();
    return record;
  }

  @Get('projects/:id')
  @RequireAssignedPermission('projects.read')
  async project(@Param('id') id: string, @Req() request: AuthorizedRequest) {
    const context = actor(request);
    const record = await this.authorization.findScopedProject(context.session.userId, context.grants, id);
    if (!record) throw new NotFoundException();
    return record;
  }
}
