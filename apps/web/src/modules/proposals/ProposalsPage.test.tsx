import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProposalsPage } from "./ProposalsPage.js";

vi.mock("./proposals-api.js", () => ({
  fetchProposals: vi.fn().mockResolvedValue([
    {
      id: "prop-1",
      clientId: "123e4567-e89b-12d3-a456-426614174000",
      clientName: "Empresa Alfa LTDA",
      status: "DRAFT",
      validUntil: "2026-12-31",
      subtotal: "1500.00",
      discount: "100.00",
      total: "1400.00",
      createdAt: "2026-07-22T10:00:00Z",
    },
  ]),
  createProposal: vi.fn(),
  approveProposal: vi.fn(),
  convertProposalToContract: vi.fn(),
}));

describe("ProposalsPage", () => {
  it("renders proposals list correctly", async () => {
    render(<ProposalsPage />);

    await waitFor(() => {
      expect(screen.getByText("Propostas Comerciais")).toBeInTheDocument();
      expect(screen.getByText("Empresa Alfa LTDA")).toBeInTheDocument();
      expect(screen.getByText("R$ 1400.00")).toBeInTheDocument();
      expect(screen.getByText("Aprovar (FR-062)")).toBeInTheDocument();
    });
  });
});
