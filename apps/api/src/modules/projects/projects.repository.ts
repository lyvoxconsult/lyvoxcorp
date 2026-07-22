import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq, isNull } from "drizzle-orm";
import { projects, tasks, clients, contracts, users } from "@lyvox/database/schema";
import type { CreateProjectInput, CreateTaskInput, UpdateProjectInput, UpdateTaskInput, TaskStatus } from "@lyvox/validation";
import { DatabaseService } from "../auth/auth.infrastructure.js";

@Injectable()
export class ProjectsRepository {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async findAllProjects(clientId?: string) {
    return this.database.db
      .select({
        id: projects.id,
        name: projects.name,
        clientId: projects.clientId,
        clientName: clients.name,
        contractId: projects.contractId,
        contractNumber: contracts.number,
        ownerId: projects.ownerId,
        ownerName: users.name,
        status: projects.status,
        startsOn: projects.startsOn,
        dueOn: projects.dueOn,
        budget: projects.budget,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .leftJoin(contracts, eq(projects.contractId, contracts.id))
      .leftJoin(users, eq(projects.ownerId, users.id))
      .where(
        clientId
          ? and(eq(projects.clientId, clientId), isNull(projects.deletedAt))
          : isNull(projects.deletedAt)
      )
      .orderBy(desc(projects.createdAt));
  }

  async findProjectById(id: string) {
    const [project] = await this.database.db
      .select({
        id: projects.id,
        name: projects.name,
        clientId: projects.clientId,
        clientName: clients.name,
        contractId: projects.contractId,
        contractNumber: contracts.number,
        ownerId: projects.ownerId,
        ownerName: users.name,
        status: projects.status,
        startsOn: projects.startsOn,
        dueOn: projects.dueOn,
        budget: projects.budget,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .leftJoin(contracts, eq(projects.contractId, contracts.id))
      .leftJoin(users, eq(projects.ownerId, users.id))
      .where(and(eq(projects.id, id), isNull(projects.deletedAt)))
      .limit(1);

    return project || null;
  }

  async createProject(input: CreateProjectInput, actorUserId?: string) {
    const [created] = await this.database.db
      .insert(projects)
      .values({
        name: input.name,
        clientId: input.clientId,
        contractId: input.contractId ?? null,
        ownerId: input.ownerId ?? null,
        status: input.status,
        startsOn: input.startsOn ?? null,
        dueOn: input.dueOn ?? null,
        budget: input.budget ? String(input.budget) : null,
        createdById: actorUserId ?? null,
        updatedById: actorUserId ?? null,
      })
      .returning();

    return created;
  }

  async updateProject(id: string, input: UpdateProjectInput, actorUserId?: string) {
    const [updated] = await this.database.db
      .update(projects)
      .set({
        name: input.name,
        clientId: input.clientId,
        contractId: input.contractId,
        ownerId: input.ownerId,
        status: input.status,
        startsOn: input.startsOn,
        dueOn: input.dueOn,
        budget: input.budget !== undefined ? (input.budget ? String(input.budget) : null) : undefined,
        updatedAt: new Date(),
        updatedById: actorUserId ?? null,
      })
      .where(and(eq(projects.id, id), isNull(projects.deletedAt)))
      .returning();

    return updated || null;
  }

  async findTasksByProjectId(projectId: string) {
    return this.database.db
      .select({
        id: tasks.id,
        projectId: tasks.projectId,
        parentTaskId: tasks.parentTaskId,
        assigneeId: tasks.assigneeId,
        assigneeName: users.name,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        dueOn: tasks.dueOn,
        createdAt: tasks.createdAt,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .where(and(eq(tasks.projectId, projectId), isNull(tasks.deletedAt)))
      .orderBy(tasks.dueOn, tasks.createdAt);
  }

  async createTask(input: CreateTaskInput, actorUserId?: string) {
    const [created] = await this.database.db
      .insert(tasks)
      .values({
        projectId: input.projectId,
        parentTaskId: input.parentTaskId ?? null,
        assigneeId: input.assigneeId ?? null,
        title: input.title,
        description: input.description ?? null,
        status: input.status,
        priority: input.priority,
        dueOn: input.dueOn ?? null,
        createdById: actorUserId ?? null,
        updatedById: actorUserId ?? null,
      })
      .returning();

    return {
      ...created,
      originMeetingId: input.meetingId ?? null, // FR-043 link
    };
  }

  async updateTask(id: string, input: UpdateTaskInput, actorUserId?: string) {
    const [updated] = await this.database.db
      .update(tasks)
      .set({
        title: input.title,
        description: input.description,
        status: input.status,
        priority: input.priority,
        assigneeId: input.assigneeId,
        parentTaskId: input.parentTaskId,
        dueOn: input.dueOn,
        updatedAt: new Date(),
        updatedById: actorUserId ?? null,
      })
      .where(and(eq(tasks.id, id), isNull(tasks.deletedAt)))
      .returning();

    return updated || null;
  }

  async updateTaskStatus(id: string, status: TaskStatus, actorUserId?: string) {
    const [updated] = await this.database.db
      .update(tasks)
      .set({
        status,
        updatedAt: new Date(),
        updatedById: actorUserId ?? null,
      })
      .where(and(eq(tasks.id, id), isNull(tasks.deletedAt)))
      .returning();

    return updated || null;
  }
}
