import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { listResponsibles } from "./client-api";
import { ClientForm } from "./ClientForm";
import type { ClientDetail } from "./client-types";

vi.mock("./client-api", () => ({ listResponsibles: vi.fn() }));

describe("ClientForm", () => {
  it("adapts PF/PJ labels and blocks an invalid shared-schema submission", async () => {
    vi.mocked(listResponsibles).mockResolvedValue([]);
    const submit = vi.fn();
    const user = userEvent.setup();
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><ClientForm onSubmit={submit} onCancel={vi.fn()} /></QueryClientProvider>);
    expect(screen.getByRole("textbox", { name: "Razão social" })).toBeVisible();
    await user.selectOptions(screen.getByLabelText("Tipo de cliente"), "PF");
    expect(screen.getByRole("textbox", { name: "Nome completo" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Cadastrar cliente" }));
    expect(await screen.findByText("Revise os dados informados.")).toBeVisible();
    expect(submit).not.toHaveBeenCalled();
  });
  it("submits normalized persisted data and manages dynamic contacts", async () => {
    vi.mocked(listResponsibles).mockResolvedValue([{ id: "22222222-2222-4222-8222-222222222222", fullName: "Responsável" }]);
    const existing: ClientDetail = {
      id: "11111111-1111-4111-8111-111111111111", type: "PF", name: "Maria", document: "52998224725", email: "maria@example.com", status: "ACTIVE", version: 1,
      tradeName: null, createdAt: "2026-07-22T12:00:00Z", updatedAt: "2026-07-22T12:00:00Z", tags: ["VIP"], responsibles: [],
      address: { id: "33333333-3333-4333-8333-333333333333", label: "PRIMARY", postalCode: "01001000", street: "Praça", number: "1", district: "Centro", city: "São Paulo", state: "SP", country: "BR" }, contacts: [],
    };
    const submit = vi.fn().mockResolvedValue(undefined); const user = userEvent.setup();
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><ClientForm client={existing} onSubmit={submit} onCancel={vi.fn()} /></QueryClientProvider>);
    await user.click(screen.getByRole("button", { name: "Adicionar contato" }));
    await user.type(screen.getByRole("textbox", { name: "Identificação" }), "Celular");
    await user.type(screen.getByRole("textbox", { name: "Contato" }), "11999999999");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));
    await waitFor(() => expect(submit).toHaveBeenCalledWith(expect.objectContaining({ document: "52998224725", tags: ["VIP"], contacts: [expect.objectContaining({ value: "11999999999" })] })));
  });
});
