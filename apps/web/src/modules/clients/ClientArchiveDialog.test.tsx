import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { archiveClient } from "./client-api";
import { ClientArchiveDialog } from "./ClientArchiveDialog";
import type { Client } from "./client-types";

vi.mock("./client-api", () => ({ archiveClient: vi.fn() }));

describe("ClientArchiveDialog", () => {
  it("archives with the current version and closes after invalidation", async () => {
    vi.mocked(archiveClient).mockResolvedValue(); const close = vi.fn(); const archived = vi.fn(); const user = userEvent.setup();
    const clientData: Client = { id: "11111111-1111-4111-8111-111111111111", type: "PF", name: "Maria", tradeName: null, document: "52998224725", email: "maria@example.com", status: "ACTIVE", tags: [], responsibles: [], version: 3, createdAt: "2026-07-22T12:00:00Z", updatedAt: "2026-07-22T12:00:00Z" };
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    render(<QueryClientProvider client={client}><ClientArchiveDialog client={clientData} open onClose={close} onArchived={archived} /></QueryClientProvider>);
    await user.click(screen.getByRole("button", { name: "Arquivar cliente" }));
    expect(archiveClient).toHaveBeenCalledWith(clientData.id, 3); expect(close).toHaveBeenCalled(); expect(archived).toHaveBeenCalled();
  });
});
