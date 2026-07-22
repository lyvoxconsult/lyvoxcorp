import { afterEach, describe, expect, it } from 'vitest';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createApp } from './create-app.js';

const environment = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://lyvox:password@localhost:5432/lyvox',
  REDIS_URL: 'redis://localhost:6379',
  SESSION_SECRET: 'aB3!cD4@eF5#gH6$iJ7%kL8&mN9*oP0(qR1)sT2-uV3_wX4+yZ5=aC6:dE7;fG8?',
  MFA_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString('base64'),
  TRUSTED_ORIGINS: 'http://localhost:3000',
  TRUSTED_PROXY_CIDRS: '127.0.0.1,::1',
} satisfies NodeJS.ProcessEnv;

describe('createApp', () => {
  let app: NestFastifyApplication | undefined;

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  it('initializes the NestJS Fastify application with security plugins', async () => {
    app = await createApp({ env: environment, logger: false });
    await app.init();
    expect(app.getHttpAdapter().getType()).toBe('fastify');
    expect(app.getHttpAdapter().getInstance().hasPlugin('@fastify/cookie')).toBe(true);
  });

  it('serves root liveness with validated correlation IDs and keeps prefixed probes absent', async () => {
    app = await createApp({ env: environment, logger: false });
    await app.init();
    const supplied = '0f4fe884-5878-4b1d-b06d-358d152e2ee5';
    const health = await app.inject({ method: 'GET', url: '/health', headers: { 'x-correlation-id': supplied } });
    expect(health.statusCode).toBe(200);
    expect(health.headers['x-correlation-id']).toBe(supplied);
    expect(health.json()).toEqual({ status: 'ok' });

    const invalid = await app.inject({ method: 'GET', url: '/health', headers: { 'x-correlation-id': 'log\ninjection' } });
    expect(invalid.statusCode).toBe(200);
    expect(invalid.headers['x-correlation-id']).toMatch(/^[0-9a-f-]{36}$/u);
    expect(invalid.headers['x-correlation-id']).not.toBe('log\ninjection');

    const concurrent = await Promise.all([
      app.inject({ method: 'GET', url: '/health' }),
      app.inject({ method: 'GET', url: '/health' }),
    ]);
    expect(concurrent[0].headers['x-correlation-id']).not.toBe(concurrent[1].headers['x-correlation-id']);

    const prefixed = await app.inject({ method: 'GET', url: '/api/v1/health' });
    expect(prefixed.statusCode).toBe(404);
    expect(prefixed.headers['content-type']).toContain('application/problem+json');
    expect(prefixed.json().correlationId).toBe(prefixed.headers['x-correlation-id']);
  });

  it('serves generated OpenAPI 3.1 and Swagger UI only at the root docs path', async () => {
    app = await createApp({ env: { ...environment, NODE_ENV: 'development' }, logger: false });
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    const ui = await app.inject({ method: 'GET', url: '/docs/' });
    expect(ui.statusCode).toBe(200);
    expect(ui.headers['content-type']).toContain('text/html');
    const specification = await app.inject({ method: 'GET', url: '/docs/openapi.json' });
    expect(specification.statusCode).toBe(200);
    const document = specification.json();
    expect(document.openapi).toBe('3.1.0');
    expect(document.paths).toHaveProperty('/health');
    expect(document.paths).toHaveProperty('/readiness');
    expect(document.paths).toHaveProperty('/api/v1/auth/login');
    expect(document.paths).toHaveProperty('/api/v1/roles');
    expect(document.paths).not.toHaveProperty('/api/v1/__test/authorization/clients/{id}');
    expect(document.paths['/api/v1/auth/login'].post.requestBody.content['application/json'].schema.properties).toHaveProperty('email');
    expect(document.components.schemas.ProblemDetails.required).toContain('correlationId');
    expect((await app.inject({ method: 'GET', url: '/api/v1/docs' })).statusCode).toBe(404);
  });

  it('keeps liveness up and returns sanitized RFC 7807 when readiness dependencies fail', async () => {
    app = await createApp({ env: { ...environment, DATABASE_URL: 'postgresql://lyvox:password@127.0.0.1:1/lyvox', REDIS_URL: 'redis://127.0.0.1:1' }, logger: false });
    await app.init();
    expect((await app.inject({ method: 'GET', url: '/health' })).statusCode).toBe(200);
    const readiness = await app.inject({ method: 'GET', url: '/readiness' });
    expect(readiness.statusCode).toBe(503);
    expect(readiness.headers['content-type']).toContain('application/problem+json');
    expect(readiness.json()).toEqual(expect.objectContaining({
      status: 503,
      code: 'DEPENDENCY_UNAVAILABLE',
      correlationId: readiness.headers['x-correlation-id'],
      timestamp: expect.any(String),
    }));
    expect(JSON.stringify(readiness.json())).not.toContain('password');
  });
});
