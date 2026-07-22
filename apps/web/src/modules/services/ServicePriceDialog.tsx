import { useState } from "react";
import type { ServiceItem } from "./services-api.js";

interface ServicePriceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceItem | null;
  onUpdatePrice: (newPrice: number) => Promise<void>;
}

export function ServicePriceDialog({ isOpen, onClose, service, onUpdatePrice }: ServicePriceDialogProps) {
  const [newPrice, setNewPrice] = useState(service ? Number(service.basePrice) : 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !service) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onUpdatePrice(newPrice);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao reajustar preço");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-foreground">Reajustar Preço do Serviço</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Serviço: <span className="font-semibold text-foreground">{service.name}</span>
        </p>

        {error && (
          <div className="mt-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="price-dialog-current" className="block text-sm font-medium text-muted-foreground">Preço Atual</label>
            <div id="price-dialog-current" className="mt-1 text-lg font-bold text-foreground">
              R$ {Number(service.basePrice).toFixed(2)}
            </div>
          </div>

          <div>
            <label htmlFor="price-dialog-new" className="block text-sm font-medium text-foreground">Novo Preço Vigente (R$) *</label>
            <input
              id="price-dialog-new"
              type="number"
              step="0.01"
              min="0"
              required
              value={newPrice}
              onChange={(e) => setNewPrice(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {service.priceHistory && service.priceHistory.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-foreground">Histórico de Preços (Versionamento)</h3>
              <div className="mt-2 max-h-40 overflow-y-auto rounded-md border border-border bg-muted/20 p-2 space-y-1">
                {service.priceHistory.map((version) => (
                  <div key={version.id} className="flex justify-between text-xs text-muted-foreground">
                    <span>R$ {Number(version.price).toFixed(2)}</span>
                    <span>
                      {new Date(version.effectiveFrom).toLocaleDateString("pt-BR")}
                      {version.effectiveTo ? ` até ${new Date(version.effectiveTo).toLocaleDateString("pt-BR")}` : " (Vigente)"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              {isSubmitting ? "Salvando..." : "Confirmar Reajuste"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
