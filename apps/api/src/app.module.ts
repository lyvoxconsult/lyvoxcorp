import { DynamicModule, Module } from '@nestjs/common';
import type { ApiEnvironment } from './config/env.js';
import { AuthModule } from './modules/auth/auth.module.js';

@Module({})
export class AppModule {
  static register(environment: ApiEnvironment): DynamicModule {
    return { module: AppModule, imports: [AuthModule.register(environment)] };
  }
}
