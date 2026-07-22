import type { ImportLeadsInput } from "@lyvox/validation";
import { apiRequest, bootstrapCsrf, newIdempotencyKey } from "../../lib/api-client";
import type {
  ChangeStageDraft,
  ConvertDraft,
  CreateLeadDraft,
  CustomizeStagesDraft,
  FollowupDraft,
  LeadConversionResponse,
  LeadFollowupMutationResponse,
  LeadImportResponse,
  LeadMutationResponse,
  LeadStageMutationResponse,
  Pipeline,
  PipelineFilters,
  Responsible,
} from "./crm-types";

function mutationHeaders(): HeadersInit { return { "Idempotency-Key": newIdempotencyKey() }; }

export function listPipeline(filters: PipelineFilters, signal?: AbortSignal): Promise<Pipeline> {
  const query = new URLSearchParams();
  if (filters.search) query.set("search", filters.search);
  if (filters.stageId) query.set("stageId", filters.stageId);
  if (filters.responsibleId) query.set("responsibleId", filters.responsibleId);
  if (filters.cursor) query.set("cursor", filters.cursor);
  if (filters.pageSize) query.set("pageSize", String(filters.pageSize));
  return apiRequest<Pipeline>(`/crm/leads?${query.toString()}`, { signal });
}

export async function createLead(input: CreateLeadDraft): Promise<LeadMutationResponse> {
  await bootstrapCsrf();
  return apiRequest("/crm/leads", { method: "POST", headers: mutationHeaders(), body: JSON.stringify(input) });
}

export async function changeLeadStage(id: string, input: ChangeStageDraft): Promise<LeadStageMutationResponse> {
  await bootstrapCsrf();
  return apiRequest(`/crm/leads/${encodeURIComponent(id)}/stage`, { method: "PATCH", body: JSON.stringify(input) });
}

export async function createFollowup(id: string, input: FollowupDraft): Promise<LeadFollowupMutationResponse> {
  await bootstrapCsrf();
  return apiRequest(`/crm/leads/${encodeURIComponent(id)}/followups`, { method: "POST", headers: mutationHeaders(), body: JSON.stringify(input) });
}

export async function convertLead(id: string, input: ConvertDraft): Promise<LeadConversionResponse> {
  await bootstrapCsrf();
  return apiRequest(`/crm/leads/${encodeURIComponent(id)}/convert`, { method: "POST", headers: mutationHeaders(), body: JSON.stringify(input) });
}

export async function importLeads(input: ImportLeadsInput): Promise<LeadImportResponse> {
  await bootstrapCsrf();
  return apiRequest("/crm/leads/import", { method: "POST", headers: mutationHeaders(), body: JSON.stringify(input) });
}

export async function customizeStages(input: CustomizeStagesDraft): Promise<Pipeline["stages"]> {
  await bootstrapCsrf();
  const response = await apiRequest<{ stages: Pipeline["stages"] }>("/crm/stages", { method: "PATCH", headers: mutationHeaders(), body: JSON.stringify(input) });
  return response.stages;
}

export async function listCrmResponsibles(search: string, signal?: AbortSignal): Promise<Responsible[]> {
  const query = new URLSearchParams(); if (search) query.set("search", search);
  const response = await apiRequest<{ items: Responsible[] }>(`/crm/responsaveis?${query.toString()}`, { signal });
  return response.items;
}
