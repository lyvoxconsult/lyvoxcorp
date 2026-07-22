import type { PermissionGrant } from '@lyvox/permissions';
import type { AuthenticatedSession } from '../../modules/auth/auth.service.js';

export const AUTHORIZATION_CONTEXT = Symbol('AUTHORIZATION_CONTEXT');

export interface AuthorizationContext {
  session: AuthenticatedSession;
  grants: readonly PermissionGrant[];
}
