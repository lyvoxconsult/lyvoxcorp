import { useEffect, useState } from "react";
import { fetchServices, createService, updateService, updateServicePrice, deleteService, type ServiceItem } from "./services-api.js";
import { ServiceFormDialog } from "./ServiceFormDialog.js";
import { ServicePriceDialog } from "./ServicePriceDialog.js";

export function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [priceService, setPriceService] = useState<ServiceItem | null>(null);

  const loadServices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchServices(selectedCategory || undefined);
      setServices(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar catálogo de serviços");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [selectedCategory]);

  const handleCreate = async (data: any) => {
    await createService(data);
    await loadServices();
  };

  const handleUpdate = async (data: any) => {
    if (editingService) {
      await updateService(editingService.id, data);
      await loadServices();
    }
  };

  const handleUpdatePrice = async (newPrice: number) => {
    if (priceService) {
      await updateServicePrice(priceService.id, { price: newPrice });
      await loadServices();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este serviço?")) {
      await deleteService(id);
      await loadServices();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Catálogo de Serviços e Valores</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os serviços oferecidos, unidades, tipos de cobrança e histórico de preços.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingService(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + Novo Serviço
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Filtrar por categoria..."
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="max-w-xs rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </div>

      {/* Services Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando serviços...</div>
        ) : services.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Nenhum serviço cadastrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3">Serviço</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Unidade</th>
                  <th className="px-4 py-3">Cobrança</th>
                  <th className="px-4 py-3">Preço Base (Vigente)</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{service.name}</div>
                      {service.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">{service.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{service.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{service.unit}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        service.billingType === "RECURRING"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}>
                        {service.billingType === "RECURRING" ? "Recorrente" : "Pontual"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      R$ {Number(service.basePrice).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setPriceService(service);
                          setIsPriceDialogOpen(true);
                        }}
                        className="text-xs text-primary hover:underline"
                      >
                        Reajustar Preço
                      </button>
                      <button
                        onClick={() => {
                          setEditingService(service);
                          setIsFormOpen(true);
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="text-xs text-destructive hover:underline"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ServiceFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={editingService ? handleUpdate : handleCreate}
        initialData={editingService}
      />

      <ServicePriceDialog
        isOpen={isPriceDialogOpen}
        onClose={() => setIsPriceDialogOpen(false)}
        service={priceService}
        onUpdatePrice={handleUpdatePrice}
      />
    </div>
  );
}
