import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

function parseEnvironment(source) {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separator = line.indexOf("=");
        if (separator <= 0) throw new Error("Invalid local environment entry");
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
}

const local = parseEnvironment(readFileSync(new URL("../../../.env", import.meta.url), "utf8"));
const required = [
  "LYVOX_ENV", "POSTGRES_DB", "POSTGRES_USER", "POSTGRES_PASSWORD", "PGBOUNCER_HOST_PORT",
  "REDIS_HOST_PORT", "API_SESSION_SECRET", "AUTH_MFA_ENCRYPTION_KEY",
];
if (required.some((name) => !local[name])) throw new Error("Local .env is incomplete; run pnpm infra:config");

const databaseUrl = new URL("postgresql://127.0.0.1");
databaseUrl.port = local.PGBOUNCER_HOST_PORT;
databaseUrl.username = local.POSTGRES_USER;
databaseUrl.password = local.POSTGRES_PASSWORD;
databaseUrl.pathname = `/${local.POSTGRES_DB}`;

const runtimeEnvironment = {
  ...process.env,
  NODE_ENV: local.LYVOX_ENV,
  HOST: local.API_HOST ?? "127.0.0.1",
  PORT: local.API_PORT ?? "4000",
  DATABASE_URL: databaseUrl.toString(),
  REDIS_URL: `redis://127.0.0.1:${local.REDIS_HOST_PORT}`,
  SESSION_SECRET: local.API_SESSION_SECRET,
  MFA_ENCRYPTION_KEY: local.AUTH_MFA_ENCRYPTION_KEY,
  SESSION_TTL_SECONDS: local.SESSION_TTL_SECONDS ?? "604800",
  TRUSTED_ORIGINS: local.TRUSTED_ORIGINS ?? "http://127.0.0.1:5173",
  TRUSTED_PROXY_CIDRS: local.TRUSTED_PROXY_CIDRS ?? "127.0.0.1,::1",
};

const tsxCli = fileURLToPath(import.meta.resolve("tsx/cli"));
const child = spawn(process.execPath, [tsxCli, "watch", "src/main.ts"], {
  cwd: fileURLToPath(new URL("../", import.meta.url)),
  env: runtimeEnvironment,
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
child.once("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
