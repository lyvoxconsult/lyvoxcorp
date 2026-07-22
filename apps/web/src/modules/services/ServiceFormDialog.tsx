import { useState } from "react";
import type { CreateServiceInput, ServiceItem } from "./services-api.js";

interface ServiceFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateServiceInput) => Promise<void>;
  initialData?: ServiceItem | null;
}

export function ServiceFormDialog({ isOpen, onClose, onSave, initialData }: ServiceFormDialogProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [unit, setUnit] = useState<"HOUR" | "UNIT" | "MONTH" | "PROJECT">(
    (initialData?.unit as any) ?? "HOUR"
  );
  const [billingType, setBillingType] = useState<"ONE_TIME" | "RECURRING">(
    (initialData?.billingType as any) ?? "ONE_TIME"
  );
  const [basePrice, setBasePrice] = useState(initialData?.basePrice ? Number(initialData.basePrice) : 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({
        name,
        description: description || null,
        category,
        unit,
        billingType,
        basePrice,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar serviço");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-foreground">
          {initialData ? "Editar Serviço" : "Novo Serviço"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre ou altere as informações gerais do serviço no catálogo.
        </p>

        {error && (
          <div className="mt-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="service-name" className="block text-sm font-medium text-foreground">Nome do Serviço *</label>
            <input
              id="service-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              placeholder="Ex: Consultoria em Cloud"
            />
          </div>

          <div>
            <label htmlFor="service-category" className="block text-sm font-medium text-foreground">Categoria *</label>
            <input
              id="service-category"
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              placeholder="Ex: Consultoria, Desenvolvimento, Design"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="service-unit" className="block text-sm font-medium text-foreground">Unidade *</label>
              <select
                id="service-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="HOUR">Hora (HOUR)</option>
                <option value="UNIT">Unidade (UNIT)</option>
                <option value="MONTH">Mês (MONTH)</option>
                <option value="PROJECT">Projeto (PROJECT)</option>
              </select>
            </div>

            <div>
              <label htmlFor="service-billing-type" className="block text-sm font-medium text-foreground">Tipo de Cobrança *</label>
              <select
                id="service-billing-type"
                value={billingType}
                onChange={(e) => setBillingType(e.target.value as any)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="ONE_TIME">Pontual (ONE_TIME)</option>
                <option value="RECURRING">Recorrente (RECURRING)</option>
              </select>
            </div>
          </div>

          {!initialData && (
            <div>
              <label htmlFor="service-base-price" className="block text-sm font-medium text-foreground">Preço Base (R$) *</label>
              <input
                id="service-base-price"
                type="number"
                step="0.01"
                min="0"
                required
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          )}

          <div>
            <label htmlFor="service-description" className="block text-sm font-medium text-foreground">Descrição</label>
            <textarea
              id="service-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              placeholder="Detalhes sobre o escopo do serviço..."
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
              {isSubmitting ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
