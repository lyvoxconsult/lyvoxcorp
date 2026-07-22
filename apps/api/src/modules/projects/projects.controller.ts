import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Put, Query, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { AUTHORIZATION_CONTEXT, type AuthorizationContext } from "../../core/authorization/authorization-context.js";
import { RequirePermission } from "../../core/authorization/access-policy.js";
import { AuthService } from "../auth/auth.service.js";
import { ProjectsService } from "./projects.service.js";
import { createProjectSchema, createTaskSchema, updateProjectSchema, updateTaskSchema, taskStatusSchema } from "@lyvox/validation";
import { z } from "zod";

type AuthorizedRequest = FastifyRequest & { [AUTHORIZATION_CONTEXT]?: AuthorizationContext };

@Controller("projetos")
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @RequirePermission("projects.read")
  async list(@Query("clientId") clientId?: string) {
    return this.projectsService.listProjects(clientId);
  }

  @Get(":id")
  @RequirePermission("projects.read")
  async getById(@Param("id", ParseUUIDPipe) id: string) {
    return this.projectsService.getProjectById(id);
  }

  @Post()
  @RequirePermission("projects.create")
  async create(@Req() req: AuthorizedRequest, @Body() body: unknown) {
    const actor = req[AUTHORIZATION_CONTEXT];
    const csrfHeader = req.headers["x-csrf-token"] as string;
    if (actor?.session) {
      await this.authService.verifyCsrf(actor.session, csrfHeader);
    }

    const payload = createProjectSchema.parse(body);
    return this.projectsService.createProject(payload, actor?.user.id);
  }

  @Put(":id")
  @RequirePermission("projects.update")
  async update(
    @Req() req: AuthorizedRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: unknown
  ) {
    const actor = req[AUTHORIZATION_CONTEXT];
    const csrfHeader = req.headers["x-csrf-token"] as string;
    if (actor?.session) {
      await this.authService.verifyCsrf(actor.session, csrfHeader);
    }

    const payload = updateProjectSchema.parse(body);
    return this.projectsService.updateProject(id, payload, actor?.user.id);
  }

  @Get(":id/tarefas")
  @RequirePermission("tasks.read")
  async listTasks(@Param("id", ParseUUIDPipe) id: string) {
    return this.projectsService.listProjectTasks(id);
  }
}

@Controller("tarefas")
export class TasksController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @RequirePermission("tasks.create")
  async create(@Req() req: AuthorizedRequest, @Body() body: unknown) {
    const actor = req[AUTHORIZATION_CONTEXT];
    const csrfHeader = req.headers["x-csrf-token"] as string;
    if (actor?.session) {
      await this.authService.verifyCsrf(actor.session, csrfHeader);
    }

    const payload = createTaskSchema.parse(body);
    return this.projectsService.createTask(payload, actor?.user.id);
  }

  @Put(":id")
  @RequirePermission("tasks.update")
  async update(
    @Req() req: AuthorizedRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: unknown
  ) {
    const actor = req[AUTHORIZATION_CONTEXT];
    const csrfHeader = req.headers["x-csrf-token"] as string;
    if (actor?.session) {
      await this.authService.verifyCsrf(actor.session, csrfHeader);
    }

    const payload = updateTaskSchema.parse(body);
    return this.projectsService.updateTask(id, payload, actor?.user.id);
  }

  @Patch(":id/status")
  @RequirePermission("tasks.update")
  async updateStatus(
    @Req() req: AuthorizedRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: unknown
  ) {
    const actor = req[AUTHORIZATION_CONTEXT];
    const csrfHeader = req.headers["x-csrf-token"] as string;
    if (actor?.session) {
      await this.authService.verifyCsrf(actor.session, csrfHeader);
    }

    const schema = z.object({ status: taskStatusSchema });
    const payload = schema.parse(body);
    return this.projectsService.updateTaskStatus(id, payload.status, actor?.user.id);
  }
}
