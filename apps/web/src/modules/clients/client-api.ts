import { apiRequest, bootstrapCsrf, newIdempotencyKey } from "../../lib/api-client";
import type { ClientMutationResponse } from "@lyvox/validation";
import type { ClientDetailResponse, ClientDraft, ClientListFilters, ClientListResponse, Responsible } from "./client-types";

function listPath(filters: ClientListFilters): string {
  const query = new URLSearchParams();
  if (filters.search) query.set("search", filters.search);
  if (filters.status) query.set("status", filters.status);
  if (filters.tag) query.set("tag", filters.tag);
  if (filters.cursor) query.set("cursor", filters.cursor);
  if (filters.pageSize) query.set("pageSize", String(filters.pageSize));
  const suffix = query.toString();
  return `/clientes${suffix ? `?${suffix}` : ""}`;
}

export function listClients(filters: ClientListFilters, signal?: AbortSignal): Promise<ClientListResponse> {
  return apiRequest<ClientListResponse>(listPath(filters), { signal });
}

export function getClient(id: string, timelineCursor?: string, signal?: AbortSignal): Promise<ClientDetailResponse> {
  const query = timelineCursor ? `?timelineCursor=${encodeURIComponent(timelineCursor)}` : "";
  return apiRequest<ClientDetailResponse>(`/clientes/${encodeURIComponent(id)}${query}`, { signal });
}

export async function createClient(input: ClientDraft): Promise<ClientMutationResponse> {
  await bootstrapCsrf();
  return apiRequest<ClientMutationResponse>("/clientes", {
    method: "POST",
    headers: { "Idempotency-Key": newIdempotencyKey() },
    body: JSON.stringify(input),
  });
}

export async function updateClient(id: string, input: ClientDraft, version: number): Promise<ClientMutationResponse> {
  await bootstrapCsrf();
  return apiRequest<ClientMutationResponse>(`/clientes/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Idempotency-Key": newIdempotencyKey() },
    body: JSON.stringify({ ...input, version }),
  });
}

export async function archiveClient(id: string, version: number): Promise<void> {
  await bootstrapCsrf();
  await apiRequest(`/clientes/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "Idempotency-Key": newIdempotencyKey(), "If-Match": `"${version}"` },
  });
}

export async function listResponsibles(search: string, signal?: AbortSignal): Promise<Responsible[]> {
  const query = new URLSearchParams();
  if (search) query.set("search", search);
  const response = await apiRequest<{ items: Responsible[] }>(`/clientes/responsaveis?${query.toString()}`, { signal });
  return response.items;
}
