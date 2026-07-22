import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { AuthService } from '../../modules/auth/auth.service.js';
import { ACCESS_POLICY, type AccessPolicy } from '../authorization/access-policy.js';
import { AUTHORIZATION_CONTEXT } from '../authorization/authorization-context.js';
import { AuthorizationService } from '../authorization/authorization.service.js';

type AuthorizedRequest = FastifyRequest & { [AUTHORIZATION_CONTEXT]?: unknown };

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(AuthorizationService) private readonly authorization: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policy = this.reflector.getAllAndOverride<AccessPolicy>(ACCESS_POLICY, [context.getHandler(), context.getClass()]);
    if (!policy) throw new ForbiddenException();
    if (policy.kind === 'PUBLIC') return true;
    const request = context.switchToHttp().getRequest<AuthorizedRequest>();
    const session = await this.auth.resolveSession(request.cookies?.lyvox_session);
    const grants = policy.kind === 'PERMISSION'
      ? await this.authorization.requireGrant(session.userId, policy.permission, session.mfaVerified, policy.allowedScopes)
      : policy.kind === 'PERMISSIONS'
        ? (await Promise.all(policy.permissions.map((permission) => this.authorization.requireGrant(
          session.userId, permission, session.mfaVerified, policy.allowedScopes,
        )))).flat()
        : [];
    request[AUTHORIZATION_CONTEXT] = { session, grants };
    return true;
  }
}
