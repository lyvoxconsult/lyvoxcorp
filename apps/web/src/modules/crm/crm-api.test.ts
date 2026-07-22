import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest, bootstrapCsrf } from "../../lib/api-client";
import { changeLeadStage, createFollowup, createLead, customizeStages, importLeads, listPipeline } from "./crm-api";

vi.mock("../../lib/api-client", () => ({ apiRequest: vi.fn(), bootstrapCsrf: vi.fn(), newIdempotencyKey: () => "11111111-1111-4111-8111-111111111111" }));
const request = vi.mocked(apiRequest);

describe("CRM API", () => {
  beforeEach(() => { request.mockReset(); request.mockResolvedValue({}); vi.mocked(bootstrapCsrf).mockResolvedValue("csrf"); });
  it("serializes pipeline filters", async () => {
    await listPipeline({ search: "Acme", stageId: "11111111-1111-4111-8111-111111111111", responsibleId: "22222222-2222-4222-8222-222222222222", cursor: "next", pageSize: 100 });
    expect(request.mock.calls[0]?.[0]).toContain("search=Acme"); expect(request.mock.calls[0]?.[0]).toContain("cursor=next");
  });
  it("protects every mutation and sends concurrency versions", async () => {
    await createLead({ name: "Lead" });
    await changeLeadStage("lead", { stageId: "11111111-1111-4111-8111-111111111111", version: 2 });
    await createFollowup("lead", { type: "CALL", dueAt: "2026-08-01T12:00:00.000Z" });
    await importLeads({ rows: [{ row: 2, data: { name: "Lead" } }] });
    await customizeStages({ stages: [{ name: "Nova", position: 1, color: "#64748b" }] });
    expect(bootstrapCsrf).toHaveBeenCalledTimes(5);
    expect(JSON.parse(String(request.mock.calls[1]?.[1]?.body))).toMatchObject({ version: 2 });
    expect(new Headers(request.mock.calls[4]?.[1]?.headers).get("Idempotency-Key")).toBeTruthy();
  });
});
