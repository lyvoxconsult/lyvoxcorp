import { afterEach, describe, expect, it, vi } from "vitest";
import { apiRequest, loadSession, resetApiSession } from "./api-client";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

describe("apiClient", () => {
  afterEach(() => { resetApiSession(); vi.unstubAllGlobals(); });

  it("loads live session and bootstraps CSRF only in memory", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json({ id: "user-1", email: "user@example.com", fullName: "User", passwordChangeRequired: false, mfaVerified: true, grants: [{ permission: "clients.read", scope: "ALL" }] }))
      .mockResolvedValueOnce(json({ csrfToken: "csrf-value" }))
      .mockResolvedValueOnce(json({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    const session = await loadSession();
    await apiRequest("/clientes/id", { method: "PUT", body: "{}" });

    expect(session?.grants).toEqual([{ permission: "clients.read", scope: "ALL" }]);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/v1/auth/me");
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/api/v1/auth/csrf");
    const mutation = fetchMock.mock.calls[2]?.[1] as RequestInit;
    expect(mutation.credentials).toBe("include");
    expect(new Headers(mutation.headers).get("X-CSRF-Token")).toBe("csrf-value");
    expect(new Headers(mutation.headers).get("X-Correlation-ID")).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u);
  });

  it("maps an expired session to an unauthenticated state", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({ detail: "Authentication required", code: "UNAUTHORIZED" }, 401)));
    await expect(loadSession()).resolves.toBeNull();
  });
});
