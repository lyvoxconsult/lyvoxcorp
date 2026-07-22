import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { PublicAccess } from '../../core/authorization/access-policy.js';
import { AuthCacheService, DatabaseService } from '../auth/auth.infrastructure.js';

const PROBE_TIMEOUT_MS = 1_500;

async function bounded(probe: Promise<unknown>): Promise<void> {
  let timer: NodeJS.Timeout | undefined;
  try {
    await Promise.race([
      probe,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('PROBE_TIMEOUT')), PROBE_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

@Controller()
export class HealthController {
  private databaseProbe?: Promise<void>;
  private cacheProbe?: Promise<void>;

  constructor(
    @Inject(DatabaseService) private readonly database: DatabaseService,
    @Inject(AuthCacheService) private readonly cache: AuthCacheService,
  ) {}

  @Get('health')
  @PublicAccess()
  health() {
    return { status: 'ok' } as const;
  }

  private singleFlight(
    current: Promise<void> | undefined,
    start: () => Promise<unknown>,
    store: (probe: Promise<void> | undefined) => void,
  ): Promise<void> {
    if (current) return current;
    const probe = Promise.resolve().then(start).then(() => undefined);
    store(probe);
    void probe.then(
      () => store(undefined),
      () => store(undefined),
    );
    return probe;
  }

  private probeDatabase(): Promise<void> {
    return this.singleFlight(this.databaseProbe, () => this.database.ping(), (probe) => {
      if (!probe || this.databaseProbe === undefined) this.databaseProbe = probe;
    });
  }

  private probeCache(): Promise<void> {
    return this.singleFlight(this.cacheProbe, () => this.cache.ping(), (probe) => {
      if (!probe || this.cacheProbe === undefined) this.cacheProbe = probe;
    });
  }

  @Get('readiness')
  @PublicAccess()
  async readiness() {
    const results = await Promise.allSettled([
      bounded(this.probeDatabase()),
      bounded(this.probeCache()),
    ]);
    if (results.some((result) => result.status === 'rejected')) {
      throw new ServiceUnavailableException({ code: 'DEPENDENCY_UNAVAILABLE' });
    }
    return { status: 'ready', checks: { database: 'up', redis: 'up' } } as const;
  }
}
