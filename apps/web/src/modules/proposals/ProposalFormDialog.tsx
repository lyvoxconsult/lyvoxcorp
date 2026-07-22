import { useState } from "react";
import type { CreateProposalInput, ProposalItemInput } from "@lyvox/validation";

interface ProposalFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateProposalInput) => Promise<void>;
  clients: { id: string; name: string }[];
}

export function ProposalFormDialog({ isOpen, onClose, onSave, clients }: ProposalFormDialogProps) {
  const [clientId, setClientId] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [generalDiscount, setGeneralDiscount] = useState(0);
  const [items, setItems] = useState<ProposalItemInput[]>([
    { description: "", quantity: 1, unitPrice: 0, discount: 0 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0, discount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof ProposalItemInput, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + (item.quantity * item.unitPrice - (item.discount || 0)), 0);
  };

  const calculateTotal = () => {
    return Math.max(0, calculateSubtotal() - generalDiscount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({
        clientId,
        validUntil,
        discount: generalDiscount,
        items,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao criar proposta");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-foreground">Nova Proposta Comercial</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Preencha o cliente, a data de validade e os itens de serviço/produtos.
        </p>

        {error && (
          <div className="mt-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="proposal-client" className="block text-sm font-medium text-foreground">Cliente *</label>
              <select
                id="proposal-client"
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">Selecione um cliente...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="proposal-valid-until" className="block text-sm font-medium text-foreground">Válido Até *</label>
              <input
                id="proposal-valid-until"
                type="date"
                required
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-foreground">Itens da Proposta *</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-primary font-semibold hover:underline"
              >
                + Adicionar Item
              </button>
            </div>

            <div className="mt-2 space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start rounded-md border border-border bg-muted/20 p-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Descrição do Item / Serviço"
                      required
                      value={item.description}
                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      placeholder="Qtd"
                      min="1"
                      required
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="number"
                      placeholder="Preço Unit. R$"
                      step="0.01"
                      min="0"
                      required
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, "unitPrice", Number(e.target.value))}
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      placeholder="Desc. R$"
                      step="0.01"
                      min="0"
                      value={item.discount}
                      onChange={(e) => handleItemChange(index, "discount", Number(e.target.value))}
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-xs text-destructive hover:underline p-1"
                    >
                      X
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-border pt-4 text-sm">
            <div>
              <label htmlFor="proposal-discount" className="block text-xs font-medium text-muted-foreground">Desconto Geral (R$)</label>
              <input
                id="proposal-discount"
                type="number"
                step="0.01"
                min="0"
                value={generalDiscount}
                onChange={(e) => setGeneralDiscount(Number(e.target.value))}
                className="mt-1 w-32 rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none"
              />
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Subtotal: R$ {calculateSubtotal().toFixed(2)}</div>
              <div className="text-base font-bold text-foreground">Total: R$ {calculateTotal().toFixed(2)}</div>
            </div>
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
              {isSubmitting ? "Emitindo..." : "Emitir Proposta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
