import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { evaluatePasswordPolicy, hashPassword } from "@lyvox/auth";
import { scopeForRole } from "@lyvox/permissions";
import pg from "pg";

const mode = process.argv[2] ?? "apply";
const supportedModes = new Set(["apply", "verify", "validate"]);

const roles = [
  ["Administrador", "Acesso administrativo integral à plataforma."],
  ["Gestão", "Gestão operacional e financeira da empresa."],
  ["Financeiro", "Operação financeira e consulta de clientes."],
  ["Comercial", "Operação comercial, CRM e clientes."],
  ["Operacional", "Execução dos projetos atribuídos."],
];

const permissions = [
  ["users.manage", "Gerenciar usuários."],
  ["roles.manage", "Gerenciar papéis e permissões."],
  ["dashboard.read", "Consultar o dashboard."],
  ["clients.read", "Consultar clientes."],
  ["clients.create", "Criar clientes."],
  ["clients.update", "Atualizar clientes."],
  ["clients.archive", "Arquivar clientes."],
  ["clients.delete", "Excluir clientes."],
  ["crm.read", "Consultar o CRM."],
  ["crm.create", "Criar e importar leads."],
  ["crm.update", "Atualizar o CRM."],
  ["proposals.approve", "Aprovar propostas."],
  ["projects.read", "Consultar projetos."],
  ["projects.update", "Atualizar projetos."],
  ["financial.read", "Consultar dados financeiros."],
  ["financial.update", "Atualizar dados financeiros."],
  ["financial.pay", "Registrar e executar pagamentos."],
  ["automations.manage", "Gerenciar automações."],
  ["audit.read", "Consultar a trilha de auditoria."],
];

const allPermissionKeys = permissions.map(([key]) => key);
const rolePermissionMatrix = new Map([
  ["Administrador", allPermissionKeys],
  [
    "Gestão",
    [
      "dashboard.read",
      "clients.read",
      "clients.create",
      "clients.update",
      "clients.archive",
      "clients.delete",
      "crm.read",
      "crm.create",
      "crm.update",
      "proposals.approve",
      "projects.read",
      "projects.update",
      "financial.read",
      "financial.update",
      "financial.pay",
    ],
  ],
  ["Financeiro", ["dashboard.read", "clients.read", "financial.read", "financial.update", "financial.pay"]],
  ["Comercial", ["dashboard.read", "clients.read", "clients.create", "clients.update", "crm.read", "crm.create", "crm.update"]],
  ["Operacional", ["dashboard.read", "clients.read", "projects.read", "projects.update"]],
]);

function fail(message) {
  throw new Error(message);
}

function parseEnvironment(source) {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separator = line.indexOf("=");
        if (separator <= 0) fail("Invalid entry in local .env file.");
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
}

function requireBootstrapInput() {
  const rawEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!rawEmail || !password) {
    fail("BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD must be provided by the process environment.");
  }

  const email = rawEmail.trim().toLowerCase();
  if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fail("BOOTSTRAP_ADMIN_EMAIL is invalid.");
  }

  const policy = evaluatePasswordPolicy(password);
  if (!policy.valid) {
    fail(`BOOTSTRAP_ADMIN_PASSWORD violates policy: ${policy.violations.join(", ")}.`);
  }
  return { email, password };
}

function loadDatabaseConfiguration() {
  const environment = parseEnvironment(
    readFileSync(new URL("../../../.env", import.meta.url), "utf8"),
  );
  const port = Number(environment.PGBOUNCER_HOST_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    fail("PGBOUNCER_HOST_PORT in local .env is invalid.");
  }
  for (const key of ["POSTGRES_DB", "POSTGRES_USER", "POSTGRES_PASSWORD"]) {
    if (!environment[key]) fail(`${key} is missing from the local .env file.`);
  }
  return {
    host: "127.0.0.1",
    port,
    database: environment.POSTGRES_DB,
    user: environment.POSTGRES_USER,
    password: environment.POSTGRES_PASSWORD,
    max: 1,
    connectionTimeoutMillis: 5_000,
  };
}

