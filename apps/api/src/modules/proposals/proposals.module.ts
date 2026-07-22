import { Module } from "@nestjs/common";
import { ContractsController, ProposalsController } from "./proposals.controller.js";
import { ProposalsRepository } from "./proposals.repository.js";
import { ProposalsService } from "./proposals.service.js";

@Module({
  controllers: [ProposalsController, ContractsController],
  providers: [ProposalsService, ProposalsRepository],
  exports: [ProposalsService],
})
export class ProposalsModule {}
