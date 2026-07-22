import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchProject, fetchProjectTasks, createTask, updateTaskStatus, type Project, type TaskItem } from "./projects-api.js";
import { TaskFormDialog } from "./TaskFormDialog.js";
import { GanttChart } from "./GanttChart.js";

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [activeTab, setActiveTab] = useState<"LIST" | "KANBAN" | "GANTT">("LIST");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [projData, tasksData] = await Promise.all([
        fetchProject(id),
        fetchProjectTasks(id),
      ]);
      setProject(projData);
      setTasks(tasksData);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar detalhes do projeto");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleCreateTask = async (data: any) => {
    await createTask(data);
    await loadData();
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskItem["status"]) => {
    await updateTaskStatus(taskId, newStatus);
    await loadData();
  };

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Carregando projeto...</div>;
  }

  if (!project) {
    return <div className="p-8 text-center text-sm text-destructive">Projeto não encontrado.</div>;
  }

  const kanbanColumns: { status: TaskItem["status"]; title: string }[] = [
    { status: "TODO", title: "A Fazer" },
    { status: "IN_PROGRESS", title: "Em Progresso" },
    { status: "IN_REVIEW", title: "Em Revisão" },
    { status: "DONE", title: "Concluído" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{project.name}</h1>
          <p className="text-sm text-muted-foreground">
            Cliente: <span className="text-foreground font-medium">{project.clientName}</span> | Status: <span className="font-semibold text-primary">{project.status}</span>
          </p>
        </div>
        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + Nova Tarefa
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* View Switcher Tabs (FR-071: Lista, Kanban, Gantt) */}
      <div className="flex border-b border-border space-x-4">
        <button
          onClick={() => setActiveTab("LIST")}
          className={`pb-2 text-sm font-semibold border-b-2 ${
            activeTab === "LIST"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Visão Lista & Subtarefas (FR-072)
        </button>
        <button
          onClick={() => setActiveTab("KANBAN")}
          className={`pb-2 text-sm font-semibold border-b-2 ${
            activeTab === "KANBAN"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Visão Kanban (FR-071)
        </button>
        <button
          onClick={() => setActiveTab("GANTT")}
          className={`pb-2 text-sm font-semibold border-b-2 ${
            activeTab === "GANTT"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Visão Gantt / Linha do Tempo (FR-071)
        </button>
      </div>

      {/* Tab 1: LIST */}
      {activeTab === "LIST" && (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Nenhuma tarefa criada.</div>
          ) : (
            <div className="divide-y divide-border">
              {tasks.map((task) => (
                <div key={task.id} className="p-4 flex items-center justify-between hover:bg-muted/20">
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      {task.parentTaskId && <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Subtarefa</span>}
                      {task.title}
                    </div>
                    {task.description && <div className="text-xs text-muted-foreground mt-0.5">{task.description}</div>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Prioridade: {task.priority}</span>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskItem["status"])}
                      className="rounded border border-input bg-background px-2 py-1 text-xs text-foreground"
                    >
                      <option value="TODO">A Fazer</option>
                      <option value="IN_PROGRESS">Em Progresso</option>
                      <option value="IN_REVIEW">Em Revisão</option>
                      <option value="DONE">Concluído</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: KANBAN */}
      {activeTab === "KANBAN" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {kanbanColumns.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.status);
            return (
              <div key={col.status} className="rounded-xl border border-border bg-card p-3 flex flex-col space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <h4 className="text-sm font-bold text-foreground">{col.title}</h4>
                  <span className="text-xs rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="space-y-2 flex-1 min-h-[200px]">
                  {columnTasks.map((task) => (
                    <div key={task.id} className="rounded-lg border border-border bg-background p-3 shadow-xs space-y-1">
                      <div className="text-xs font-semibold text-foreground">{task.title}</div>
                      {task.description && <div className="text-[11px] text-muted-foreground line-clamp-2">{task.description}</div>}
                      <div className="flex justify-between items-center pt-2 text-[10px] text-muted-foreground">
                        <span>P: {task.priority}</span>
                        {task.dueOn && <span>Prazo: {task.dueOn}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: GANTT */}
      {activeTab === "GANTT" && (
        <GanttChart tasks={tasks} />
      )}

      <TaskFormDialog
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        projectId={project.id}
        existingTasks={tasks}
        onSave={handleCreateTask}
      />
    </div>
  );
}
