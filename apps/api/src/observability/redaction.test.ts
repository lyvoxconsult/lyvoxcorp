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
  });

  it('uses debug logging outside production', () => {
    expect(buildLoggerOptions('development').level).toBe('debug');
    expect(buildLoggerOptions('test').level).toBe('debug');
  });
});
