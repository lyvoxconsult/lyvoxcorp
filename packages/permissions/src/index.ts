export const PERMISSION_KEY_PATTERN = /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/;

export type ResourceScope = 'ALL' | 'OWN' | 'ASSIGNED';

export interface PermissionGrant {
  permission: string;
  scope: ResourceScope;
}

export interface OwnedResource {
  createdById?: string | null;
  ownerId?: string | null;
  assigneeIds?: readonly string[];
}

const SCOPE_PRIORITY: Record<ResourceScope, number> = { ASSIGNED: 1, OWN: 2, ALL: 3 };

export function isPermissionKey(value: string): boolean {
  return PERMISSION_KEY_PATTERN.test(value);
}

export function effectiveGrant(grants: readonly PermissionGrant[], permission: string): PermissionGrant | undefined {
  return grants
    .filter((grant) => grant.permission === permission)
    .sort((left, right) => SCOPE_PRIORITY[right.scope] - SCOPE_PRIORITY[left.scope])[0];
}

export function canAccessResource(
  grants: readonly PermissionGrant[],
  permission: string,
  actorUserId: string,
  resource: OwnedResource,
): boolean {
  const matching = grants.filter((grant) => grant.permission === permission);
  if (matching.some((grant) => grant.scope === 'ALL')) return true;
  if (matching.some((grant) => grant.scope === 'OWN')) {
    if (resource.ownerId === actorUserId || resource.createdById === actorUserId) return true;
  }
  return matching.some((grant) => grant.scope === 'ASSIGNED' && resource.assigneeIds?.includes(actorUserId));
}

export function requirePermissionKey(value: string): string {
  if (!isPermissionKey(value)) throw new Error('Invalid permission key');
  return value;
}

export function scopeForRole(roleName: string, permission: string): ResourceScope {
  if (roleName === 'Operacional' && permission === 'clients.read') return 'OWN';
  if (roleName === 'Operacional' && (permission === 'projects.read' || permission === 'projects.update')) return 'ASSIGNED';
  return 'ALL';
}

export function isScopeAllowed(permission: string, scope: ResourceScope): boolean {
  if (scope === 'ALL') return true;
  if (scope === 'OWN') return permission === 'clients.read';
  return permission === 'projects.read' || permission === 'projects.update';
}
