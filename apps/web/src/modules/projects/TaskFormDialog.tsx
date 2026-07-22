import { useState } from "react";
import type { CreateTaskInput, TaskPriority, TaskStatus } from "@lyvox/validation";
import type { TaskItem } from "./projects-api.js";

interface TaskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  existingTasks: TaskItem[];
  onSave: (data: CreateTaskInput) => Promise<void>;
}

export function TaskFormDialog({ isOpen, onClose, projectId, existingTasks, onSave }: TaskFormDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [parentTaskId, setParentTaskId] = useState<string | null>(null);
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [dueOn, setDueOn] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({
        projectId,
        title,
        description: description || null,
        parentTaskId: parentTaskId || null,
        priority,
        status,
        dueOn: dueOn || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar tarefa");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-foreground">Nova Tarefa / Subtarefa (FR-072)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Crie tarefas operacionais, vincule subtarefas e defina prazos e prioridades.
        </p>

        {error && (
          <div className="mt-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-foreground">Título da Tarefa *</label>
            <input
              id="task-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              placeholder="Ex: Desenvolver fluxo de login"
            />
          </div>

          <div>
            <label htmlFor="task-parent" className="block text-sm font-medium text-foreground">Tarefa Pai (Opcional - Subtarefa FR-072)</label>
            <select
              id="task-parent"
              value={parentTaskId || ""}
              onChange={(e) => setParentTaskId(e.target.value || null)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">Nenhuma (Tarefa Principal)</option>
              {existingTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-priority" className="block text-sm font-medium text-foreground">Prioridade *</label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="LOW">Baixa (LOW)</option>
                <option value="MEDIUM">Média (MEDIUM)</option>
                <option value="HIGH">Alta (HIGH)</option>
                <option value="URGENT">Urgente (URGENT)</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-status" className="block text-sm font-medium text-foreground">Status *</label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="TODO">A Fazer (TODO)</option>
                <option value="IN_PROGRESS">Em Progresso</option>
                <option value="IN_REVIEW">Em Revisão</option>
                <option value="DONE">Concluído</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="task-due-on" className="block text-sm font-medium text-foreground">Data Limite / Prazo</label>
            <input
              id="task-due-on"
              type="date"
              value={dueOn}
              onChange={(e) => setDueOn(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="task-desc" className="block text-sm font-medium text-foreground">Descrição / Detalhes</label>
            <textarea
              id="task-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              placeholder="Instruções operacionais..."
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "Criando..." : "Criar Tarefa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
