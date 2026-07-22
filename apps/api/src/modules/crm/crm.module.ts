import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module.js';
import { CrmController } from './crm.controller.js';
import { CrmService } from './crm.service.js';

@Module({ imports: [ClientsModule], controllers: [CrmController], providers: [CrmService] })
export class CrmModule {}
