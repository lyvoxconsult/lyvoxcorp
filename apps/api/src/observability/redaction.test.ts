import { Writable } from 'node:stream';
import Fastify from 'fastify';
import { describe, expect, it } from 'vitest';
import { buildLoggerOptions, REDACTED_VALUE, SENSITIVE_LOG_PATHS } from './redaction.js';

describe('buildLoggerOptions', () => {
  it('redacts authentication material and uses a fixed censor', () => {
    const options = buildLoggerOptions('production');
    expect(options.level).toBe('info');
    expect(options.redact.censor).toBe(REDACTED_VALUE);
    expect(SENSITIVE_LOG_PATHS).toContain('req.headers.cookie');
    expect(SENSITIVE_LOG_PATHS).toContain('req.body.password');
    expect(SENSITIVE_LOG_PATHS).toContain('req.body.totpSecret');
    expect(options.customProps({ id: 'correlation-1' })).toEqual({ correlationId: 'correlation-1' });
    expect(options.serializers.req({ method: 'GET', url: '/api/v1/clientes?search=52998224725' })).toEqual({
      method: 'GET', url: '/api/v1/clientes', hostname: undefined, remoteAddress: undefined,
    });
  });

  it('uses debug logging outside production', () => {
    expect(buildLoggerOptions('development').level).toBe('debug');
    expect(buildLoggerOptions('test').level).toBe('debug');
  });

  it('redacts the CSRF header during real logger serialization', async () => {
    const output: string[] = [];
    const stream = new Writable({
      write(chunk, _encoding, callback) {
        output.push(String(chunk));
        callback();
      },
    });
    const app = Fastify({
      logger: {
        ...buildLoggerOptions('production'),
        serializers: { req: (request) => ({ headers: request.headers }) },
        stream,
      },
    });

    app.log.info({ req: { headers: { 'x-csrf-token': 'synthetic-csrf-value' } } });
    await new Promise<void>((resolve) => setImmediate(resolve));

    expect(output.join('')).toContain(REDACTED_VALUE);
    expect(output.join('')).not.toContain('synthetic-csrf-value');
    await app.close();
  });
});
