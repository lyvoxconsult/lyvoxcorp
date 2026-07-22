import { z } from 'zod';
import { isIP } from 'node:net';

const obviousSecretPattern = /(change[-_ ]?me|placeholder|example|generate|secret)/i;

const secretSchema = z
  .string()
  .min(64, 'SESSION_SECRET must contain at least 64 characters')
  .refine((value) => !obviousSecretPattern.test(value), 'SESSION_SECRET cannot be a placeholder')
  .refine((value) => new Set(value).size >= 16, 'SESSION_SECRET has insufficient character diversity');

const baseSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  HOST: z.string().min(1).default('0.0.0.0'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(4_000),
  DATABASE_URL: z.string().url().refine((value) => value.startsWith('postgres://') || value.startsWith('postgresql://'), {
    message: 'DATABASE_URL must use postgres:// or postgresql://',
  }),
  REDIS_URL: z.string().url().refine((value) => value.startsWith('redis://') || value.startsWith('rediss://'), {
    message: 'REDIS_URL must use redis:// or rediss://',
  }),
  SESSION_SECRET: secretSchema,
  MFA_ENCRYPTION_KEY: z.string().refine((value) => {
    try {
      return Buffer.from(value, 'base64').length === 32 && Buffer.from(value, 'base64').toString('base64') === value;
    } catch {
      return false;
    }
  }, 'MFA_ENCRYPTION_KEY must be a canonical base64-encoded 32-byte key'),
  SESSION_TTL_SECONDS: z.coerce.number().int().min(300).max(2_592_000).default(604_800),
  TRUSTED_ORIGINS: z.string().min(1),
  TRUSTED_PROXY_CIDRS: z.string().min(1),
});

export type ApiEnvironment = Omit<z.infer<typeof baseSchema>, 'TRUSTED_ORIGINS' | 'TRUSTED_PROXY_CIDRS'> & {
  TRUSTED_ORIGINS: readonly string[];
  TRUSTED_PROXY_CIDRS: readonly string[];
};

function parseProxyCidrs(raw: string): readonly string[] {
  const entries = raw.split(',').map((value) => value.trim()).filter(Boolean);
  for (const entry of entries) {
    const [address, mask, extra] = entry.split('/');
    const version = isIP(address ?? '');
    const maximum = version === 4 ? 32 : version === 6 ? 128 : -1;
    if (extra !== undefined || maximum < 0 || (mask !== undefined && (!/^\d{1,3}$/u.test(mask) || Number(mask) > maximum))) {
      throw new Error(`TRUSTED_PROXY_CIDRS contains an invalid IP/CIDR: ${entry}`);
    }
  }
  if (entries.length === 0) throw new Error('TRUSTED_PROXY_CIDRS must contain at least one IP/CIDR');
  return Object.freeze([...new Set(entries)]);
}

function parseOrigins(raw: string, environment: z.infer<typeof baseSchema>['NODE_ENV']): readonly string[] {
  const origins = raw.split(',').map((value) => value.trim()).filter(Boolean).map((value) => {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== value || url.username || url.password) {
      throw new Error(`TRUSTED_ORIGINS contains an invalid origin: ${value}`);
    }
    if (['staging', 'production'].includes(environment) && url.protocol !== 'https:') {
      throw new Error(`TRUSTED_ORIGINS must use HTTPS in ${environment}`);
    }
    return url.origin;
  });

  if (origins.length === 0) {
    throw new Error('TRUSTED_ORIGINS must contain at least one origin');
  }

  return Object.freeze([...new Set(origins)]);
}

export function parseApiEnvironment(source: NodeJS.ProcessEnv): ApiEnvironment {
  const parsed = baseSchema.parse(source);
  return Object.freeze({
    ...parsed,
    TRUSTED_ORIGINS: parseOrigins(parsed.TRUSTED_ORIGINS, parsed.NODE_ENV),
    TRUSTED_PROXY_CIDRS: parseProxyCidrs(parsed.TRUSTED_PROXY_CIDRS),
  });
}
