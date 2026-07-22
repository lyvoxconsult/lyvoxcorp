import { useEffect, useState } from "react";
import { fetchProposals, createProposal, approveProposal, convertProposalToContract, type Proposal } from "./proposals-api.js";
import { ProposalFormDialog } from "./ProposalFormDialog.js";
import { ConvertContractDialog } from "./ConvertContractDialog.js";

export function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  const mockClients = [
    { id: "123e4567-e89b-12d3-a456-426614174000", name: "Empresa Alfa LTDA" },
    { id: "223e4567-e89b-12d3-a456-426614174001", name: "Tech Beta S.A." },
  ];

  const loadProposals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchProposals();
      setProposals(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar propostas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, []);

  const handleCreate = async (data: any) => {
    await createProposal(data);
    await loadProposals();
  };

  const handleApprove = async (id: string) => {
    if (confirm("Confirmar aprovação interna da proposta? (FR-062)")) {
      await approveProposal(id);
      await loadProposals();
    }
  };

  const handleConvertContract = async (number: string, startsOn: string, endsOn?: string) => {
    if (selectedProposal) {
      const result = await convertProposalToContract(selectedProposal.id, { number, startsOn, endsOn });
      alert(`Contrato criado com sucesso!\n\nNota: ${result.note}`);
      await loadProposals();
    }
  };

  const getStatusBadge = (status: Proposal["status"]) => {
    switch (status) {
      case "DRAFT":
        return <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-400 border border-yellow-500/20">Rascunho</span>;
      case "APPROVED":
        return <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400 border border-green-500/20">Aprovada Interna</span>;
      case "CONTRACTED":
        return <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400 border border-blue-500/20">Contratado</span>;
      default:
        return <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{status}</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Propostas Comerciais</h1>
          <p className="text-sm text-muted-foreground">
            Emissão de orçamentos, aprovação interna (FR-062) e conversão em contrato (FR-063).
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + Nova Proposta
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Proposals Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando propostas...</div>
        ) : proposals.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Nenhuma proposta emitida.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Válido Até</th>
                  <th className="px-4 py-3">Subtotal</th>
                  <th className="px-4 py-3">Desconto</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {proposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {proposal.clientName || proposal.clientId}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(proposal.status)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{proposal.validUntil}</td>
                    <td className="px-4 py-3 text-muted-foreground">R$ {Number(proposal.subtotal).toFixed(2)}</td>
                    <td className="px-4 py-3 text-muted-foreground">R$ {Number(proposal.discount).toFixed(2)}</td>
                    <td className="px-4 py-3 font-bold text-foreground">R$ {Number(proposal.total).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {proposal.status === "DRAFT" && (
                        <button
                          onClick={() => handleApprove(proposal.id)}
                          className="text-xs text-green-400 font-semibold hover:underline"
                        >
                          Aprovar (FR-062)
                        </button>
                      )}
                      {proposal.status === "APPROVED" && (
                        <button
                          onClick={() => {
                            setSelectedProposal(proposal);
                            setIsConvertOpen(true);
                          }}
                          className="text-xs text-primary font-semibold hover:underline"
                        >
                          Gerar Contrato (FR-063)
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProposalFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleCreate}
        clients={mockClients}
      />

      <ConvertContractDialog
        isOpen={isConvertOpen}
        onClose={() => setIsConvertOpen(false)}
        proposal={selectedProposal}
        onConvert={handleConvertContract}
      />
    </div>
  );
}
