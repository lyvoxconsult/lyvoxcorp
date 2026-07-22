import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProjects, createProject, type Project } from "./projects-api.js";

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar projetos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Projetos & Operações</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhamento de entregas, tarefas, prazos e visão Gantt (FR-070..FR-072).
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando projetos...</div>
        ) : projects.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Nenhum projeto cadastrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3">Projeto</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Contrato</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Prazo Limite</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-semibold text-foreground">
                      <Link to={`/app/projetos/${project.id}`} className="hover:underline text-primary">
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{project.clientName || project.clientId}</td>
                    <td className="px-4 py-3 text-muted-foreground">{project.contractNumber || "-"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400 border border-blue-500/20">
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{project.dueOn || "Sem data"}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/app/projetos/${project.id}`}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        Ver Detalhes / Gantt
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
