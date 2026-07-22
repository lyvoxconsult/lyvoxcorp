import { describe, expect, it, vi } from "vitest";
import { ProposalsController } from "./proposals.controller.js";
import type { ProposalsService } from "./proposals.service.js";
import type { AuthService } from "../auth/auth.service.js";

describe("ProposalsController", () => {
  const mockProposalsService = {
    listProposals: vi.fn().mockResolvedValue([
      {
        id: "prop-123",
        clientId: "client-123",
        clientName: "Cliente Exemplo",
        status: "DRAFT",
        validUntil: "2026-12-31",
        subtotal: "1000.00",
        discount: "100.00",
        total: "900.00",
      },
    ]),
    getProposalById: vi.fn(),
    createProposal: vi.fn(),
    updateProposal: vi.fn(),
    approveProposal: vi.fn().mockResolvedValue({ id: "prop-123", status: "APPROVED" }),
    convertToContract: vi.fn(),
  } as unknown as ProposalsService;

  const mockAuthService = {
    verifyCsrf: vi.fn().mockResolvedValue(true),
  } as unknown as AuthService;

  const controller = new ProposalsController(mockProposalsService, mockAuthService);

  it("lists proposals", async () => {
    const result = await controller.list();
    expect(result).toHaveLength(1);
    expect(mockProposalsService.listProposals).toHaveBeenCalled();
  });

  it("approves proposal internally (FR-062)", async () => {
    const req = { headers: { "x-csrf-token": "valid" } } as any;
    const result = await controller.approve(req, "123e4567-e89b-12d3-a456-426614174000");
    expect(result.status).toBe("APPROVED");
    expect(mockProposalsService.approveProposal).toHaveBeenCalledWith("123e4567-e89b-12d3-a456-426614174000", undefined);
  });
});
