export const REDACTED_VALUE = '[REDACTED]';

export const SENSITIVE_LOG_PATHS = Object.freeze([
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-csrf-token"]',
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
    serializers: {
      req: (request: { method?: string; url?: string; hostname?: string; remoteAddress?: string }) => ({
        method: request.method,
        url: request.url?.split('?', 1)[0],
        hostname: request.hostname,
        remoteAddress: request.remoteAddress,
      }),
    },
    customProps: (request: { id: string }) => ({ correlationId: request.id }),
  };
}
