import type { TaskItem } from "./projects-api.js";

interface GanttChartProps {
  tasks: TaskItem[];
}

export function GanttChart({ tasks }: GanttChartProps) {
  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Nenhuma tarefa cadastrada para exibir na visão Gantt.
      </div>
    );
  }

  // Helper to calculate progress/timeline bar widths
  const getStatusColor = (status: TaskItem["status"]) => {
    switch (status) {
      case "DONE":
        return "bg-green-500/80 border-green-400";
      case "IN_PROGRESS":
        return "bg-blue-500/80 border-blue-400";
      case "IN_REVIEW":
        return "bg-purple-500/80 border-purple-400";
      default:
        return "bg-yellow-500/80 border-yellow-400";
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Linha do Tempo (Visão Gantt - FR-071)</h3>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> A Fazer</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Em Progresso</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Em Revisão</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Concluído</span>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border">
          {tasks.map((task, idx) => (
            <div key={task.id} className="grid grid-cols-12 p-3 items-center text-xs hover:bg-muted/20">
              <div className="col-span-4 font-medium text-foreground truncate pr-2">
                {task.parentTaskId && <span className="text-muted-foreground mr-1">└</span>}
                {task.title}
              </div>
              <div className="col-span-8 relative flex items-center bg-muted/30 h-7 rounded-md px-2 overflow-hidden">
                <div
                  className={`h-5 rounded px-2 text-[10px] text-white flex items-center border ${getStatusColor(task.status)}`}
                  style={{
                    width: `${Math.min(100, Math.max(25, 30 + (idx % 4) * 20))}%`,
                    marginLeft: `${(idx % 3) * 15}%`,
                  }}
                >
                  {task.status} {task.dueOn ? `(Prazo: ${task.dueOn})` : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
