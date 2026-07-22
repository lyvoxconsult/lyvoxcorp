import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createClient } from 'redis';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Pool } from 'pg';
import { generateCsrfToken, generateOpaqueToken, generateTotpCode, hashCsrfToken, hashOpaqueToken, hashPassword } from '@lyvox/auth';
import { createApp } from '../../create-app.js';
import { AuthorizationService } from '../../core/authorization/authorization.service.js';

const permissionKeys = [
  'users.manage', 'roles.manage', 'dashboard.read', 'clients.read', 'clients.create', 'clients.update',
  'clients.archive', 'clients.delete', 'crm.read', 'crm.update', 'proposals.approve', 'projects.read',
  'projects.update', 'financial.read', 'financial.update', 'financial.pay', 'automations.manage', 'audit.read',
] as const;
const roleMatrix: Record<string, readonly string[]> = {
  Administrador: permissionKeys,
  'Gestão': ['dashboard.read', 'clients.read', 'clients.create', 'clients.update', 'clients.archive', 'clients.delete', 'crm.read', 'crm.update', 'proposals.approve', 'projects.read', 'projects.update', 'financial.read', 'financial.update', 'financial.pay'],
  Financeiro: ['dashboard.read', 'clients.read', 'financial.read', 'financial.update', 'financial.pay'],
  Comercial: ['dashboard.read', 'clients.read', 'clients.create', 'clients.update', 'crm.read', 'crm.update'],
  Operacional: ['dashboard.read', 'clients.read', 'projects.read', 'projects.update'],
};

function readLocalEntries() {
  return Object.fromEntries(readFileSync(new URL('../../../../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/u).map((line) => line.trim()).filter((line) => line && !line.startsWith('#')).map((line) => {
      const separator = line.indexOf('='); return [line.slice(0, separator), line.slice(separator + 1)];
    }));
}

function readLocalEnvironment(entries: Record<string, string>) {
  const url = new URL('postgresql://127.0.0.1');
  url.port = entries.PGBOUNCER_HOST_PORT!; url.username = entries.POSTGRES_USER!; url.password = entries.POSTGRES_PASSWORD!; url.pathname = `/${entries.POSTGRES_DB}`;
  return {
    NODE_ENV: 'test', HOST: '127.0.0.1', PORT: '4000', DATABASE_URL: url.toString(),
    REDIS_URL: `redis://127.0.0.1:${entries.REDIS_HOST_PORT}`, SESSION_SECRET: entries.API_SESSION_SECRET!,
    MFA_ENCRYPTION_KEY: entries.AUTH_MFA_ENCRYPTION_KEY!, TRUSTED_ORIGINS: 'http://127.0.0.1:5173', TRUSTED_PROXY_CIDRS: '127.0.0.1,::1', SESSION_TTL_SECONDS: '3600',
  } satisfies NodeJS.ProcessEnv;
}

function docker(args: string[], environment: NodeJS.ProcessEnv = process.env): string {
  const result = spawnSync('docker', args, { encoding: 'utf8', env: environment, windowsHide: true });
  if (result.status !== 0) throw new Error(`Isolated PostgreSQL command failed: ${result.stderr.trim()}`);
  return result.stdout.trim();
}

function cookie(response: { headers: Record<string, unknown> }): string {
  const value = response.headers['set-cookie'];
  const raw = Array.isArray(value) ? value[0] : String(value ?? '');
  return raw.split(';')[0] ?? '';
}

