import type { CreateServiceInput, UpdateServiceInput, UpdateServicePriceInput } from "@lyvox/validation";

export interface ServicePriceVersion {
  id: string;
  serviceId: string;
  price: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  unit: string;
  billingType: string;
  isActive: boolean;
  basePrice: string;
  createdAt: string;
  priceHistory?: ServicePriceVersion[];
}

export async function fetchServices(category?: string): Promise<ServiceItem[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  const response = await fetch(`/api/v1/servicos${query}`, {
    headers: { "Accept": "application/json" },
  });
  if (!response.ok) {
    throw new Error("Falha ao buscar catálogo de serviços");
  }
  return response.json();
}

export async function fetchService(id: string): Promise<ServiceItem> {
  const response = await fetch(`/api/v1/servicos/${id}`, {
    headers: { "Accept": "application/json" },
  });
  if (!response.ok) {
    throw new Error("Falha ao buscar detalhe do serviço");
  }
  return response.json();
}

export async function createService(payload: CreateServiceInput, csrfToken?: string): Promise<ServiceItem> {
  const response = await fetch("/api/v1/servicos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken ?? "",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Falha ao criar novo serviço");
  }
  return response.json();
}

export async function updateService(id: string, payload: UpdateServiceInput, csrfToken?: string): Promise<ServiceItem> {
  const response = await fetch(`/api/v1/servicos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken ?? "",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Falha ao atualizar serviço");
  }
  return response.json();
}

export async function updateServicePrice(id: string, payload: UpdateServicePriceInput, csrfToken?: string): Promise<{ service: ServiceItem; newPriceVersion: ServicePriceVersion }> {
  const response = await fetch(`/api/v1/servicos/${id}/precos`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken ?? "",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Falha ao reajustar preço do serviço");
  }
  return response.json();
}

export async function deleteService(id: string, csrfToken?: string): Promise<void> {
  const response = await fetch(`/api/v1/servicos/${id}`, {
    method: "DELETE",
    headers: {
      "X-CSRF-Token": csrfToken ?? "",
    },
  });
  if (!response.ok) {
    throw new Error("Falha ao remover serviço");
  }
}
