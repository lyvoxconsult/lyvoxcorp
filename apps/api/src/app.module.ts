import { DynamicModule, Module } from '@nestjs/common';
import type { ApiEnvironment } from './config/env.js';
import { HealthModule } from './modules/health/health.module.js';
import { ClientsModule } from './modules/clients/clients.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { CrmModule } from './modules/crm/crm.module.js';
import { MeetingsModule } from './modules/meetings/meetings.module.js';
import { ServicesModule } from './modules/services/services.module.js';
import { ProposalsModule } from './modules/proposals/proposals.module.js';
import { ProjectsModule } from './modules/projects/projects.module.js';

@Module({})
export class AppModule {
  static register(environment: ApiEnvironment): DynamicModule {
    return { module: AppModule, imports: [AuthModule.register(environment), HealthModule, ClientsModule, CrmModule, MeetingsModule, ServicesModule, ProposalsModule, ProjectsModule] };
  }
}