describe.sequential('opaque session authentication integration', () => {
  const localEntries = readLocalEntries();
  const environment = readLocalEnvironment(localEntries);
  const postgresContainer = `lyvox-auth-test-${randomUUID()}`;
  let pool: Pool;
  let app: NestFastifyApplication;
  const suffix = randomUUID();
  const normal = { email: `normal-${suffix}@example.invalid`, password: 'StrongPassword1!', id: '' };
  const locked = { email: `locked-${suffix}@example.invalid`, password: 'StrongPassword2!', id: '' };
  const admin = { email: `admin-${suffix}@example.invalid`, password: 'StrongPassword3!', id: '' };
  const softDeleted = { email: `deleted-${suffix}@example.invalid`, password: 'StrongPassword4!', id: '' };
  let adminCookie = '';
  let adminCsrf = '';
  const roleUsers = new Map<string, { id: string; cookie: string }>();

  async function clearTestRateLimits() {
    const redis = createClient({ url: environment.REDIS_URL }); await redis.connect();
    for await (const keys of redis.scanIterator({ MATCH: 'lyvox:test:auth:*', COUNT: 100 })) {
      if (keys.length > 0) await redis.del(keys);
    }
    await redis.quit();
  }

  async function createUser(target: typeof normal) {
    const result = await pool.query("insert into users (email, full_name, password_change_required) values ($1, $2, false) returning id", [target.email, target.email]);
    target.id = result.rows[0].id;
    await pool.query('insert into password_credentials (user_id, password_hash) values ($1, $2)', [target.id, await hashPassword(target.password)]);
  }

  beforeAll(async () => {
    const composeSource = readFileSync(new URL('../../../../../docker-compose.yml', import.meta.url), 'utf8');
    const postgresImage = composeSource.match(/^\s*image:\s*(postgres:\S+)\s*$/mu)?.[1];
    if (!postgresImage) throw new Error('Pinned PostgreSQL image was not found in docker-compose.yml');
    docker([
      'run', '--detach', '--rm', '--name', postgresContainer, '--publish', '127.0.0.1::5432',
      '--env', 'POSTGRES_DB', '--env', 'POSTGRES_USER', '--env', 'POSTGRES_PASSWORD', postgresImage,
    ], { ...process.env, POSTGRES_DB: localEntries.POSTGRES_DB, POSTGRES_USER: localEntries.POSTGRES_USER, POSTGRES_PASSWORD: localEntries.POSTGRES_PASSWORD });
    const binding = docker(['port', postgresContainer, '5432/tcp']);
    const port = binding.match(/:(\d+)$/u)?.[1];
    if (!port) throw new Error('Unable to resolve isolated PostgreSQL port');
    const isolatedUrl = new URL('postgresql://127.0.0.1');
    isolatedUrl.port = port; isolatedUrl.username = localEntries.POSTGRES_USER!; isolatedUrl.password = localEntries.POSTGRES_PASSWORD!; isolatedUrl.pathname = `/${localEntries.POSTGRES_DB}`;
    environment.DATABASE_URL = isolatedUrl.toString();
    pool = new Pool({ connectionString: environment.DATABASE_URL });
    for (let attempt = 0; attempt < 30; attempt += 1) {
      try { await pool.query('select 1'); break; }
      catch (error) {
        if (attempt === 29) throw error;
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
    const migrationClient = await pool.connect();
    try {
      let legacyUserId = '';
      for (const name of ['0001_initial_schema.sql', '0002_auth_security.sql', '0003_rbac_scopes.sql']) {
        const sql = readFileSync(new URL(`../../../../../migrations/${name}`, import.meta.url), 'utf8');
        for (const statement of sql.split('--> statement-breakpoint').map((value) => value.trim()).filter(Boolean)) {
          await migrationClient.query(statement);
        }
        if (name === '0001_initial_schema.sql') {
          const legacyUser = await migrationClient.query("insert into users (email, full_name) values ('legacy-session@example.invalid', 'Legacy Session') returning id");
          legacyUserId = legacyUser.rows[0].id;
          await migrationClient.query("insert into sessions (user_id, token_hash, ip_address, user_agent, expires_at) values ($1, repeat('a', 64), '127.0.0.1', 'migration-proof', now() + interval '1 hour')", [legacyUserId]);
        } else if (name === '0002_auth_security.sql') {
          const migrated = await migrationClient.query("select revoked_at is not null as revoked, csrf_token_hash = repeat('0', 64) as backfilled from sessions where user_id = $1", [legacyUserId]);
          if (!migrated.rows[0]?.revoked || !migrated.rows[0]?.backfilled) throw new Error('Legacy session migration invariant failed');
          await migrationClient.query('delete from sessions where user_id = $1', [legacyUserId]);
          await migrationClient.query('delete from users where id = $1', [legacyUserId]);
          const operationalRole = await migrationClient.query("insert into roles (name) values ('Operacional') returning id");
          for (const key of ['clients.read', 'projects.read', 'projects.update']) {
            const permission = await migrationClient.query('insert into permissions (key) values ($1) returning id', [key]);
            await migrationClient.query('insert into role_permissions (role_id, permission_id) values ($1, $2)', [operationalRole.rows[0].id, permission.rows[0].id]);
          }
        } else if (name === '0003_rbac_scopes.sql') {
          const upgraded = await migrationClient.query("select p.key, rp.scope from role_permissions rp join roles r on r.id = rp.role_id join permissions p on p.id = rp.permission_id where r.name = 'Operacional' order by p.key");
          expect(upgraded.rows).toEqual([
            { key: 'clients.read', scope: 'OWN' },
            { key: 'projects.read', scope: 'ASSIGNED' },
            { key: 'projects.update', scope: 'ASSIGNED' },
          ]);
          await migrationClient.query("delete from role_permissions where role_id = (select id from roles where name = 'Operacional')");
          await migrationClient.query("delete from roles where name = 'Operacional'");
          await migrationClient.query("delete from permissions where key = any($1::varchar[])", [['clients.read', 'projects.read', 'projects.update']]);
        }
      }
    } finally { migrationClient.release(); }
    await clearTestRateLimits();
    await createUser(normal); await createUser(locked); await createUser(admin); await createUser(softDeleted);
    for (const permission of permissionKeys) await pool.query('insert into permissions (key) values ($1)', [permission]);
    for (const [roleName, assigned] of Object.entries(roleMatrix)) {
      const role = await pool.query('insert into roles (name, description) values ($1, $2) returning id', [roleName, 'Integration test']);
      for (const permission of assigned) {
        const scope = roleName === 'Operacional' && permission === 'clients.read' ? 'OWN' : roleName === 'Operacional' && permission.startsWith('projects.') ? 'ASSIGNED' : 'ALL';
        await pool.query('insert into role_permissions (role_id, permission_id, scope) select $1, id, $3 from permissions where key = $2', [role.rows[0].id, permission, scope]);
      }
      let userId = admin.id;
      if (roleName !== 'Administrador') {
        const user = await pool.query('insert into users (email, full_name, password_change_required) values ($1, $2, false) returning id', [`${roleName.toLowerCase()}-${suffix}@example.invalid`, roleName]);
        userId = user.rows[0].id;
      }
      await pool.query('insert into user_roles (user_id, role_id) values ($1, $2)', [userId, role.rows[0].id]);
      const token = generateOpaqueToken();
      await pool.query("insert into sessions (user_id, token_hash, csrf_token_hash, ip_address, user_agent, expires_at) values ($1, $2, $3, '127.0.0.80', 'rbac-integration', now() + interval '1 hour')", [userId, hashOpaqueToken(token), hashCsrfToken(generateCsrfToken())]);
      roleUsers.set(roleName, { id: userId, cookie: `lyvox_session=${token}` });
    }
    app = await createApp({ env: environment, logger: false }); await app.init(); await app.getHttpAdapter().getInstance().ready();
  }, 60_000);

  afterAll(async () => {
    await app?.close();
    await pool?.end();
    spawnSync('docker', ['rm', '--force', postgresContainer], { encoding: 'utf8', windowsHide: true });
    await clearTestRateLimits();
  });

  it('reports readiness only when the isolated PostgreSQL path and Redis are live', async () => {
    const health = await app.inject({ method: 'GET', url: '/health' });
    expect(health.statusCode).toBe(200);
    const readiness = await app.inject({ method: 'GET', url: '/readiness' });
    expect(readiness.statusCode).toBe(200);
    expect(readiness.json()).toEqual({ status: 'ready', checks: { database: 'up', redis: 'up' } });
  });

  it('rejects cross-origin login and locks the fifth consecutive invalid attempt', async () => {
    const crossSite = await app.inject({ method: 'POST', url: '/api/v1/auth/login', headers: { origin: 'https://evil.invalid' }, payload: locked, remoteAddress: '127.0.0.10' });
    expect(crossSite.statusCode).toBe(403);
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const response = await app.inject({ method: 'POST', url: '/api/v1/auth/login', headers: { origin: environment.TRUSTED_ORIGINS }, payload: { email: locked.email, password: 'WrongPassword1!' }, remoteAddress: '127.0.0.11' });
      expect(response.statusCode).toBe(attempt === 5 ? 429 : 401);
    }
    const state = await pool.query('select failed_login_attempts, locked_until > now() as locked from users where id = $1', [locked.id]);
    expect(state.rows[0]).toMatchObject({ failed_login_attempts: 5, locked: true });
    const lockedCorrectPassword = await app.inject({ method: 'POST', url: '/api/v1/auth/login', headers: { origin: environment.TRUSTED_ORIGINS }, payload: { email: locked.email, password: locked.password }, remoteAddress: '127.0.0.12' });
    expect(lockedCorrectPassword.statusCode).toBe(429);
    const unknownUser = await app.inject({ method: 'POST', url: '/api/v1/auth/login', headers: { origin: environment.TRUSTED_ORIGINS }, payload: { email: `unknown-${suffix}@example.invalid`, password: 'WrongPassword1!' }, remoteAddress: '127.0.0.13' });
    expect(unknownUser.statusCode).toBe(401);
  }, 30_000);

  it('rotates opaque sessions, enforces CSRF, lists sessions and logs out', async () => {
    await clearTestRateLimits();
    const first = await app.inject({ method: 'POST', url: '/api/v1/auth/login', headers: { origin: environment.TRUSTED_ORIGINS }, payload: { email: normal.email, password: normal.password }, remoteAddress: '127.0.0.20' });
    expect(first.statusCode).toBe(200);
    const firstBody = first.json(); const firstCookie = cookie(first);
    expect(first.headers['set-cookie']).toContain('HttpOnly'); expect(first.headers['set-cookie']).toContain('SameSite=Lax');
    const second = await app.inject({ method: 'POST', url: '/api/v1/auth/login', headers: { origin: environment.TRUSTED_ORIGINS, cookie: firstCookie }, payload: { email: normal.email, password: normal.password }, remoteAddress: '127.0.0.21' });
    const secondBody = second.json(); const secondCookie = cookie(second);
    expect(second.statusCode).toBe(200); expect(secondCookie).not.toBe(firstCookie);
    const enrollment = await app.inject({ method: 'POST', url: '/api/v1/auth/mfa/enrollment', headers: { origin: environment.TRUSTED_ORIGINS, cookie: secondCookie, 'x-csrf-token': secondBody.csrfToken } });
    expect(enrollment.statusCode).toBe(201); expect(enrollment.json().challengeToken).toBeTypeOf('string');
    const optionalSetup = await app.inject({ method: 'POST', url: '/api/v1/auth/mfa/setup', headers: { origin: environment.TRUSTED_ORIGINS }, payload: { challengeToken: enrollment.json().challengeToken } });
    expect(optionalSetup.statusCode).toBe(201); expect(optionalSetup.json().secret).toMatch(/^[A-Z2-7]{32}$/u);
    expect((await app.inject({ method: 'GET', url: '/api/v1/auth/me', headers: { cookie: firstCookie } })).statusCode).toBe(401);
    expect((await app.inject({ method: 'GET', url: '/api/v1/auth/me', headers: { cookie: secondCookie } })).statusCode).toBe(200);
    const listed = await app.inject({ method: 'GET', url: '/api/v1/auth/sessions', headers: { cookie: secondCookie } });
    expect(listed.json().items).toHaveLength(1); expect(listed.json().items[0].current).toBe(true);
    const csrfRotation = await app.inject({ method: 'POST', url: '/api/v1/auth/csrf', headers: { origin: environment.TRUSTED_ORIGINS, cookie: secondCookie, 'x-csrf-token': secondBody.csrfToken } });
    expect(csrfRotation.statusCode).toBe(200); expect(csrfRotation.headers['cache-control']).toBe('no-store');
    const wrongCsrf = await app.inject({ method: 'POST', url: '/api/v1/auth/logout', headers: { origin: environment.TRUSTED_ORIGINS, cookie: secondCookie, 'x-csrf-token': firstBody.csrfToken } });
    expect(wrongCsrf.statusCode).toBe(401);
    const logout = await app.inject({ method: 'POST', url: '/api/v1/auth/logout', headers: { origin: environment.TRUSTED_ORIGINS, cookie: secondCookie, 'x-csrf-token': csrfRotation.json().csrfToken } });
    expect(logout.statusCode).toBe(204); expect(logout.headers['set-cookie']).toContain('Expires=Thu, 01 Jan 1970');
  }, 30_000);

  it('enrolls mandatory administrator MFA and consumes a backup code once', async () => {
    await clearTestRateLimits();
    const login = await app.inject({ method: 'POST', url: '/api/v1/auth/login', headers: { origin: environment.TRUSTED_ORIGINS }, payload: { email: admin.email, password: admin.password }, remoteAddress: '127.0.0.30' });
    expect(login.statusCode).toBe(202); expect(login.json().status).toBe('MFA_ENROLLMENT_REQUIRED'); expect(login.headers['set-cookie']).toBeUndefined();
    const setup = await app.inject({ method: 'POST', url: '/api/v1/auth/mfa/setup', headers: { origin: environment.TRUSTED_ORIGINS }, payload: { challengeToken: login.json().challengeToken }, remoteAddress: '127.0.0.30' });
    expect(setup.statusCode).toBe(201); expect(setup.json().secret).toMatch(/^[A-Z2-7]{32}$/u);
    const invalid = await app.inject({ method: 'POST', url: '/api/v1/auth/mfa/activate', headers: { origin: environment.TRUSTED_ORIGINS }, payload: { challengeToken: login.json().challengeToken, code: '000000' }, remoteAddress: '127.0.0.30' });
    expect(invalid.statusCode).toBe(401);
    const enrollmentCode = generateTotpCode(setup.json().secret);
    const activate = await app.inject({ method: 'POST', url: '/api/v1/auth/mfa/activate', headers: { origin: environment.TRUSTED_ORIGINS }, payload: { challengeToken: login.json().challengeToken, code: enrollmentCode }, remoteAddress: '127.0.0.30' });
    expect(activate.statusCode).toBe(201); expect(activate.json().backupCodes).toHaveLength(8); expect(cookie(activate)).toContain('lyvox_session=');
    const secondLogin = await app.inject({ method: 'POST', url: '/api/v1/auth/login', headers: { origin: environment.TRUSTED_ORIGINS }, payload: { email: admin.email, password: admin.password }, remoteAddress: '127.0.0.31' });
    expect(secondLogin.json().status).toBe('MFA_REQUIRED');
    const totpReplay = await app.inject({ method: 'POST', url: '/api/v1/auth/mfa/challenge', headers: { origin: environment.TRUSTED_ORIGINS }, payload: { challengeToken: secondLogin.json().challengeToken, code: enrollmentCode }, remoteAddress: '127.0.0.31' });
    expect(totpReplay.statusCode).toBe(401);
    const backup = activate.json().backupCodes[0];
    const completed = await app.inject({ method: 'POST', url: '/api/v1/auth/mfa/challenge', headers: { origin: environment.TRUSTED_ORIGINS }, payload: { challengeToken: secondLogin.json().challengeToken, backupCode: backup }, remoteAddress: '127.0.0.31' });
    expect(completed.statusCode).toBe(200); adminCookie = cookie(completed); adminCsrf = completed.json().csrfToken;
    const thirdLogin = await app.inject({ method: 'POST', url: '/api/v1/auth/login', headers: { origin: environment.TRUSTED_ORIGINS }, payload: { email: admin.email, password: admin.password }, remoteAddress: '127.0.0.32' });
    const replay = await app.inject({ method: 'POST', url: '/api/v1/auth/mfa/challenge', headers: { origin: environment.TRUSTED_ORIGINS }, payload: { challengeToken: thirdLogin.json().challengeToken, backupCode: backup }, remoteAddress: '127.0.0.32' });
    expect(replay.statusCode).toBe(401);
    const parallelToken = generateOpaqueToken();
    await pool.query("insert into mfa_challenges (user_id, challenge_hash, purpose, expires_at, attempts) values ($1, $2, 'LOGIN', now() + interval '5 minutes', 4)", [admin.id, hashOpaqueToken(parallelToken)]);
    const invalidCode = enrollmentCode === '000000' ? '000001' : '000000';
    const parallel = await Promise.all([1, 2].map(() => app.inject({ method: 'POST', url: '/api/v1/auth/mfa/challenge', headers: { origin: environment.TRUSTED_ORIGINS }, payload: { challengeToken: parallelToken, code: invalidCode }, remoteAddress: '127.0.0.33' })));
    expect(parallel.map((response) => response.statusCode)).toEqual([401, 401]);
    const attempts = await pool.query('select attempts from mfa_challenges where challenge_hash = $1', [hashOpaqueToken(parallelToken)]);
    expect(attempts.rows[0].attempts).toBe(5);
  }, 60_000);

  it('enforces the exact five-role matrix, TEST-004, live revocation and administrator MFA', async () => {
    const authorization = app.get(AuthorizationService);
    for (const [roleName, expected] of Object.entries(roleMatrix)) {
      const actor = roleUsers.get(roleName)!;
      const actual = (await authorization.grantsFor(actor.id)).map((grant) => grant.permission).sort();
      expect(actual).toEqual([...expected].sort());
      expect(permissionKeys.filter((key) => !actual.includes(key))).toHaveLength(permissionKeys.length - expected.length);
    }
    expect((await app.inject({ method: 'GET', url: '/api/v1/users' })).statusCode).toBe(401);
    const commercial = await app.inject({ method: 'GET', url: '/api/v1/users', headers: { cookie: roleUsers.get('Comercial')!.cookie } });
    expect(commercial.statusCode).toBe(403);
    expect(commercial.headers['content-type']).toContain('application/problem+json');
    expect(commercial.json()).not.toHaveProperty('permission');
    expect((await app.inject({ method: 'GET', url: '/api/v1/users', headers: { cookie: adminCookie } })).statusCode).toBe(200);
    const nonMfaToken = generateOpaqueToken();
    await pool.query("insert into sessions (user_id, token_hash, csrf_token_hash, ip_address, user_agent, expires_at) values ($1, $2, $3, '127.0.0.81', 'admin-promoted', now() + interval '1 hour')", [admin.id, hashOpaqueToken(nonMfaToken), hashCsrfToken(generateCsrfToken())]);
    expect((await app.inject({ method: 'GET', url: '/api/v1/users', headers: { cookie: `lyvox_session=${nonMfaToken}` } })).statusCode).toBe(403);

    await pool.query("update permissions set deleted_at = now() where key = 'users.manage'");
    expect((await app.inject({ method: 'GET', url: '/api/v1/users', headers: { cookie: adminCookie } })).statusCode).toBe(403);
    await pool.query("update permissions set deleted_at = null where key = 'users.manage'");
  });

  it('creates a scoped custom role from database permissions with CSRF and no role-name bypass', async () => {
    const customPermissions = [{ key: 'clients.read', scope: 'OWN' }, { key: 'users.manage', scope: 'ALL' }];
    const withoutCsrf = await app.inject({ method: 'POST', url: '/api/v1/roles', headers: { origin: environment.TRUSTED_ORIGINS, cookie: adminCookie }, payload: { name: `Custom ${suffix}`, permissions: customPermissions } });
    expect(withoutCsrf.statusCode).toBe(401);
    const created = await app.inject({ method: 'POST', url: '/api/v1/roles', headers: { origin: environment.TRUSTED_ORIGINS, cookie: adminCookie, 'x-csrf-token': adminCsrf }, payload: { name: `Custom ${suffix}`, permissions: customPermissions } });
    expect(created.statusCode).toBe(201);
    expect(created.json().permissions).toEqual(customPermissions);
    const customUser = await pool.query('insert into users (email, full_name, password_change_required) values ($1, $2, false) returning id', [`custom-${suffix}@example.invalid`, 'Custom']);
    await pool.query('insert into user_roles (user_id, role_id) values ($1, $2)', [customUser.rows[0].id, created.json().id]);
    expect(await app.get(AuthorizationService).grantsFor(customUser.rows[0].id)).toEqual(expect.arrayContaining([{ permission: 'clients.read', scope: 'OWN' }, { permission: 'users.manage', scope: 'ALL' }]));
    const customToken = generateOpaqueToken();
    await pool.query("insert into sessions (user_id, token_hash, csrf_token_hash, ip_address, user_agent, expires_at) values ($1, $2, $3, '127.0.0.82', 'custom-role', now() + interval '1 hour')", [customUser.rows[0].id, hashOpaqueToken(customToken), hashCsrfToken(generateCsrfToken())]);
    expect((await app.inject({ method: 'GET', url: '/api/v1/users', headers: { cookie: `lyvox_session=${customToken}` } })).statusCode).toBe(200);
    await pool.query('delete from user_roles where user_id = $1 and role_id = $2', [customUser.rows[0].id, created.json().id]);
    expect((await app.inject({ method: 'GET', url: '/api/v1/users', headers: { cookie: `lyvox_session=${customToken}` } })).statusCode).toBe(403);
    const duplicate = await app.inject({ method: 'POST', url: '/api/v1/roles', headers: { origin: environment.TRUSTED_ORIGINS, cookie: adminCookie, 'x-csrf-token': adminCsrf }, payload: { name: `Custom ${suffix}`, permissions: [] } });
    expect(duplicate.statusCode).toBe(409);
    const unknown = await app.inject({ method: 'POST', url: '/api/v1/roles', headers: { origin: environment.TRUSTED_ORIGINS, cookie: adminCookie, 'x-csrf-token': adminCsrf }, payload: { name: `Unknown ${suffix}`, permissions: [{ key: 'unknown.read', scope: 'ALL' }] } });
    expect(unknown.statusCode).toBe(409);
    const unsafeScope = await app.inject({ method: 'POST', url: '/api/v1/roles', headers: { origin: environment.TRUSTED_ORIGINS, cookie: adminCookie, 'x-csrf-token': adminCsrf }, payload: { name: `Unsafe ${suffix}`, permissions: [{ key: 'users.manage', scope: 'OWN' }] } });
    expect(unsafeScope.statusCode).toBe(409);
  });

  it('enforces persisted ownership scopes and lets an unrestricted second role dominate', async () => {
    const authorization = app.get(AuthorizationService);
    const operational = roleUsers.get('Operacional')!;
    const commercial = roleUsers.get('Comercial')!;
    expect(await authorization.canAccessResource(operational.id, 'clients.read', { ownerId: operational.id })).toBe(true);
    expect(await authorization.canAccessResource(operational.id, 'clients.read', { ownerId: commercial.id })).toBe(false);
    expect(await authorization.canAccessResource(operational.id, 'clients.read', { ownerId: null })).toBe(false);
    expect(await authorization.canAccessResource(operational.id, 'projects.read', { assigneeIds: [operational.id] })).toBe(true);
    expect(await authorization.canAccessResource(operational.id, 'projects.read', { assigneeIds: [commercial.id] })).toBe(false);
    expect(await authorization.canAccessResource(commercial.id, 'clients.read', { ownerId: operational.id })).toBe(true);
    const documentSuffix = suffix.slice(0, 8);
    const ownClient = await pool.query("insert into clients (type, name, document, email, created_by_id) values ('PJ', 'Own Client', $1, $2, $3) returning id", [`own-${documentSuffix}`, `own-${suffix}@example.invalid`, operational.id]);
    const otherClient = await pool.query("insert into clients (type, name, document, email, created_by_id) values ('PJ', 'Other Client', $1, $2, $3) returning id", [`other-${documentSuffix}`, `other-${suffix}@example.invalid`, commercial.id]);
    expect((await app.inject({ method: 'GET', url: `/api/v1/__test/authorization/clients/${ownClient.rows[0].id}`, headers: { cookie: operational.cookie } })).statusCode).toBe(200);
    expect((await app.inject({ method: 'GET', url: `/api/v1/__test/authorization/clients/${otherClient.rows[0].id}`, headers: { cookie: operational.cookie } })).statusCode).toBe(404);
    expect((await app.inject({ method: 'GET', url: `/api/v1/__test/authorization/clients/${otherClient.rows[0].id}`, headers: { cookie: commercial.cookie } })).statusCode).toBe(200);
    const ownProject = await pool.query("insert into projects (client_id, owner_id, name) values ($1, $2, 'Assigned Project') returning id", [ownClient.rows[0].id, operational.id]);
    const otherProject = await pool.query("insert into projects (client_id, owner_id, name) values ($1, $2, 'Other Project') returning id", [otherClient.rows[0].id, commercial.id]);
    expect((await app.inject({ method: 'GET', url: `/api/v1/__test/authorization/projects/${ownProject.rows[0].id}`, headers: { cookie: operational.cookie } })).statusCode).toBe(200);
    expect((await app.inject({ method: 'GET', url: `/api/v1/__test/authorization/projects/${otherProject.rows[0].id}`, headers: { cookie: operational.cookie } })).statusCode).toBe(404);
    expect((await app.inject({ method: 'GET', url: `/api/v1/__test/authorization/projects/${otherProject.rows[0].id}`, headers: { cookie: roleUsers.get('Gestão')!.cookie } })).statusCode).toBe(200);
    await pool.query("insert into user_roles (user_id, role_id) select $1, id from roles where name = 'Gestão'", [operational.id]);
    expect(await authorization.canAccessResource(operational.id, 'clients.read', { ownerId: commercial.id })).toBe(true);
    await pool.query("delete from user_roles where user_id = $1 and role_id = (select id from roles where name = 'Gestão')", [operational.id]);
  });

  it('consumes a password-reset token once and revokes active sessions', async () => {
    const resetToken = generateOpaqueToken();
    await pool.query('insert into password_reset_tokens (user_id, token_hash, expires_at) values ($1, $2, now() + interval \'15 minutes\')', [normal.id, hashOpaqueToken(resetToken)]);
    const reset = await app.inject({ method: 'POST', url: '/api/v1/auth/password/reset', headers: { origin: environment.TRUSTED_ORIGINS }, payload: { token: resetToken, newPassword: 'NewStrongPassword1!' }, remoteAddress: '127.0.0.40' });
    expect(reset.statusCode).toBe(204);
    normal.password = 'NewStrongPassword1!';
    const replay = await app.inject({ method: 'POST', url: '/api/v1/auth/password/reset', headers: { origin: environment.TRUSTED_ORIGINS }, payload: { token: resetToken, newPassword: 'AnotherStrongPassword1!' }, remoteAddress: '127.0.0.40' });
    expect(replay.statusCode).toBe(401);
  }, 30_000);

  it('does not enumerate reset users and stores only encrypted outbox material', async () => {
    const existing = await app.inject({ method: 'POST', url: '/api/v1/auth/password/forgot', headers: { origin: environment.TRUSTED_ORIGINS }, payload: { email: normal.email }, remoteAddress: '127.0.0.41' });
    const missing = await app.inject({ method: 'POST', url: '/api/v1/auth/password/forgot', headers: { origin: environment.TRUSTED_ORIGINS }, payload: { email: `missing-${suffix}@example.invalid` }, remoteAddress: '127.0.0.42' });
    expect(existing.statusCode).toBe(202); expect(missing.statusCode).toBe(202); expect(existing.json()).toEqual(missing.json());
    const event = await pool.query("select payload from outbox_events where aggregate_id = $1 and event_type = 'PasswordResetRequested' order by created_at desc limit 1", [normal.id]);
    expect(event.rows[0].payload.encryptedToken).toMatch(/^v1\./u); expect(JSON.stringify(event.rows[0].payload)).not.toContain('lyvox_session');
    const throttled = await Promise.all(Array.from({ length: 6 }, (_, index) => app.inject({ method: 'POST', url: '/api/v1/auth/password/forgot', headers: { origin: environment.TRUSTED_ORIGINS }, payload: { email: `rate-${index}-${suffix}@example.invalid` }, remoteAddress: '127.0.0.43' })));
    expect(throttled.filter((response) => response.statusCode === 202)).toHaveLength(5);
    expect(throttled.filter((response) => response.statusCode === 429)).toHaveLength(1);
  });

  it('isolates session revocation, supports logout-all and revokes every session on password change', async () => {
    await clearTestRateLimits();
    const login = async (ip: string) => app.inject({ method: 'POST', url: '/api/v1/auth/login', headers: { origin: environment.TRUSTED_ORIGINS }, payload: { email: normal.email, password: normal.password }, remoteAddress: ip });
    const one = await login('127.0.0.60'); const two = await login('127.0.0.61');
    const oneCookie = cookie(one); const oneBody = one.json(); const twoCookie = cookie(two); const twoBody = two.json();
    const adminSessions = await app.inject({ method: 'GET', url: '/api/v1/auth/sessions', headers: { cookie: adminCookie } });
    const crossUserId = adminSessions.json().items[0].id;
    const crossRevoke = await app.inject({ method: 'DELETE', url: `/api/v1/auth/sessions/${crossUserId}`, headers: { origin: environment.TRUSTED_ORIGINS, cookie: oneCookie, 'x-csrf-token': oneBody.csrfToken } });
    expect(crossRevoke.statusCode).toBe(401);
    const own = await app.inject({ method: 'GET', url: '/api/v1/auth/sessions', headers: { cookie: oneCookie } });
    const otherId = own.json().items.find((item: { current: boolean }) => !item.current).id;
    expect((await app.inject({ method: 'DELETE', url: `/api/v1/auth/sessions/${otherId}`, headers: { origin: environment.TRUSTED_ORIGINS, cookie: oneCookie, 'x-csrf-token': oneBody.csrfToken } })).statusCode).toBe(204);
    expect((await app.inject({ method: 'GET', url: '/api/v1/auth/me', headers: { cookie: twoCookie } })).statusCode).toBe(401);
    const three = await login('127.0.0.62'); const threeCookie = cookie(three);
    const logoutAll = await app.inject({ method: 'POST', url: '/api/v1/auth/logout-all', headers: { origin: environment.TRUSTED_ORIGINS, cookie: oneCookie, 'x-csrf-token': oneBody.csrfToken } });
    expect(logoutAll.statusCode).toBe(204); expect((await app.inject({ method: 'GET', url: '/api/v1/auth/me', headers: { cookie: threeCookie } })).statusCode).toBe(401);
    const four = await login('127.0.0.63'); const fourCookie = cookie(four); const fourBody = four.json();
    const weakPassword = await app.inject({ method: 'POST', url: '/api/v1/auth/password/change', headers: { origin: environment.TRUSTED_ORIGINS, cookie: fourCookie, 'x-csrf-token': fourBody.csrfToken }, payload: { currentPassword: normal.password, newPassword: 'weak' } });
    expect(weakPassword.statusCode).toBe(409);
    const wrongCurrentPassword = await app.inject({ method: 'POST', url: '/api/v1/auth/password/change', headers: { origin: environment.TRUSTED_ORIGINS, cookie: fourCookie, 'x-csrf-token': fourBody.csrfToken }, payload: { currentPassword: 'WrongPassword1!', newPassword: 'DifferentStrongPassword1!' } });
    expect(wrongCurrentPassword.statusCode).toBe(401);
    const samePassword = await app.inject({ method: 'POST', url: '/api/v1/auth/password/change', headers: { origin: environment.TRUSTED_ORIGINS, cookie: fourCookie, 'x-csrf-token': fourBody.csrfToken }, payload: { currentPassword: normal.password, newPassword: normal.password } });
    expect(samePassword.statusCode).toBe(409);
    const changed = await app.inject({ method: 'POST', url: '/api/v1/auth/password/change', headers: { origin: environment.TRUSTED_ORIGINS, cookie: fourCookie, 'x-csrf-token': fourBody.csrfToken }, payload: { currentPassword: normal.password, newPassword: 'NewestStrongPassword1!' } });
    expect(changed.statusCode).toBe(204); expect((await app.inject({ method: 'GET', url: '/api/v1/auth/me', headers: { cookie: fourCookie } })).statusCode).toBe(401);
    normal.password = 'NewestStrongPassword1!';
    expect(twoBody.csrfToken).toBeTypeOf('string');
  }, 60_000);

  it('authenticates an active DB session when Redis is unavailable', async () => {
    const token = generateOpaqueToken(); const csrf = generateCsrfToken();
    await pool.query("insert into sessions (user_id, token_hash, csrf_token_hash, ip_address, user_agent, expires_at) values ($1, $2, $3, '127.0.0.50', 'integration', now() + interval '1 hour')", [normal.id, hashOpaqueToken(token), hashCsrfToken(csrf)]);
    const unavailable = await createApp({ env: { ...environment, REDIS_URL: 'redis://127.0.0.1:1' }, logger: false }); await unavailable.init();
    try {
      const me = await unavailable.inject({ method: 'GET', url: '/api/v1/auth/me', headers: { cookie: `lyvox_session=${token}` } });
      expect(me.statusCode).toBe(200); expect(me.json().id).toBe(normal.id);
    } finally { await unavailable.close(); }
  });

  it('rejects soft-deleted credentials, sessions, and reset tokens', async () => {
    await pool.query('update password_credentials set deleted_at = now() where user_id = $1', [softDeleted.id]);
    const deletedCredential = await app.inject({ method: 'POST', url: '/api/v1/auth/login', headers: { origin: environment.TRUSTED_ORIGINS }, payload: { email: softDeleted.email, password: softDeleted.password }, remoteAddress: '127.0.0.70' });
    expect(deletedCredential.statusCode).toBe(401);

    const sessionToken = generateOpaqueToken();
    await pool.query("insert into sessions (user_id, token_hash, csrf_token_hash, ip_address, user_agent, expires_at, deleted_at) values ($1, $2, $3, '127.0.0.71', 'integration', now() + interval '1 hour', now())", [normal.id, hashOpaqueToken(sessionToken), hashCsrfToken(generateCsrfToken())]);
    expect((await app.inject({ method: 'GET', url: '/api/v1/auth/me', headers: { cookie: `lyvox_session=${sessionToken}` } })).statusCode).toBe(401);

    const resetToken = generateOpaqueToken();
    await pool.query("insert into password_reset_tokens (user_id, token_hash, expires_at, deleted_at) values ($1, $2, now() + interval '15 minutes', now())", [normal.id, hashOpaqueToken(resetToken)]);
    const deletedReset = await app.inject({ method: 'POST', url: '/api/v1/auth/password/reset', headers: { origin: environment.TRUSTED_ORIGINS }, payload: { token: resetToken, newPassword: 'IgnoredStrongPassword1!' }, remoteAddress: '127.0.0.72' });
    expect(deletedReset.statusCode).toBe(401);
  }, 30_000);
});
