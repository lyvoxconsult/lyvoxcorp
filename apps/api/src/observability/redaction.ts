export const REDACTED_VALUE = '[REDACTED]';

export const SENSITIVE_LOG_PATHS = Object.freeze([
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers.set-cookie',
  'req.body.password',
  'req.body.currentPassword',
  'req.body.newPassword',
  'req.body.token',
  'req.body.csrfToken',
  'req.body.totpSecret',
  'req.body.totpCode',
  'req.body.recoveryCode',
  'req.body.code',
  'req.body.backupCode',
  'req.body.challengeToken',
  'password',
  'token',
  'sessionCookie',
  'sessionSecret',
  'mfaEncryptionKey',
  'databaseUrl',
  'redisUrl',
] as const);

export function buildLoggerOptions(environment: string) {
  return {
    level: environment === 'production' ? 'info' : 'debug',
    redact: {
      paths: Array.from(SENSITIVE_LOG_PATHS),
      censor: REDACTED_VALUE,
    },
  };
}
