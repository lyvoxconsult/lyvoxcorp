import { DynamicModule, Module } from '@nestjs/common';
import type { ApiEnvironment } from '../../config/env.js';
import { AuthModule } from '../auth/auth.module.js';
import { HealthController } from './health.controller.js';

@Module({})
export class HealthModule {
  static register(environment: ApiEnvironment): DynamicModule {
    return {
      module: HealthModule,
      imports: [AuthModule.register(environment)],
      controllers: [HealthController],
    };
  }
}
