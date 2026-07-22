import type { CreateProposalInput, ConvertProposalToContractInput } from "@lyvox/validation";

export interface ProposalItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  discount: string;
  total: string;
}

export interface Proposal {
  id: string;
  clientId: string;
  clientName?: string;
  status: "DRAFT" | "SENT" | "APPROVED" | "REJECTED" | "CONTRACTED";
  validUntil: string;
  subtotal: string;
  discount: string;
  total: string;
  createdAt: string;
  items?: ProposalItem[];
}

export interface Contract {
  id: string;
  proposalId: string;
  clientId: string;
  clientName?: string;
  number: string;
  status: "ACTIVE" | "SUSPENDED" | "TERMINATED" | "COMPLETED";
  startsOn: string;
  endsOn?: string | null;
  total: string;
  createdAt: string;
}

export async function fetchProposals(clientId?: string): Promise<Proposal[]> {
  const query = clientId ? `?clientId=${encodeURIComponent(clientId)}` : "";
  const response = await fetch(`/api/v1/propostas${query}`, {
    headers: { "Accept": "application/json" },
  });
  if (!response.ok) {
    throw new Error("Falha ao buscar propostas");
  }
  return response.json();
}

export async function fetchProposal(id: string): Promise<Proposal> {
  const response = await fetch(`/api/v1/propostas/${id}`, {
    headers: { "Accept": "application/json" },
  });
  if (!response.ok) {
    throw new Error("Falha ao buscar detalhe da proposta");
  }
  return response.json();
}

export async function createProposal(payload: CreateProposalInput, csrfToken?: string): Promise<Proposal> {
  const response = await fetch("/api/v1/propostas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken ?? "",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Falha ao criar proposta");
  }
  return response.json();
}

export async function approveProposal(id: string, csrfToken?: string): Promise<Proposal> {
  const response = await fetch(`/api/v1/propostas/${id}/aprovar`, {
    method: "POST",
    headers: {
      "X-CSRF-Token": csrfToken ?? "",
    },
  });
  if (!response.ok) {
    throw new Error("Falha ao aprovar proposta internamente");
  }
  return response.json();
}

export async function convertProposalToContract(id: string, payload: ConvertProposalToContractInput, csrfToken?: string): Promise<{ contract: Contract; note: string }> {
  const response = await fetch(`/api/v1/propostas/${id}/converter-contrato`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken ?? "",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Falha ao converter proposta em contrato");
  }
  return response.json();
}

export async function fetchContracts(clientId?: string): Promise<Contract[]> {
  const query = clientId ? `?clientId=${encodeURIComponent(clientId)}` : "";
  const response = await fetch(`/api/v1/contratos${query}`, {
    headers: { "Accept": "application/json" },
  });
  if (!response.ok) {
    throw new Error("Falha ao buscar contratos");
  }
  return response.json();
}
