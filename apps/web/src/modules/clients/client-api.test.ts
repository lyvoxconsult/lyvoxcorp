import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest, bootstrapCsrf } from "../../lib/api-client";
import { archiveClient, createClient, getClient, listClients, listResponsibles, updateClient } from "./client-api";

vi.mock("../../lib/api-client", () => ({ apiRequest: vi.fn(), bootstrapCsrf: vi.fn(), newIdempotencyKey: () => "11111111-1111-4111-8111-111111111111" }));
const request = vi.mocked(apiRequest);
const draft = { type: "PF" as const, name: "Maria", document: "52998224725", email: "maria@example.com", status: "ACTIVE" as const, tags: [], responsibleIds: [], contacts: [] };

describe("client API", () => {
  beforeEach(() => { request.mockReset(); vi.mocked(bootstrapCsrf).mockResolvedValue("csrf"); });
  it("serializes list filters and timeline cursor", async () => {
    request.mockResolvedValue({});
    await listClients({ search: "Maria", status: "ACTIVE", tag: "vip", cursor: "next", pageSize: 20 });
    await getClient("client id", "timeline cursor");
    expect(request.mock.calls[0]?.[0]).toContain("search=Maria");
    expect(request.mock.calls[0]?.[0]).toContain("status=ACTIVE");
    expect(request.mock.calls[1]?.[0]).toContain("client%20id?timelineCursor=timeline%20cursor");
  });
  it("protects create, update and archive mutations", async () => {
    request.mockResolvedValue({});
    await createClient(draft); await updateClient("id", draft, 3); await archiveClient("id", 3);
    expect(bootstrapCsrf).toHaveBeenCalledTimes(3);
    expect(request.mock.calls[0]?.[1]).toMatchObject({ method: "POST" });
    expect(request.mock.calls[1]?.[1]).toMatchObject({ method: "PUT" });
    expect(new Headers(request.mock.calls[2]?.[1]?.headers).get("If-Match")).toBe('"3"');
  });
  it("returns active responsible options", async () => {
    request.mockResolvedValue({ items: [{ id: "u", fullName: "User" }] });
    await expect(listResponsibles("User")).resolves.toEqual([{ id: "u", fullName: "User" }]);
  });
});
