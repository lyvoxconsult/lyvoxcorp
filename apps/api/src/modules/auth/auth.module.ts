import { DynamicModule, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import type { ApiEnvironment } from '../../config/env.js';
import { AuthorizationService } from '../../core/authorization/authorization.service.js';
import { RbacGuard } from '../../core/guards/rbac.guard.js';
import { AuthorizationController } from '../authorization/authorization.controller.js';
import { OwnershipVerificationController } from '../../testing/ownership-verification.controller.js';
import { AuthController } from './auth.controller.js';
import { AuthCacheService, DatabaseService } from './auth.infrastructure.js';
import { AuthService } from './auth.service.js';
import { AUTH_ENVIRONMENT } from './auth.tokens.js';

@Module({})
export class AuthModule {
  static register(environment: ApiEnvironment): DynamicModule {
    return {
      module: AuthModule,
      global: true,
      controllers: [AuthController, AuthorizationController, ...(environment.NODE_ENV === 'test' ? [OwnershipVerificationController] : [])],
      providers: [
        { provide: AUTH_ENVIRONMENT, useValue: environment },
        DatabaseService,
        AuthCacheService,
        AuthService,
        AuthorizationService,
        { provide: APP_GUARD, useClass: RbacGuard },
      ],
      exports: [AuthService, DatabaseService, AuthCacheService, AuthorizationService],
    };
  }
}
