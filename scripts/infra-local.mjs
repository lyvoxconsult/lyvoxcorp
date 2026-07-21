import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createConnection } from "node:net";

const command = process.argv[2];
const confirmation = process.argv.includes("--confirm-local-data-loss");
const envPath = new URL("../.env", import.meta.url);
const allowedCommands = new Set(["config", "down", "health", "reset", "up"]);
const composeFiles = [
  "-f",
  "docker-compose.yml",
  "-f",
  "docker-compose.override.yml",
];
let dockerEnvironment;

if (!allowedCommands.has(command)) {
  fail("Usage: node scripts/infra-local.mjs <config|up|health|down|reset>");
}

function fail(message) {
  console.error(message);
  process.exit(1);
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

function ensureEnvironment() {
  if (!existsSync(envPath)) {
    const password = randomBytes(32).toString("base64url");
    const contents = [
      "COMPOSE_PROJECT_NAME=lyvox-gerenciamento-local",
      "LYVOX_ENV=development",
      "POSTGRES_DB=lyvox",
      "POSTGRES_USER=lyvox",
      `POSTGRES_PASSWORD=${password}`,
      "PGBOUNCER_HOST_PORT=6432",
      "MAILPIT_SMTP_HOST_PORT=1025",
      "MAILPIT_UI_HOST_PORT=8025",
      "",
    ].join("\n");

    writeFileSync(envPath, contents, {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });
    console.log("Created ignored .env with a generated local database password.");
  }

  const environment = parseEnvironment(readFileSync(envPath, "utf8"));
  const password = environment.POSTGRES_PASSWORD ?? "";

  if (password.length < 32 || password === "GENERATE_WITH_PNPM_INFRA_UP") {
    fail("POSTGRES_PASSWORD in .env must be a generated value of at least 32 characters.");
  }

  if (environment.COMPOSE_PROJECT_NAME !== "lyvox-gerenciamento-local") {
    fail("COMPOSE_PROJECT_NAME must remain lyvox-gerenciamento-local.");
  }
  if (!["development", "test"].includes(environment.LYVOX_ENV)) {
    fail("Local infrastructure is allowed only when LYVOX_ENV is development or test.");
  }
  for (const name of ["POSTGRES_DB", "POSTGRES_USER"]) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(environment[name] ?? "")) {
      fail(`${name} must be a valid PostgreSQL identifier.`);
    }
  }
  const ports = [
    "PGBOUNCER_HOST_PORT",
    "MAILPIT_SMTP_HOST_PORT",
    "MAILPIT_UI_HOST_PORT",
  ].map((name) => Number(environment[name]));
  if (ports.some((port) => !Number.isInteger(port) || port < 1024 || port > 65535)) {
    fail("Local host ports must be unique integers between 1024 and 65535.");
  }
  if (new Set(ports).size !== ports.length) {
    fail("Local host ports must be unique integers between 1024 and 65535.");
  }

  return environment;
}

function createDockerEnvironment(environment) {
  const baseEnvironment = { ...process.env };
  delete baseEnvironment.DOCKER_HOST;
  delete baseEnvironment.DOCKER_CONTEXT;

  const requestedContext = process.env.DOCKER_CONTEXT;
  const contextArgs = requestedContext
    ? ["context", "inspect", requestedContext, "--format", "{{json .Endpoints.docker.Host}}"]
    : ["context", "inspect", "--format", "{{json .Endpoints.docker.Host}}"];
  const contextResult = spawnSync("docker", contextArgs, {
    encoding: "utf8",
    env: baseEnvironment,
  });
  if (contextResult.error || contextResult.status !== 0) {
    fail("Unable to resolve the active Docker context.");
  }

  const contextEndpoint = JSON.parse(contextResult.stdout.trim());
  const requestedHost = process.env.DOCKER_HOST;
  const endpoint = requestedHost ?? contextEndpoint;
  if (!endpoint.startsWith("npipe://") && !endpoint.startsWith("unix://")) {
    fail("Remote Docker endpoints are forbidden for local infrastructure commands.");
  }

  const sanitized = { ...baseEnvironment, DOCKER_HOST: endpoint };
  for (const name of [
    "COMPOSE_DISABLE_ENV_FILE",
    "COMPOSE_ENV_FILES",
    "COMPOSE_FILE",
    "COMPOSE_PATH_SEPARATOR",
    "COMPOSE_PROFILES",
  ]) {
    delete sanitized[name];
  }

  return {
    ...sanitized,
    COMPOSE_PROJECT_NAME: environment.COMPOSE_PROJECT_NAME,
    LYVOX_ENV: environment.LYVOX_ENV,
    POSTGRES_DB: environment.POSTGRES_DB,
    POSTGRES_USER: environment.POSTGRES_USER,
    POSTGRES_PASSWORD: environment.POSTGRES_PASSWORD,
    PGBOUNCER_HOST_PORT: environment.PGBOUNCER_HOST_PORT,
    MAILPIT_SMTP_HOST_PORT: environment.MAILPIT_SMTP_HOST_PORT,
    MAILPIT_UI_HOST_PORT: environment.MAILPIT_UI_HOST_PORT,
  };
}

function dockerCompose(args, options = {}) {
  const result = spawnSync("docker", ["compose", ...composeFiles, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: dockerEnvironment,
    stdio: options.capture ? "pipe" : "inherit",
  });

  if (result.error) fail(`Docker Compose could not start: ${result.error.message}`);
  if (result.status !== 0) {
    if (options.capture) {
      process.stderr.write(result.stderr ?? "");
      process.stdout.write(result.stdout ?? "");
    }
    fail(`docker compose ${args.join(" ")} failed with exit code ${result.status}`);
  }

  return (result.stdout ?? "").trim();
}

