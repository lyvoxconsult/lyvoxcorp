import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('keeps liveness dependency-free', () => {
    const database = { ping: vi.fn().mockRejectedValue(new Error('database unavailable')) };
    const cache = { ping: vi.fn().mockRejectedValue(new Error('redis unavailable')) };
    const controller = new HealthController(database as never, cache as never);
    expect(controller.health()).toEqual({ status: 'ok' });
    expect(database.ping).not.toHaveBeenCalled();
    expect(cache.ping).not.toHaveBeenCalled();
  });

  it('reports ready only after both live probes pass', async () => {
    const controller = new HealthController({ ping: vi.fn().mockResolvedValue(undefined) } as never, { ping: vi.fn().mockResolvedValue(undefined) } as never);
    await expect(controller.readiness()).resolves.toEqual({ status: 'ready', checks: { database: 'up', redis: 'up' } });
  });

  it('sanitizes dependency failures as service unavailable', async () => {
    const controller = new HealthController({ ping: vi.fn().mockRejectedValue(new Error('postgresql://secret')) } as never, { ping: vi.fn().mockResolvedValue(undefined) } as never);
    await expect(controller.readiness()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('shares in-flight dependency probes across concurrent requests', async () => {
    let resolveDatabase!: () => void;
    let resolveCache!: () => void;
    const databaseProbe = new Promise<void>((resolve) => { resolveDatabase = resolve; });
    const cacheProbe = new Promise<void>((resolve) => { resolveCache = resolve; });
    const database = { ping: vi.fn(() => databaseProbe) };
    const cache = { ping: vi.fn(() => cacheProbe) };
    const controller = new HealthController(database as never, cache as never);

    const requests = Array.from({ length: 30 }, () => controller.readiness());
    await vi.waitFor(() => {
      expect(database.ping).toHaveBeenCalledTimes(1);
      expect(cache.ping).toHaveBeenCalledTimes(1);
    });
    resolveDatabase();
    resolveCache();

    await expect(Promise.all(requests)).resolves.toHaveLength(30);
    await expect(controller.readiness()).resolves.toEqual({ status: 'ready', checks: { database: 'up', redis: 'up' } });
    expect(database.ping).toHaveBeenCalledTimes(2);
    expect(cache.ping).toHaveBeenCalledTimes(2);
  });
});
