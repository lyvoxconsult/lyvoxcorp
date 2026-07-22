import { describe, expect, it } from "vitest";
import { createProjectSchema, createTaskSchema } from "./projects.js";

describe("Projects and Tasks Validation Schemas", () => {
  it("validates a valid project payload", () => {
    const payload = {
      name: "Implantação de Sistema ERP",
      clientId: "123e4567-e89b-12d3-a456-426614174000",
      status: "IN_PROGRESS",
      startsOn: "2026-08-01",
      dueOn: "2026-11-30",
      budget: 50000.0,
    };

    const result = createProjectSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("validates a task payload with parent task (subtask FR-072)", () => {
    const payload = {
      projectId: "123e4567-e89b-12d3-a456-426614174000",
      parentTaskId: "223e4567-e89b-12d3-a456-426614174001",
      title: "Configurar banco de dados",
      description: "Subtarefa técnica de infraestrutura",
      status: "TODO",
      priority: "HIGH",
    };

    const result = createTaskSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("rejects task without project ID or title", () => {
    const payload = {
      title: "",
    };

    const result = createTaskSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
