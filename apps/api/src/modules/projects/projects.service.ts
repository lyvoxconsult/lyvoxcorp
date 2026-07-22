import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateProjectInput, CreateTaskInput, UpdateProjectInput, UpdateTaskInput, TaskStatus } from "@lyvox/validation";
import { ProjectsRepository } from "./projects.repository.js";

@Injectable()
export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async listProjects(clientId?: string) {
    return this.projectsRepository.findAllProjects(clientId);
  }

  async getProjectById(id: string) {
    const project = await this.projectsRepository.findProjectById(id);
    if (!project) {
      throw new NotFoundException(`Projeto com ID ${id} não foi encontrado`);
    }
    return project;
  }

  async createProject(input: CreateProjectInput, actorUserId?: string) {
    return this.projectsRepository.createProject(input, actorUserId);
  }

  async updateProject(id: string, input: UpdateProjectInput, actorUserId?: string) {
    const existing = await this.projectsRepository.findProjectById(id);
    if (!existing) {
      throw new NotFoundException(`Projeto com ID ${id} não foi encontrado`);
    }
    return this.projectsRepository.updateProject(id, input, actorUserId);
  }

  async listProjectTasks(projectId: string) {
    const project = await this.projectsRepository.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException(`Projeto com ID ${projectId} não foi encontrado`);
    }
    return this.projectsRepository.findTasksByProjectId(projectId);
  }

  async createTask(input: CreateTaskInput, actorUserId?: string) {
    const project = await this.projectsRepository.findProjectById(input.projectId);
    if (!project) {
      throw new NotFoundException(`Projeto com ID ${input.projectId} não foi encontrado`);
    }
    return this.projectsRepository.createTask(input, actorUserId);
  }

  async updateTask(id: string, input: UpdateTaskInput, actorUserId?: string) {
    return this.projectsRepository.updateTask(id, input, actorUserId);
  }

  async updateTaskStatus(id: string, status: TaskStatus, actorUserId?: string) {
    return this.projectsRepository.updateTaskStatus(id, status, actorUserId);
  }
}
