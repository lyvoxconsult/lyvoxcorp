import { describe, expect, it } from 'vitest';
import { canAccessResource, effectiveGrant, isPermissionKey, isScopeAllowed, requirePermissionKey, scopeForRole } from './index.js';

describe('permission policy', () => {
  it('accepts only resource.action keys', () => {
    expect(isPermissionKey('clients.read')).toBe(true);
    expect(isPermissionKey('clients/read')).toBe(false);
    expect(() => requirePermissionKey('Clients.read')).toThrow('Invalid permission key');
  });

  it('denies missing grants and enforces own resources', () => {
    const grants = [{ permission: 'clients.read', scope: 'OWN' as const }];
    expect(canAccessResource(grants, 'users.manage', 'u1', { ownerId: 'u1' })).toBe(false);
    expect(canAccessResource(grants, 'clients.read', 'u1', { ownerId: 'u2' })).toBe(false);
    expect(canAccessResource(grants, 'clients.read', 'u1', { createdById: 'u1' })).toBe(true);
  });

  it('enforces assignment and combines multiple roles conservatively', () => {
    const grants = [
      { permission: 'projects.read', scope: 'ASSIGNED' as const },
      { permission: 'clients.read', scope: 'OWN' as const },
      { permission: 'clients.read', scope: 'ALL' as const },
    ];
    expect(canAccessResource(grants, 'projects.read', 'u1', { assigneeIds: ['u1'] })).toBe(true);
    expect(canAccessResource(grants, 'projects.read', 'u1', { assigneeIds: ['u2'] })).toBe(false);
    expect(effectiveGrant(grants, 'clients.read')?.scope).toBe('ALL');
  });

  it('maps canonical operational ownership without role-name authorization bypass', () => {
    expect(scopeForRole('Operacional', 'clients.read')).toBe('OWN');
    expect(scopeForRole('Operacional', 'projects.update')).toBe('ASSIGNED');
    expect(scopeForRole('Comercial', 'clients.read')).toBe('ALL');
    expect(scopeForRole('Custom', 'clients.read')).toBe('ALL');
    expect(isScopeAllowed('clients.read', 'OWN')).toBe(true);
    expect(isScopeAllowed('projects.update', 'ASSIGNED')).toBe(true);
    expect(isScopeAllowed('users.manage', 'OWN')).toBe(false);
    expect(isScopeAllowed('clients.read', 'ASSIGNED')).toBe(false);
  });
});
