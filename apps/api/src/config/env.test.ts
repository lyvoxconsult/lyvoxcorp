import { describe, expect, it } from 'vitest';
import { parseApiEnvironment } from './env.js';

const validEnvironment = {
  NODE_ENV: 'development',
  DATABASE_URL: 'postgresql://lyvox:password@localhost:5432/lyvox',
  REDIS_URL: 'redis://localhost:6379',
  SESSION_SECRET: 'aB3!cD4@eF5#gH6$iJ7%kL8&mN9*oP0(qR1)sT2-uV3_wX4+yZ5=aC6:dE7;fG8?',
  MFA_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString('base64'),
  TRUSTED_ORIGINS: 'http://localhost:3000,http://127.0.0.1:3000',
  TRUSTED_PROXY_CIDRS: '127.0.0.1,::1',
} satisfies NodeJS.ProcessEnv;

describe('parseApiEnvironment', () => {
  it('parses and freezes a valid development environment', () => {
    const result = parseApiEnvironment(validEnvironment);
    expect(result.PORT).toBe(4000);
    expect(result.TRUSTED_ORIGINS).toEqual(['http://localhost:3000', 'http://127.0.0.1:3000']);
    expect(Object.isFrozen(result)).toBe(true);
  });

  it('fails closed when the session secret is missing', () => {
    expect(() => parseApiEnvironment({ ...validEnvironment, SESSION_SECRET: undefined })).toThrow();
  });

  it('rejects placeholder secrets', () => {
    expect(() => parseApiEnvironment({ ...validEnvironment, SESSION_SECRET: 'change-me-'.repeat(8) })).toThrow();
  });

  it('rejects an invalid MFA encryption key', () => {
    expect(() => parseApiEnvironment({ ...validEnvironment, MFA_ENCRYPTION_KEY: 'not-a-key' })).toThrow();
  });

  it('requires HTTPS origins outside development and test', () => {
    expect(() => parseApiEnvironment({ ...validEnvironment, NODE_ENV: 'production' })).toThrow(/HTTPS/);
  });

  it('rejects origins containing paths', () => {
    expect(() => parseApiEnvironment({ ...validEnvironment, TRUSTED_ORIGINS: 'http://localhost:3000/path' })).toThrow(/invalid origin/);
  });

  it('rejects an invalid trusted proxy CIDR', () => {
    expect(() => parseApiEnvironment({ ...validEnvironment, TRUSTED_PROXY_CIDRS: '0.0.0.0/999' })).toThrow(/invalid IP\/CIDR/);
  });

  it('accepts HTTPS origins and explicit operational values in production', () => {
    const result = parseApiEnvironment({
      ...validEnvironment,
      NODE_ENV: 'production',
      TRUSTED_ORIGINS: 'https://app.lyvox.example',
      HOST: '127.0.0.1',
      PORT: '4100',
      SESSION_TTL_SECONDS: '7200',
    });
    expect(result).toMatchObject({ HOST: '127.0.0.1', PORT: 4100, SESSION_TTL_SECONDS: 7200 });
  });
});
