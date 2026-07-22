import { describe, expect, it, vi } from "vitest";
import { ProjectsController, TasksController } from "./projects.controller.js";
import type { ProjectsService } from "./projects.service.js";
import type { AuthService } from "../auth/auth.service.js";

describe("ProjectsController and TasksController", () => {
  const mockProjectsService = {
    listProjects: vi.fn().mockResolvedValue([
      {
        id: "proj-1",
        name: "Desenvolvimento ERP",
        clientId: "client-1",
        status: "IN_PROGRESS",
      },
    ]),
    getProjectById: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    listProjectTasks: vi.fn().mockResolvedValue([
      {
        id: "task-1",
        projectId: "proj-1",
        title: "Modelar banco de dados",
        status: "TODO",
        priority: "HIGH",
      },
    ]),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    updateTaskStatus: vi.fn().mockResolvedValue({ id: "task-1", status: "DONE" }),
  } as unknown as ProjectsService;

  const mockAuthService = {
    verifyCsrf: vi.fn().mockResolvedValue(true),
  } as unknown as AuthService;

  const projectsController = new ProjectsController(mockProjectsService, mockAuthService);
  const tasksController = new TasksController(mockProjectsService, mockAuthService);

  it("lists projects", async () => {
    const result = await projectsController.list();
    expect(result).toHaveLength(1);
    expect(mockProjectsService.listProjects).toHaveBeenCalled();
  });

  it("lists project tasks", async () => {
    const result = await projectsController.listTasks("123e4567-e89b-12d3-a456-426614174000");
    expect(result).toHaveLength(1);
    expect(mockProjectsService.listProjectTasks).toHaveBeenCalledWith("123e4567-e89b-12d3-a456-426614174000");
  });

  it("updates task status for Kanban", async () => {
    const req = { headers: { "x-csrf-token": "valid" } } as any;
    const result = await tasksController.updateStatus(req, "123e4567-e89b-12d3-a456-426614174000", { status: "DONE" });
    expect(result.status).toBe("DONE");
  });
});
