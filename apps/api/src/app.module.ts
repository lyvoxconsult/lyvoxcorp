import { DynamicModule, Module } from '@nestjs/common';
import type { ApiEnvironment } from './config/env.js';
import { HealthModule } from './modules/health/health.module.js';

@Module({})
export class AppModule {
  static register(environment: ApiEnvironment): DynamicModule {
    return { module: AppModule, imports: [HealthModule.register(environment)] };
  }
}
