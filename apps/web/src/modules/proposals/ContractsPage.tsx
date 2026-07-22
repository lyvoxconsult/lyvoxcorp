import { useEffect, useState } from "react";
import { fetchContracts, type Contract } from "./proposals-api.js";

export function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContracts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchContracts();
      setContracts(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar contratos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Contratos de Clientes</h1>
        <p className="text-sm text-muted-foreground">
          Contratos ativos derivados de propostas aprovadas (FR-063).
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando contratos...</div>
        ) : contracts.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Nenhum contrato ativo.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3">Número</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Início</th>
                  <th className="px-4 py-3">Término</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Valor Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-semibold text-foreground">{contract.number}</td>
                    <td className="px-4 py-3 text-muted-foreground">{contract.clientName || contract.clientId}</td>
                    <td className="px-4 py-3 text-muted-foreground">{contract.startsOn}</td>
                    <td className="px-4 py-3 text-muted-foreground">{contract.endsOn || "Indeterminado"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400 border border-green-500/20">
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-foreground">R$ {Number(contract.total).toFixed(2)}</td>
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
