import { describe, expect, it } from "vitest";
import { createProposalSchema, convertProposalToContractSchema } from "./proposals.js";

describe("Proposals Validation Schemas", () => {
  it("validates a valid proposal payload", () => {
    const payload = {
      clientId: "123e4567-e89b-12d3-a456-426614174000",
      validUntil: "2026-12-31",
      discount: 50.0,
      items: [
        {
          description: "Desenvolvimento Frontend",
          quantity: 40,
          unitPrice: 150.0,
          discount: 0,
        },
      ],
    };

    const result = createProposalSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("rejects proposal without items", () => {
    const payload = {
      clientId: "123e4567-e89b-12d3-a456-426614174000",
      validUntil: "2026-12-31",
      items: [],
    };

    const result = createProposalSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("validates contract conversion payload", () => {
    const payload = {
      number: "CTR-2026-001",
      startsOn: "2026-08-01",
      endsOn: "2027-08-01",
    };

    const result = convertProposalToContractSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });
});
