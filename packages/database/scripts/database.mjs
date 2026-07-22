import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import pg from "pg";

const command = process.argv[2];
const projectRoot = fileURLToPath(new URL("../../../", import.meta.url));
if (!new Set(["migrate", "verify"]).has(command)) {
  fail("Usage: node scripts/database.mjs <migrate|verify>");
}

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
        if (separator <= 0) fail(`Invalid .env entry: ${line}`);
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
}

function verifyInfrastructure() {
  const result = spawnSync(process.execPath, ["scripts/infra-local.mjs", "health"], {
    cwd: projectRoot,
    stdio: "inherit",
  });
  if (result.status !== 0) fail("Local infrastructure health verification failed.");
}

verifyInfrastructure();
const environment = parseEnvironment(readFileSync(new URL("../../../.env", import.meta.url), "utf8"));
const migrationsFolder = fileURLToPath(new URL("../../../migrations", import.meta.url));
const pool = new pg.Pool({
  host: "127.0.0.1",
  port: Number(environment.PGBOUNCER_HOST_PORT),
  database: environment.POSTGRES_DB,
  user: environment.POSTGRES_USER,
  password: environment.POSTGRES_PASSWORD,
  max: 1,
  connectionTimeoutMillis: 5_000,
});

function loadMigrations() {
  const journal = JSON.parse(readFileSync(`${migrationsFolder}/meta/_journal.json`, "utf8"));
  const tags = new Set();
  return journal.entries.map((entry) => {
    if (tags.has(entry.tag)) fail(`Duplicate migration tag: ${entry.tag}`);
    tags.add(entry.tag);
    const sql = readFileSync(`${migrationsFolder}/${entry.tag}.sql`, "utf8");
    return {
      tag: entry.tag,
      createdAt: String(entry.when),
      hash: createHash("sha256").update(sql).digest("hex"),
      sql,
    };
  });
}