async function upsertCatalog(client, table, identityColumn, rows) {
  const ids = new Map();
  for (const [identity, description] of rows) {
    const result = await client.query(
      `insert into ${table} (${identityColumn}, description)
       values ($1, $2)
       on conflict (${identityColumn}) do update
       set description = excluded.description,
           deleted_at = null,
           updated_at = now(),
           version = ${table}.version + 1
       where ${table}.description is distinct from excluded.description
          or ${table}.deleted_at is not null
       returning id`,
      [identity, description],
    );
    if (result.rowCount === 1) {
      ids.set(identity, result.rows[0].id);
      continue;
    }
    const existing = await client.query(
      `select id from ${table} where ${identityColumn} = $1 and deleted_at is null`,
      [identity],
    );
    if (existing.rowCount !== 1) fail(`Unable to resolve canonical ${table} entry.`);
    ids.set(identity, existing.rows[0].id);
  }
  return ids;
}

function expectedAssignmentKeys() {
  return new Set(
    [...rolePermissionMatrix].flatMap(([roleName, keys]) =>
      keys.map((permissionKey) => `${roleName}\u0000${permissionKey}`),
    ),
  );
}

async function verifySeed(client, email) {
  const roleNames = roles.map(([name]) => name);
  const roleResult = await client.query(
    "select name from roles where name = any($1::varchar[]) and deleted_at is null",
    [roleNames],
  );
  if (roleResult.rowCount !== roles.length) fail("Canonical role verification failed.");

  const permissionResult = await client.query(
    "select key from permissions where key = any($1::varchar[]) and deleted_at is null",
    [allPermissionKeys],
  );
  if (permissionResult.rowCount !== permissions.length) fail("Canonical permission verification failed.");

  const assignments = await client.query(
    `select r.name, p.key, rp.scope
     from role_permissions rp
     join roles r on r.id = rp.role_id
     join permissions p on p.id = rp.permission_id
     where r.name = any($1::varchar[])`,
    [roleNames],
  );
  const expected = expectedAssignmentKeys();
  const actual = new Set(assignments.rows.map((row) => `${row.name}\u0000${row.key}`));
  if (actual.size !== expected.size || [...expected].some((entry) => !actual.has(entry))) {
    fail("Canonical role-permission matrix verification failed.");
  }
  if (assignments.rows.some((row) => row.scope !== scopeForRole(row.name, row.key))) {
    fail("Canonical role-permission scope verification failed.");
  }

  const admin = await client.query(
    `select u.id, u.status, u.deleted_at, u.password_change_required,
            exists(select 1 from password_credentials pc where pc.user_id = u.id and pc.deleted_at is null) as has_credential,
            exists(select 1 from user_roles ur join roles r on r.id = ur.role_id
                   where ur.user_id = u.id and r.name = 'Administrador' and r.deleted_at is null) as has_admin_role,
            exists(select 1 from mfa_factors mf where mf.user_id = u.id and mf.enabled = true and mf.deleted_at is null) as has_mfa
     from users u
     where lower(u.email) = $1`,
    [email],
  );
  if (admin.rowCount !== 1) fail("Bootstrap administrator verification failed.");
  const row = admin.rows[0];
  if (row.deleted_at || row.status !== "ACTIVE" || !row.has_credential || !row.has_admin_role) {
    fail("Bootstrap administrator is not active and fully provisioned.");
  }
  return { mfa: row.has_mfa ? "configured" : "pending", passwordChangeRequired: row.password_change_required };
}

