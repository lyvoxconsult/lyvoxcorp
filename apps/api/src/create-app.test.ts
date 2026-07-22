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
});
