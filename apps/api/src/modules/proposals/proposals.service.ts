import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateProposalInput, ConvertProposalToContractInput, UpdateProposalInput } from "@lyvox/validation";
import { ProposalsRepository } from "./proposals.repository.js";

@Injectable()
export class ProposalsService {
  constructor(private readonly proposalsRepository: ProposalsRepository) {}

  async listProposals(clientId?: string) {
    return this.proposalsRepository.findAll(clientId);
  }

  async getProposalById(id: string) {
    const proposal = await this.proposalsRepository.findById(id);
    if (!proposal) {
      throw new NotFoundException(`Proposta com ID ${id} não foi encontrada`);
    }
    return proposal;
  }

  async createProposal(input: CreateProposalInput, actorUserId?: string) {
    return this.proposalsRepository.create(input, actorUserId);
  }

  async updateProposal(id: string, input: UpdateProposalInput, actorUserId?: string) {
    const existing = await this.proposalsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Proposta com ID ${id} não foi encontrada`);
    }
    return this.proposalsRepository.update(id, input, actorUserId);
  }

  async approveProposal(id: string, actorUserId?: string) {
    const existing = await this.proposalsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Proposta com ID ${id} não foi encontrada`);
    }
    return this.proposalsRepository.approve(id, actorUserId);
  }

  async convertToContract(id: string, input: ConvertProposalToContractInput, actorUserId?: string) {
    return this.proposalsRepository.convertToContract(id, input, actorUserId);
  }

  async listContracts(clientId?: string) {
    return this.proposalsRepository.listContracts(clientId);
  }

  async getContractById(id: string) {
    const contract = await this.proposalsRepository.getContractById(id);
    if (!contract) {
      throw new NotFoundException(`Contrato com ID ${id} não foi encontrado`);
    }
    return contract;
  }
}
