import { describe, expect, it } from "vitest";
import { changeLeadStageSchema, createLeadSchema, customizeLeadStagesSchema, importLeadsSchema } from "./crm.js";

describe("CRM contracts", () => {
  it("normalizes lead e-mail and preserves decimal money as a string", () => {
    expect(createLeadSchema.parse({ name: " Lead ", email: "LEAD@EXAMPLE.COM", estimatedValue: "1234.50" }))
      .toMatchObject({ name: "Lead", email: "lead@example.com", estimatedValue: "1234.50" });
    expect(createLeadSchema.safeParse({ name: "Lead", estimatedValue: "1.234" }).success).toBe(false);
  });

  it("requires loss reason fields as a pair", () => {
    expect(changeLeadStageSchema.safeParse({ stageId: crypto.randomUUID(), version: 1, lossReasonCode: "NO_FIT" }).success).toBe(false);
  });

  it("rejects duplicate stage ids or positions and oversized imports", () => {
    const id = crypto.randomUUID();
    expect(customizeLeadStagesSchema.safeParse({ stages: [
      { id, version: 1, name: "A", position: 1, color: "#4180ab" },
      { id: crypto.randomUUID(), version: 1, name: "B", position: 1, color: "#8ab3cf" },
    ] }).success).toBe(false);
    expect(customizeLeadStagesSchema.safeParse({ stages: [
      { id, version: 1, name: "A", position: 1, color: "#4180ab" },
      { id: crypto.randomUUID(), version: 1, name: "B", position: 3, color: "#8ab3cf" },
    ] }).success).toBe(false);
    expect(importLeadsSchema.safeParse({ rows: Array.from({ length: 501 }, (_, index) => ({ row: index + 2, data: { name: "Lead" } })) }).success).toBe(false);
  });
});
