import { z } from "zod";

export const projectStatusSchema = z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "ON_HOLD", "CANCELLED"]);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Nome do projeto é obrigatório").max(255),
  clientId: z.string().uuid("ID do cliente é inválido"),
  contractId: z.string().uuid().optional().nullable(),
  ownerId: z.string().uuid().optional().nullable(),
  status: projectStatusSchema.default("PLANNED"),
  startsOn: z.string().optional().nullable(),
  dueOn: z.string().optional().nullable(),
  budget: z.coerce.number().min(0).optional().nullable(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial();
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
export type TaskPriority = z.infer<typeof taskPrioritySchema>;

export const createTaskSchema = z.object({
  projectId: z.string().uuid("ID do projeto é inválido"),
  parentTaskId: z.string().uuid().optional().nullable(),
  assigneeId: z.string().uuid().optional().nullable(),
  title: z.string().trim().min(1, "Título da tarefa é obrigatório").max(255),
  description: z.string().trim().max(5000).optional().nullable(),
  status: taskStatusSchema.default("TODO"),
  priority: taskPrioritySchema.default("MEDIUM"),
  dueOn: z.string().optional().nullable(),
  meetingId: z.string().uuid().optional().nullable(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial();
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
