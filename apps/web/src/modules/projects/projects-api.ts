import type { CreateProjectInput, CreateTaskInput, TaskStatus, TaskPriority } from "@lyvox/validation";

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName?: string;
  contractId?: string | null;
  contractNumber?: string | null;
  ownerId?: string | null;
  ownerName?: string | null;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
  startsOn?: string | null;
  dueOn?: string | null;
  budget?: string | null;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  projectId: string;
  parentTaskId?: string | null;
  assigneeId?: string | null;
  assigneeName?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueOn?: string | null;
  createdAt: string;
}

export async function fetchProjects(clientId?: string): Promise<Project[]> {
  const query = clientId ? `?clientId=${encodeURIComponent(clientId)}` : "";
  const response = await fetch(`/api/v1/projetos${query}`, {
    headers: { "Accept": "application/json" },
  });
  if (!response.ok) {
    throw new Error("Falha ao buscar projetos");
  }
  return response.json();
}

export async function fetchProject(id: string): Promise<Project> {
  const response = await fetch(`/api/v1/projetos/${id}`, {
    headers: { "Accept": "application/json" },
  });
  if (!response.ok) {
    throw new Error("Falha ao buscar detalhe do projeto");
  }
  return response.json();
}

export async function createProject(payload: CreateProjectInput, csrfToken?: string): Promise<Project> {
  const response = await fetch("/api/v1/projetos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken ?? "",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Falha ao criar novo projeto");
  }
  return response.json();
}

export async function fetchProjectTasks(projectId: string): Promise<TaskItem[]> {
  const response = await fetch(`/api/v1/projetos/${projectId}/tarefas`, {
    headers: { "Accept": "application/json" },
  });
  if (!response.ok) {
    throw new Error("Falha ao buscar tarefas do projeto");
  }
  return response.json();
}

export async function createTask(payload: CreateTaskInput, csrfToken?: string): Promise<TaskItem> {
  const response = await fetch("/api/v1/tarefas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken ?? "",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Falha ao criar tarefa");
  }
  return response.json();
}

export async function updateTaskStatus(taskId: string, status: TaskStatus, csrfToken?: string): Promise<TaskItem> {
  const response = await fetch(`/api/v1/tarefas/${taskId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken ?? "",
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error("Falha ao atualizar status da tarefa");
  }
  return response.json();
}
