import { ForbiddenException, UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AUTHORIZATION_CONTEXT } from '../authorization/authorization-context.js';
import { RbacGuard } from './rbac.guard.js';

function execution(request: Record<PropertyKey, unknown> = {}): ExecutionContext {
  return {
    getHandler: () => function handler() {},
    getClass: () => class Controller {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('RbacGuard', () => {
  it('fails closed when a matched route has no access policy', async () => {
    const guard = new RbacGuard(
      { getAllAndOverride: () => undefined } as never,
      { resolveSession: vi.fn() } as never,
      { requireGrant: vi.fn() } as never,
    );
    await expect(guard.canActivate(execution())).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows only explicitly public routes without resolving a session', async () => {
    const resolveSession = vi.fn();
    const guard = new RbacGuard(
      { getAllAndOverride: () => ({ kind: 'PUBLIC' }) } as never,
      { resolveSession } as never,
      { requireGrant: vi.fn() } as never,
    );
    await expect(guard.canActivate(execution())).resolves.toBe(true);
    expect(resolveSession).not.toHaveBeenCalled();
  });

  it('propagates 401 for an invalid session and attaches grants only after authorization', async () => {
    const unauthorized = new RbacGuard(
      { getAllAndOverride: () => ({ kind: 'PERMISSION', permission: 'users.manage', allowedScopes: ['ALL'] }) } as never,
      { resolveSession: vi.fn().mockRejectedValue(new UnauthorizedException()) } as never,
      { requireGrant: vi.fn() } as never,
    );
    await expect(unauthorized.canActivate(execution({ cookies: {} }))).rejects.toBeInstanceOf(UnauthorizedException);

    const request = { cookies: { lyvox_session: 'opaque' } } as Record<PropertyKey, unknown>;
    const session = { userId: 'user-1', mfaVerified: true };
    const grants = [{ permission: 'users.manage', scope: 'ALL' }];
    const authorized = new RbacGuard(
      { getAllAndOverride: () => ({ kind: 'PERMISSION', permission: 'users.manage', allowedScopes: ['ALL'] }) } as never,
      { resolveSession: vi.fn().mockResolvedValue(session) } as never,
      { requireGrant: vi.fn().mockResolvedValue(grants) } as never,
    );
    await expect(authorized.canActivate(execution(request))).resolves.toBe(true);
    expect(request[AUTHORIZATION_CONTEXT]).toEqual({ session, grants });
  });
});
