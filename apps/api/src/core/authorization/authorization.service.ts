import { ConflictException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { auditLogs, clients, permissions, projects, rolePermissions, roles, userRoles, users } from '@lyvox/database/schema';
import { canAccessResource, effectiveGrant, isPermissionKey, isScopeAllowed, type OwnedResource, type PermissionGrant, type ResourceScope } from '@lyvox/permissions';
import { and, asc, eq, inArray, isNull } from 'drizzle-orm';
import { DatabaseService } from '../../modules/auth/auth.infrastructure.js';

@Injectable()
export class AuthorizationService {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async grantsFor(userId: string): Promise<PermissionGrant[]> {
    const rows = await this.database.db.select({ permission: permissions.key, scope: rolePermissions.scope })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .innerJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(and(eq(userRoles.userId, userId), isNull(roles.deletedAt), isNull(permissions.deletedAt)));
    return rows.map((row) => ({ permission: row.permission, scope: row.scope as ResourceScope }));
  }

  async requireGrant(userId: string, permission: string, mfaVerified: boolean, allowedScopes: readonly ResourceScope[]): Promise<PermissionGrant[]> {
    if (!isPermissionKey(permission)) throw new ForbiddenException();
    const [administrator] = await this.database.db.select({ id: roles.id }).from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(and(eq(userRoles.userId, userId), eq(roles.name, 'Administrador'), isNull(roles.deletedAt))).limit(1);
    if (administrator && !mfaVerified) throw new ForbiddenException();
    const grants = await this.grantsFor(userId);
    if (!grants.some((grant) => grant.permission === permission && allowedScopes.includes(grant.scope))) throw new ForbiddenException();
    return grants;
  }

  async canAccessResource(userId: string, permission: string, resource: OwnedResource): Promise<boolean> {
    return canAccessResource(await this.grantsFor(userId), permission, userId, resource);
  }

  async findScopedClient(userId: string, grants: readonly PermissionGrant[], id: string) {
    const grant = effectiveGrant(grants, 'clients.read');
    if (!grant) return undefined;
    const ownership = grant.scope === 'ALL' ? undefined : eq(clients.createdById, userId);
    const [record] = await this.database.db.select({ id: clients.id, name: clients.name }).from(clients)
      .where(and(eq(clients.id, id), isNull(clients.deletedAt), ownership)).limit(1);
    return record;
  }

  async findScopedProject(userId: string, grants: readonly PermissionGrant[], id: string) {
    const grant = effectiveGrant(grants, 'projects.read');
    if (!grant) return undefined;
    const assignment = grant.scope === 'ALL' ? undefined : eq(projects.ownerId, userId);
    const [record] = await this.database.db.select({ id: projects.id, name: projects.name }).from(projects)
      .where(and(eq(projects.id, id), isNull(projects.deletedAt), assignment)).limit(1);
    return record;
  }

  async listUsers() {
    return this.database.db.select({ id: users.id, email: users.email, fullName: users.fullName, status: users.status, createdAt: users.createdAt })
      .from(users).where(isNull(users.deletedAt)).orderBy(asc(users.fullName));
  }

  async listRoles() {
    const roleRows = await this.database.db.select({ id: roles.id, name: roles.name, description: roles.description })
      .from(roles).where(isNull(roles.deletedAt)).orderBy(asc(roles.name));
    const roleIds = roleRows.map((role) => role.id);
    if (roleIds.length === 0) return [];
    const assignments = await this.database.db.select({ roleId: rolePermissions.roleId, key: permissions.key, scope: rolePermissions.scope })
      .from(rolePermissions).innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(and(inArray(rolePermissions.roleId, roleIds), isNull(permissions.deletedAt)));
    return roleRows.map((role) => ({
      ...role,
      permissions: assignments.filter((item) => item.roleId === role.id)
        .map((item) => ({ key: item.key, scope: item.scope })).sort((left, right) => left.key.localeCompare(right.key)),
    }));
  }

  async createRole(actorUserId: string, input: { name: string; description?: string; permissions: Array<{ key: string; scope: ResourceScope }> }) {
    if (input.permissions.some(({ key, scope }) => !isPermissionKey(key) || !isScopeAllowed(key, scope))) throw new ConflictException('Invalid permission scope');
    try {
      return await this.database.db.transaction(async (tx) => {
        const requestedKeys = input.permissions.map((item) => item.key);
        const available = requestedKeys.length === 0 ? [] : await tx.select({ id: permissions.id, key: permissions.key })
          .from(permissions).where(and(inArray(permissions.key, requestedKeys), isNull(permissions.deletedAt)));
        if (new Set(available.map((item) => item.key)).size !== new Set(requestedKeys).size) {
          throw new ConflictException('Unknown permission');
        }
        const [role] = await tx.insert(roles).values({ name: input.name, description: input.description, createdById: actorUserId, updatedById: actorUserId })
          .returning({ id: roles.id, name: roles.name, description: roles.description });
        if (!role) throw new Error('Role creation failed');
        if (available.length > 0) await tx.insert(rolePermissions).values(available.map((item) => ({ roleId: role.id, permissionId: item.id, scope: input.permissions.find((requested) => requested.key === item.key)?.scope ?? 'ALL' })));
        await tx.insert(auditLogs).values({ actorUserId, action: 'rbac.role.created', module: 'authorization', entityType: 'ROLE', entityId: role.id, metadata: { permissionCount: available.length } });
        return { ...role, permissions: [...input.permissions].sort((left, right) => left.key.localeCompare(right.key)) };
      });
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      const databaseError = error as { code?: string; cause?: { code?: string } };
      if (databaseError.code === '23505' || databaseError.cause?.code === '23505') throw new ConflictException('Role already exists');
      throw error;
    }
  }
}
