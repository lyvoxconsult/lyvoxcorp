import { DynamicModule, Module } from '@nestjs/common';
import type { ApiEnvironment } from '../../config/env.js';
import { AuthController } from './auth.controller.js';
import { AuthCacheService, DatabaseService } from './auth.infrastructure.js';
import { AuthService } from './auth.service.js';
import { AUTH_ENVIRONMENT } from './auth.tokens.js';

@Module({})
export class AuthModule {
  static register(environment: ApiEnvironment): DynamicModule {
    return {
      module: AuthModule,
      controllers: [AuthController],
      providers: [
        { provide: AUTH_ENVIRONMENT, useValue: environment },
        DatabaseService,
        AuthCacheService,
        AuthService,
      ],
      exports: [AuthService],
    };
  }
}