async function applySeed(pool, input) {
  const client = await pool.connect();
  let userCreated = false;
  let credentialCreated = false;
  try {
    await client.query("BEGIN");
    await client.query("select pg_advisory_xact_lock(hashtext('lyvox.database.bootstrap-seed'))");

    const roleIds = await upsertCatalog(client, "roles", "name", roles);
    const permissionIds = await upsertCatalog(client, "permissions", "key", permissions);

    for (const [roleName, permissionKeys] of rolePermissionMatrix) {
      for (const permissionKey of permissionKeys) {
        await client.query(
          `insert into role_permissions (role_id, permission_id, scope) values ($1, $2, $3)
           on conflict (role_id, permission_id) do update set scope = excluded.scope
           where role_permissions.scope is distinct from excluded.scope`,
          [roleIds.get(roleName), permissionIds.get(permissionKey), scopeForRole(roleName, permissionKey)],
        );
      }
    }

    const roleIdList = [...roleIds.values()];
    const expectedPairs = [...rolePermissionMatrix].flatMap(([roleName, keys]) =>
      keys.map((key) => [roleIds.get(roleName), permissionIds.get(key)]),
    );
    await client.query(
      `delete from role_permissions rp
       where rp.role_id = any($1::uuid[])
         and not exists (
           select 1
           from unnest($2::uuid[], $3::uuid[]) expected(role_id, permission_id)
           where expected.role_id = rp.role_id and expected.permission_id = rp.permission_id
         )`,
      [roleIdList, expectedPairs.map(([roleId]) => roleId), expectedPairs.map(([, permissionId]) => permissionId)],
    );

    const existingBootstrapAdministrators = await client.query(
      `select u.email
       from users u
       join user_roles ur on ur.user_id = u.id
       where ur.role_id = $1 and u.deleted_at is null and lower(u.email) <> $2`,
      [roleIds.get("Administrador"), input.email],
    );
    if (existingBootstrapAdministrators.rowCount > 0) {
      fail("A different bootstrap administrator already exists; refusing to create another one.");
    }

    let user = await client.query(
      "select id, status, deleted_at from users where lower(email) = $1 for update",
      [input.email],
    );
    if (user.rowCount === 0) {
      user = await client.query(
        `insert into users (email, full_name, status, password_change_required)
         values ($1, 'Administrador Lyvox', 'ACTIVE', true)
         returning id, status, deleted_at`,
        [input.email],
      );
      userCreated = true;
    }
    const adminUser = user.rows[0];
    if (adminUser.deleted_at || adminUser.status !== "ACTIVE") {
      fail("An existing bootstrap administrator is inactive; seed will not reactivate it implicitly.");
    }

    const credential = await client.query(
      "select id from password_credentials where user_id = $1 and deleted_at is null for update",
      [adminUser.id],
    );
    if (credential.rowCount === 0) {
      const passwordHash = await hashPassword(input.password);
      await client.query(
        `insert into password_credentials (user_id, password_hash, password_changed_at)
         values ($1, $2, now())`,
        [adminUser.id, passwordHash],
      );
      await client.query(
        `update users
         set password_change_required = true, updated_at = now(), version = version + 1
         where id = $1 and password_change_required is distinct from true`,
        [adminUser.id],
      );
      credentialCreated = true;
    }

    await client.query(
      "insert into user_roles (user_id, role_id) values ($1, $2) on conflict do nothing",
      [adminUser.id, roleIds.get("Administrador")],
    );

    const verification = await verifySeed(client, input.email);
    await client.query("COMMIT");
    return { ...verification, userCreated, credentialCreated };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

if (!supportedModes.has(mode)) {
  fail("Usage: seed.mjs <apply|verify|validate>");
}

let pool;
try {
  const input = requireBootstrapInput();
  if (mode === "validate") {
    console.log("LYVOX_DB_SEED_INPUT_OK");
  } else {
    pool = new pg.Pool(loadDatabaseConfiguration());
    if (mode === "verify") {
      const result = await verifySeed(pool, input.email);
      console.log(`LYVOX_DB_SEED_VERIFY_OK roles=${roles.length} permissions=${permissions.length} assignments=${expectedAssignmentKeys().size} mfa=${result.mfa}`);
    } else {
      const result = await applySeed(pool, input);
      console.log(`LYVOX_DB_SEED_OK roles=${roles.length} permissions=${permissions.length} assignments=${expectedAssignmentKeys().size} admin_created=${result.userCreated} credential_created=${result.credentialCreated} password_preserved=${!result.credentialCreated} mfa=${result.mfa}`);
    }
  }
} catch (error) {
  console.error(`LYVOX_DB_SEED_ERROR ${error instanceof Error ? error.message : "Unknown failure."}`);
  process.exitCode = 1;
} finally {
  await pool?.end();
}
