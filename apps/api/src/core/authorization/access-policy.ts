import { SetMetadata } from '@nestjs/common';
import { isPermissionKey } from '@lyvox/permissions';
import type { ResourceScope } from '@lyvox/permissions';

export const ACCESS_POLICY = Symbol('ACCESS_POLICY');

export type AccessPolicy =
  | { kind: 'PUBLIC' }
  | { kind: 'AUTHENTICATED'; scope: 'SELF' }
  | { kind: 'PERMISSION'; permission: string; allowedScopes: readonly ResourceScope[] };

export const PublicAccess = () => SetMetadata(ACCESS_POLICY, { kind: 'PUBLIC' } satisfies AccessPolicy);
export const AuthenticatedAccess = () => SetMetadata(ACCESS_POLICY, { kind: 'AUTHENTICATED', scope: 'SELF' } satisfies AccessPolicy);
export function RequirePermission(permission: string) {
  if (!isPermissionKey(permission)) throw new Error(`Invalid permission metadata: ${permission}`);
  return SetMetadata(ACCESS_POLICY, { kind: 'PERMISSION', permission, allowedScopes: ['ALL'] } satisfies AccessPolicy);
}

export function RequireOwnedPermission(permission: 'clients.read') {
  return SetMetadata(ACCESS_POLICY, { kind: 'PERMISSION', permission, allowedScopes: ['ALL', 'OWN'] } satisfies AccessPolicy);
}

export function RequireAssignedPermission(permission: 'projects.read' | 'projects.update') {
  return SetMetadata(ACCESS_POLICY, { kind: 'PERMISSION', permission, allowedScopes: ['ALL', 'ASSIGNED'] } satisfies AccessPolicy);
}
