import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSession } from "../../auth/session-context";
import { getClient } from "./client-api";
import { ClientDetailPage } from "./ClientDetailPage";
import type { ClientDetailResponse } from "./client-types";

vi.mock("../../auth/session-context", () => ({ useSession: vi.fn() }));
vi.mock("./client-api", () => ({ getClient: vi.fn(), updateClient: vi.fn(), archiveClient: vi.fn(), listResponsibles: vi.fn().mockResolvedValue([]) }));

const detail: ClientDetailResponse = {
  client: {
    id: "11111111-1111-4111-8111-111111111111", type: "PJ", name: "Acme", tradeName: "Acme", document: "11222333000181",
    email: "contato@acme.com", status: "ACTIVE", version: 2, createdAt: "2026-07-22T12:00:00Z", updatedAt: "2026-07-22T12:00:00Z",
    tags: ["VIP"], responsibles: [{ id: "22222222-2222-4222-8222-222222222222", fullName: "User" }],
    address: { id: "33333333-3333-4333-8333-333333333333", label: "PRIMARY", postalCode: "01001000", street: "Praça", number: "1", district: "Centro", city: "São Paulo", state: "SP", country: "BR" },
    contacts: [{ id: "44444444-4444-4444-8444-444444444444", type: "PHONE", label: "Comercial", value: "11999999999", isPrimary: true }],
  },
  timeline: { data: [], meta: { pageSize: 20, hasMore: false, nextCursor: null } },
};

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[`/app/clientes/${detail.client.id}`]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Routes><Route path="/app/clientes/:id" element={<ClientDetailPage />} /></Routes></MemoryRouter></QueryClientProvider>);
}

describe("ClientDetailPage", () => {
  beforeEach(() => vi.mocked(useSession).mockReturnValue({ user: { id: "u", email: "u@example.com", fullName: "User", passwordChangeRequired: false, mfaVerified: true }, grants: [], loading: false, error: null, can: () => true, retry: vi.fn() }));
  it("renders persisted detail and a real empty timeline", async () => {
    vi.mocked(getClient).mockResolvedValue(detail); renderPage();
    expect(await screen.findByRole("heading", { name: "Acme" })).toBeVisible();
    expect(screen.getByText("Nenhuma interação registrada")).toBeVisible();
    expect(screen.getByText("User")).toBeVisible();
    expect(screen.getByText("VIP")).toBeVisible();
  });
  it("loads the next real timeline cursor", async () => {
    vi.mocked(getClient)
      .mockResolvedValueOnce({ ...detail, timeline: { data: [{ id: "55555555-5555-4555-8555-555555555555", eventType: "ClientCreated", sourceModule: "clients", sourceEntityType: "client", sourceEntityId: detail.client.id, summary: "Cliente criado", occurredAt: "2026-07-22T12:00:00Z" }], meta: { pageSize: 1, hasMore: true, nextCursor: "next" } } })
      .mockResolvedValueOnce({ ...detail, timeline: { data: [{ id: "66666666-6666-4666-8666-666666666666", eventType: "ClientUpdated", sourceModule: "clients", sourceEntityType: "client", sourceEntityId: detail.client.id, summary: "Cliente atualizado", occurredAt: "2026-07-21T12:00:00Z" }], meta: { pageSize: 1, hasMore: false, nextCursor: null } } });
    const user = userEvent.setup(); renderPage();
    await user.click(await screen.findByRole("button", { name: "Carregar mais atividades" }));
    expect(await screen.findByText("Cliente atualizado")).toBeVisible();
    expect(getClient).toHaveBeenLastCalledWith(detail.client.id, "next", expect.any(AbortSignal));
  });
});
