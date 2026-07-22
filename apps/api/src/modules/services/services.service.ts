import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateServiceInput, UpdateServiceInput, UpdateServicePriceInput } from "@lyvox/validation";
import { ServicesRepository } from "./services.repository.js";

@Injectable()
export class ServicesService {
  constructor(private readonly servicesRepository: ServicesRepository) {}

  async listServices(category?: string) {
    return this.servicesRepository.findAll(category);
  }

  async getServiceById(id: string) {
    const service = await this.servicesRepository.findById(id);
    if (!service) {
      throw new NotFoundException(`Serviço com ID ${id} não foi encontrado`);
    }
    return service;
  }

  async createService(input: CreateServiceInput, actorUserId?: string) {
    return this.servicesRepository.create(input, actorUserId);
  }

  async updateService(id: string, input: UpdateServiceInput, actorUserId?: string) {
    const existing = await this.servicesRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Serviço com ID ${id} não foi encontrado`);
    }
    return this.servicesRepository.update(id, input, actorUserId);
  }

  async updateServicePrice(id: string, input: UpdateServicePriceInput, actorUserId?: string) {
    const existing = await this.servicesRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Serviço com ID ${id} não foi encontrado`);
    }
    return this.servicesRepository.updatePrice(id, input, actorUserId);
  }

  async deleteService(id: string, actorUserId?: string) {
    const existing = await this.servicesRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Serviço com ID ${id} não foi encontrado`);
    }
    return this.servicesRepository.softDelete(id, actorUserId);
  }
}
