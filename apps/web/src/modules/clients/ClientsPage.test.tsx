import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSession } from "../../auth/session-context";
import { listClients, listResponsibles } from "./client-api";
import { ClientsPage } from "./ClientsPage";

vi.mock("../../auth/session-context", () => ({ useSession: vi.fn() }));
vi.mock("./client-api", async () => ({ listClients: vi.fn(), listResponsibles: vi.fn(), createClient: vi.fn(), archiveClient: vi.fn() }));
const mockedList = vi.mocked(listClients);
const mockedResponsibles = vi.mocked(listResponsibles);

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}><MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><ClientsPage /></MemoryRouter></QueryClientProvider>);
}

describe("ClientsPage", () => {
  beforeEach(() => {
    vi.mocked(useSession).mockReturnValue({ user: { id: "u", email: "u@example.com", fullName: "User", passwordChangeRequired: false, mfaVerified: true }, grants: [], loading: false, error: null, can: () => true, retry: vi.fn() });
    mockedResponsibles.mockResolvedValue([]);
  });
  it("renders real paginated client data and accessible controls", async () => {
    mockedList.mockResolvedValue({ data: [{ id: "11111111-1111-4111-8111-111111111111", type: "PJ", name: "Acme", tradeName: "Acme", document: "11222333000181", email: "contato@acme.com", status: "ACTIVE", tags: [], responsibles: [], version: 1, createdAt: "2026-07-22T12:00:00Z", updatedAt: "2026-07-22T12:00:00Z" }], meta: { pageSize: 20, hasMore: false, nextCursor: null } });
    renderPage();
    expect(await screen.findByRole("link", { name: "Acme" })).toHaveAttribute("href", "/app/clientes/11111111-1111-4111-8111-111111111111");
    expect(screen.getByRole("region", { name: "Lista de clientes" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Novo cliente" })).toBeVisible();
  });
  it("distinguishes the empty database state", async () => {
    mockedList.mockResolvedValue({ data: [], meta: { pageSize: 20, hasMore: false, nextCursor: null } });
    renderPage(); expect(await screen.findByRole("region", { name: "Nenhum cliente cadastrado" })).toBeVisible();
  });
});
