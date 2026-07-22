import { useState } from "react";
import type { Proposal } from "./proposals-api.js";

interface ConvertContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: Proposal | null;
  onConvert: (contractNumber: string, startsOn: string, endsOn?: string) => Promise<void>;
}

export function ConvertContractDialog({ isOpen, onClose, proposal, onConvert }: ConvertContractDialogProps) {
  const [number, setNumber] = useState(`CTR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [startsOn, setStartsOn] = useState(new Date().toISOString().split("T")[0]);
  const [endsOn, setEndsOn] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !proposal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onConvert(number, startsOn, endsOn || undefined);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao converter em contrato");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-foreground">Converter em Contrato (FR-063)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Proposta para: <span className="font-semibold text-foreground">{proposal.clientName}</span> (R$ {Number(proposal.total).toFixed(2)})
        </p>

        {error && (
          <div className="mt-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="contract-number" className="block text-sm font-medium text-foreground">Número do Contrato *</label>
            <input
              id="contract-number"
              type="text"
              required
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="contract-starts-on" className="block text-sm font-medium text-foreground">Data de Início *</label>
            <input
              id="contract-starts-on"
              type="date"
              required
              value={startsOn}
              onChange={(e) => setStartsOn(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="contract-ends-on" className="block text-sm font-medium text-foreground">Data de Término (Opcional)</label>
            <input
              id="contract-ends-on"
              type="date"
              value={endsOn}
              onChange={(e) => setEndsOn(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
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
              {isSubmitting ? "Gerando..." : "Gerar Contrato"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