async function runMigrations() {
  const migrations = loadMigrations();
  const client = await pool.connect();
  let before = 0;
  try {
    await client.query("BEGIN");
    await client.query("select pg_advisory_xact_lock(hashtext('lyvox.database.migrations'))");
    await client.query("create schema if not exists drizzle");
    await client.query(`
      create table if not exists drizzle.__drizzle_migrations (
        id serial primary key,
        hash text not null,
        created_at bigint not null
      )
    `);
    const applied = await client.query(
      "select hash, created_at::text as created_at from drizzle.__drizzle_migrations order by created_at, id",
    );
    before = applied.rowCount;
    if (before > migrations.length) fail("Database contains migrations absent from the local journal");
    for (let index = 0; index < applied.rows.length; index += 1) {
      const local = migrations[index];
      const remote = applied.rows[index];
      if (!local || remote.created_at !== local.createdAt || remote.hash !== local.hash) {
        fail(`Applied migration drift detected at position ${index + 1}`);
      }
    }
    for (const migration of migrations.slice(before)) {
      await client.query(migration.sql);
      await client.query(
        "insert into drizzle.__drizzle_migrations (hash, created_at) values ($1, $2)",
        [migration.hash, migration.createdAt],
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
  const hash = migrations.at(-1)?.hash ?? "none";
  console.log(`LYVOX_DB_MIGRATE_OK applied=${migrations.length - before} total=${migrations.length} sha256=${hash}`);
}

async function expectRejected(client, label, statement, parameters = []) {
  const savepoint = `check_${randomUUID().replaceAll("-", "")}`;
  await client.query(`SAVEPOINT ${savepoint}`);
  let rejected = false;
  try {
    await client.query(statement, parameters);
  } catch (error) {
    rejected = true;
    if (!new Set(["23503", "23505", "23514", "P0001"]).has(error.code)) throw error;
  } finally {
    await client.query(`ROLLBACK TO SAVEPOINT ${savepoint}`);
  }
  if (!rejected) throw new Error(`${label} was accepted unexpectedly`);
}

async function verifySchema() {
  const expectedTables = [
    "audit_logs", "client_addresses", "client_contacts", "client_responsibles", "client_tag_assignments",
    "client_tags", "client_timeline_events", "clients", "contracts", "financial_transactions", "idempotency_keys",
    "inbox_events", "leads", "meetings", "mfa_backup_codes", "mfa_challenges", "mfa_factors",
    "lead_followups", "lead_stage_history", "lead_stages", "outbox_events", "password_credentials", "password_reset_tokens", "permissions", "projects",
    "proposal_items", "proposals", "role_permissions", "roles", "sessions", "task_attachments",
    "task_comments", "tasks", "user_roles", "users",
  ];
  const tablesResult = await pool.query(
    "select table_name from information_schema.tables where table_schema = 'public' order by table_name",
  );
  const actualTables = tablesResult.rows.map((row) => row.table_name);
  const missing = expectedTables.filter((table) => !actualTables.includes(table));
  if (missing.length) throw new Error(`Missing tables: ${missing.join(",")}`);

  const extension = await pool.query(
    "select extname from pg_extension where extname = 'pg_trgm'",
  );
  if (extension.rowCount !== 1) throw new Error("pg_trgm extension is missing");

  const requiredIndexes = [
    "client_responsibles_user_id_idx",
    "client_tags_normalized_name_uidx",
    "client_timeline_client_occurred_idx",
    "clients_active_idx",
    "clients_document_active_uidx",
    "clients_email_trgm_idx",
    "clients_name_trgm_idx",
    "financial_transactions_status_created_at_idx",
    "lead_followups_status_due_idx",
    "lead_stage_history_lead_changed_idx",
    "lead_stages_code_active_uidx",
    "leads_stage_created_at_idx",
    "users_status_created_at_idx",
  ];
  const indexes = await pool.query(
    "select indexname from pg_indexes where schemaname = 'public'",
  );
  const indexNames = new Set(indexes.rows.map((row) => row.indexname));
  const missingIndexes = requiredIndexes.filter((index) => !indexNames.has(index));
  if (missingIndexes.length) throw new Error(`Missing indexes: ${missingIndexes.join(",")}`);

  const timezone = await pool.query("show timezone");
  if (!new Set(["Etc/UTC", "UTC"]).has(timezone.rows[0].TimeZone)) {
    throw new Error(`Database timezone is not UTC: ${timezone.rows[0].TimeZone}`);
  }

  const baseColumns = [
    "id", "created_at", "updated_at", "deleted_at", "version", "created_by_id", "updated_by_id",
  ];
  const baseTables = expectedTables.filter(
    (table) => !new Set(["audit_logs", "client_responsibles", "client_tag_assignments", "role_permissions", "user_roles"]).has(table),
  );
  const columns = await pool.query(
    "select table_name, column_name from information_schema.columns where table_schema = 'public'",
  );
  const columnSet = new Set(columns.rows.map((row) => `${row.table_name}.${row.column_name}`));
  for (const table of baseTables) {
    for (const column of baseColumns) {
      if (!columnSet.has(`${table}.${column}`)) throw new Error(`${table}.${column} is missing`);
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const email = `${randomUUID()}@example.invalid`;
    const user = await client.query(
      "insert into users (email, full_name) values ($1, 'Gate User') returning id, version, created_at, updated_at",
      [email],
    );
    if (user.rows[0].version !== 1 || !user.rows[0].id || !user.rows[0].created_at) {
      throw new Error("User defaults were not applied");
    }
    await expectRejected(client, "users email unique", "insert into users (email, full_name) values ($1, 'Duplicate')", [email]);
    await expectRejected(client, "users status check", "insert into users (email, full_name, status) values ($1, 'Invalid', 'INVALID')", [`${randomUUID()}@example.invalid`]);
    await expectRejected(
      client,
      "sessions user FK",
      "insert into sessions (user_id, token_hash, csrf_token_hash, ip_address, user_agent, expires_at) values ($1, $2, $3, '127.0.0.1', 'gate', now() + interval '1 hour')",
      [randomUUID(), "a".repeat(64), "b".repeat(64)],
    );
    await expectRejected(
      client,
      "users email canonical unique",
      "insert into users (email, full_name) values ($1, 'Case Duplicate')",
      [email.toUpperCase()],
    );
    await expectRejected(
      client,
      "clients type check",
      "insert into clients (type, name, document, email) values ('INVALID', 'Invalid', $1, 'invalid@example.invalid')",
      ["52998224725"],
    );
    const document = "52998224725";
    const firstClient = await client.query(
      "insert into clients (type, name, document, email) values ('PF', 'First', $1, 'first@example.invalid') returning id",
      [document],
    );
    await expectRejected(
      client,
      "active client document unique",
      "insert into clients (type, name, document, email) values ('PF', 'Duplicate', $1, 'duplicate@example.invalid')",
      [document],
    );
    await client.query("update clients set deleted_at = now() where id = $1", [firstClient.rows[0].id]);
    await client.query(
      "insert into clients (type, name, document, email) values ('PF', 'Replacement', $1, 'replacement@example.invalid')",
      [document],
    );
    await expectRejected(
      client,
      "financial amount check",
      "insert into financial_transactions (type, amount, due_date) values ('INCOME', -1, current_date)",
    );
    const stage = await client.query("select id from lead_stages where code = 'NEW' and deleted_at is null");
    if (stage.rowCount !== 1) throw new Error("Canonical NEW lead stage is missing");
    await expectRejected(
      client,
      "lead estimated value check",
      "insert into leads (stage_id, name, estimated_value) values ($1, 'Invalid', -1)",
      [stage.rows[0].id],
    );
    const outbox = await client.query(
      "insert into outbox_events (aggregate_type, aggregate_id, event_type, payload) values ('CLIENT', $1, 'ClientCreated', '{\"ok\":true}'::jsonb) returning processed, version",
      [randomUUID()],
    );
    if (outbox.rows[0].processed !== false || outbox.rows[0].version !== 1) {
      throw new Error("Outbox defaults were not applied");
    }
    const audit = await client.query(
      "insert into audit_logs (action, module) values ('gate.verify', 'database') returning id",
    );
    await expectRejected(client, "audit update", "update audit_logs set action = 'changed' where id = $1", [audit.rows[0].id]);
    await expectRejected(client, "audit delete", "delete from audit_logs where id = $1", [audit.rows[0].id]);
    await expectRejected(client, "audit truncate", "truncate table audit_logs");
  } finally {
    try {
      await client.query("ROLLBACK");
    } finally {
      client.release();
    }
  }

  const hash = loadMigrations().at(-1)?.hash ?? "none";
  console.log(`LYVOX_DB_VERIFY_OK tables=${expectedTables.length} sha256=${hash}`);
}

try {
  if (command === "migrate") await runMigrations();
  else await verifySchema();
} catch (error) {
  fail(error.message);
} finally {
  await pool.end();
}