function dockerInspect(args, label) {
  const result = spawnSync("docker", args, {
    encoding: "utf8",
    env: dockerEnvironment,
  });
  if (result.error || result.status !== 0) {
    fail(`${label} inspection failed.`);
  }
  return result.stdout.trim();
}

function assertEqual(actual, expected, label) {
  if (actual.trim() !== expected) {
    fail(`${label} failed: expected ${expected}, received ${actual.trim() || "<empty>"}`);
  }
}

function assertLoopbackPort(service, containerPort) {
  const containerId = dockerCompose(["ps", "-q", service], {
    capture: true,
  });
  const bindings = JSON.parse(
    dockerInspect(
      ["inspect", containerId, "--format", "{{json .NetworkSettings.Ports}}"],
      `${service} port binding`,
    ),
  );
  const published = bindings[`${containerPort}/tcp`] ?? [];

  if (published.length !== 1 || published[0].HostIp !== "127.0.0.1") {
    fail(`${service}:${containerPort} is not bound exclusively to IPv4 loopback.`);
  }
}

function assertNoPublishedPort(service, containerPort) {
  const containerId = dockerCompose(["ps", "-q", service], { capture: true });
  const bindings = JSON.parse(
    dockerInspect(
      ["inspect", containerId, "--format", "{{json .NetworkSettings.Ports}}"],
      `${service} port binding`,
    ),
  );

  if (bindings[`${containerPort}/tcp`] !== null) {
    fail(`${service}:${containerPort} must not publish a host port.`);
  }
}

function assertTcp(host, port, label) {
  return new Promise((resolve, reject) => {
    const socket = createConnection({ host, port: Number(port), timeout: 3_000 });
    socket.once("connect", () => {
      socket.destroy();
      resolve();
    });
    socket.once("timeout", () => socket.destroy(new Error(`${label} TCP timeout`)));
    socket.once("error", reject);
  });
}

async function health(environment) {
  dockerCompose(["ps"]);
  dockerCompose([
    "exec",
    "-T",
    "postgres",
    "pg_isready",
    "-U",
    environment.POSTGRES_USER,
    "-d",
    environment.POSTGRES_DB,
  ]);
  assertEqual(
    dockerCompose(
      ["exec", "-T", "postgres", "psql", "-U", environment.POSTGRES_USER, "-d", environment.POSTGRES_DB, "-tAc", "SELECT 1"],
      { capture: true },
    ),
    "1",
    "PostgreSQL SELECT 1",
  );
  assertEqual(
    dockerCompose(
      ["exec", "-T", "pgbouncer", "sh", "-ec", 'PGPASSWORD="$DB_PASSWORD" psql -h 127.0.0.1 -p 5432 -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT 1"'],
      { capture: true },
    ),
    "1",
    "PgBouncer SELECT 1",
  );
  assertEqual(
    dockerCompose(["exec", "-T", "redis", "redis-cli", "ping"], {
      capture: true,
    }),
    "PONG",
    "Redis PING",
  );
  dockerCompose(
    ["exec", "-T", "mailpit", "wget", "-qO-", "http://127.0.0.1:8025/readyz"],
    { capture: true },
  );

  const project = environment.COMPOSE_PROJECT_NAME;
  assertEqual(
    dockerInspect(["network", "inspect", `${project}-internal`, "--format", "{{.Internal}}"], "Network"),
    "true",
    "Internal Docker network",
  );
  for (const suffix of ["postgres-data", "redis-data", "mailpit-data"]) {
    dockerInspect(["volume", "inspect", `${project}-${suffix}`], "Named volume");
  }

  assertLoopbackPort("pgbouncer", 5432);
  assertLoopbackPort("mailpit", 1025);
  assertLoopbackPort("mailpit", 8025);
  assertNoPublishedPort("postgres", 5432);
  assertNoPublishedPort("redis", 6379);
  await Promise.all([
    assertTcp("127.0.0.1", environment.PGBOUNCER_HOST_PORT, "PgBouncer"),
    assertTcp("127.0.0.1", environment.MAILPIT_SMTP_HOST_PORT, "Mailpit SMTP"),
    assertTcp("127.0.0.1", environment.MAILPIT_UI_HOST_PORT, "Mailpit HTTP"),
  ]);

  console.log("LYVOX_INFRA_HEALTH_OK services=postgres,pgbouncer,redis,mailpit");
}

const environment = ensureEnvironment();
dockerEnvironment = createDockerEnvironment(environment);

if (command === "config") {
  dockerCompose(["config", "--quiet"]);
  console.log("LYVOX_INFRA_CONFIG_OK");
} else if (command === "up") {
  dockerCompose(["config", "--quiet"]);
  dockerCompose(["up", "-d", "--wait", "--wait-timeout", "120"]);
  try {
    await health(environment);
  } catch (error) {
    fail(error.message);
  }
} else if (command === "health") {
  try {
    await health(environment);
  } catch (error) {
    fail(error.message);
  }
} else if (command === "down") {
  dockerCompose(["down", "--remove-orphans"]);
} else if (command === "reset") {
  if (!confirmation) {
    fail("Local data reset requires --confirm-local-data-loss.");
  }
  dockerCompose(["down", "--volumes", "--remove-orphans"]);
  console.log("Removed only the local Lyvox Compose containers, network and named volumes.");
}
