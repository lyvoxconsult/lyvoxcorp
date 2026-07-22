import { readFileSync } from 'node:fs';
import { createApp } from '../apps/api/dist/src/create-app.js';

function parseEnvironment(source) {
  return Object.fromEntries(
    source.split(/\r?\n/u)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const separator = line.indexOf('=');
        if (separator <= 0) throw new Error('Invalid local environment entry');
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
}

async function verify() {
  const local = parseEnvironment(readFileSync(new URL('../.env', import.meta.url), 'utf8'));
  const databaseUrl = new URL('postgresql://127.0.0.1');
  databaseUrl.port = local.PGBOUNCER_HOST_PORT;
  databaseUrl.username = local.POSTGRES_USER;
  databaseUrl.password = local.POSTGRES_PASSWORD;
  databaseUrl.pathname = `/${local.POSTGRES_DB}`;
  const environment = {
    ...process.env,
    NODE_ENV: 'development',
    HOST: local.API_HOST ?? '127.0.0.1',
    PORT: local.API_PORT ?? '4000',
    DATABASE_URL: databaseUrl.toString(),
    REDIS_URL: `redis://127.0.0.1:${local.REDIS_HOST_PORT}`,
    SESSION_SECRET: local.API_SESSION_SECRET,
    MFA_ENCRYPTION_KEY: local.AUTH_MFA_ENCRYPTION_KEY,
    SESSION_TTL_SECONDS: local.SESSION_TTL_SECONDS ?? '604800',
    TRUSTED_ORIGINS: local.TRUSTED_ORIGINS ?? 'http://127.0.0.1:5173',
    TRUSTED_PROXY_CIDRS: local.TRUSTED_PROXY_CIDRS ?? '127.0.0.1,::1',
  };

  const app = await createApp({ env: environment, logger: false });
  try {
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    const health = await app.inject({ method: 'GET', url: '/health' });
    const readiness = await app.inject({ method: 'GET', url: '/readiness' });
    const docs = await app.inject({ method: 'GET', url: '/docs/openapi.json' });
    const specification = docs.json();
    if (health.statusCode !== 200 || readiness.statusCode !== 200 || docs.statusCode !== 200) throw new Error('Foundation endpoint failed');
    if (specification.openapi !== '3.1.0' || !specification.paths?.['/health'] || !specification.paths?.['/readiness']) throw new Error('OpenAPI invariant failed');
    if (!health.headers['x-correlation-id']) throw new Error('Correlation header missing');
    process.stdout.write('LYVOX_API_FOUNDATION_OK health=200 readiness=200 docs=200 openapi=3.1.0\n');
  } finally {
    await app.close();
  }
}

verify().catch(() => {
  process.stderr.write('LYVOX_API_FOUNDATION_FAIL\n');
  process.exitCode = 1;
});
