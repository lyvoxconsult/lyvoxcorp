import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { createClient, type RedisClientType } from 'redis';
import * as schema from '@lyvox/database/schema';
import type { ApiEnvironment } from '../../config/env.js';
import { AUTH_ENVIRONMENT } from './auth.tokens.js';

const RATE_LIMIT_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
local ttl = redis.call('TTL', KEYS[1])
return {count, ttl}
`;

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly pool: Pool;
  readonly db: NodePgDatabase<typeof schema>;

  constructor(@Inject(AUTH_ENVIRONMENT) environment: ApiEnvironment) {
    this.pool = new Pool({ connectionString: environment.DATABASE_URL, max: 10, connectionTimeoutMillis: 5_000 });
    this.db = drizzle(this.pool, { schema });
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}

@Injectable()
export class AuthCacheService implements OnModuleDestroy {
  private readonly client: RedisClientType;
  private connecting?: Promise<unknown>;

  constructor(@Inject(AUTH_ENVIRONMENT) private readonly environment: ApiEnvironment) {
    this.client = createClient({
      url: environment.REDIS_URL,
      socket: { connectTimeout: 1_000, reconnectStrategy: false },
    });
    this.client.on('error', () => undefined);
  }

  private async ready(): Promise<RedisClientType> {
    if (!this.client.isOpen) {
      this.connecting ??= this.client.connect().finally(() => { this.connecting = undefined; });
      await this.connecting;
    }
    return this.client;
  }

  private key(kind: string, value: string): string {
    return `lyvox:${this.environment.NODE_ENV}:auth:${kind}:${value}`;
  }

  async enforceLoginRateLimit(identityKey: string, ipKey: string): Promise<void> {
    await this.enforceRateLimit('login-rate', [identityKey, ipKey], 5, 60);
  }

  async enforceRateLimit(kind: string, values: readonly string[], limit: number, windowSeconds: number): Promise<void> {
    const client = await this.ready();
    for (const value of values) {
      const key = this.key(kind, value);
      const result = await client.eval(RATE_LIMIT_SCRIPT, { keys: [key], arguments: [String(windowSeconds)] });
      const [count, ttl] = result as [number, number];
      if (count > limit) {
        const error = new Error('LOGIN_RATE_LIMITED');
        Object.assign(error, { retryAfter: Math.max(ttl, 1) });
        throw error;
      }
    }
  }

  async cacheSession(tokenHash: string, userId: string, ttlSeconds: number): Promise<void> {
    try {
      const client = await this.ready();
      await client.set(this.key('session', tokenHash), userId, { EX: Math.max(ttlSeconds, 1) });
    } catch {
      // PostgreSQL remains authoritative; cache failure cannot invalidate a valid session.
    }
  }

  async evictSessions(tokenHashes: readonly string[]): Promise<void> {
    if (tokenHashes.length === 0) return;
    try {
      const client = await this.ready();
      await client.del(tokenHashes.map((hash) => this.key('session', hash)));
    } catch {
      // DB revocation is authoritative and is checked on every request.
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.isOpen) await this.client.quit();
  }
}
