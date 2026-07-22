import { beforeEach, describe, expect, it, vi } from "vitest";
import { acceptCsrfToken, apiRequest, resetApiSession } from "../lib/api-client";
import { activateMfa, completeMfa, login, setupMfa } from "./auth-api";

vi.mock("../lib/api-client", () => ({ apiRequest: vi.fn(), acceptCsrfToken: vi.fn(), resetApiSession: vi.fn() }));
const request = vi.mocked(apiRequest);

describe("auth API", () => {
  beforeEach(() => vi.clearAllMocks());
  it("clears stale in-memory state and accepts authenticated CSRF", async () => {
    request.mockResolvedValue({ userId: "u", csrfToken: "csrf", expiresAt: "later" });
    await login("u@example.com", "password");
    expect(resetApiSession).toHaveBeenCalled(); expect(acceptCsrfToken).toHaveBeenCalledWith("csrf");
  });
  it("handles MFA proof, setup and activation", async () => {
    request.mockResolvedValueOnce({ userId: "u", csrfToken: "csrf", expiresAt: "later" })
      .mockResolvedValueOnce({ secret: "secret", otpauthUri: "otpauth://value" })
      .mockResolvedValueOnce({ userId: "u", csrfToken: "next", expiresAt: "later", backupCodes: ["backup"] });
    await completeMfa("challenge", { code: "123456" });
    await setupMfa("challenge");
    await activateMfa("challenge", "123456");
    expect(request.mock.calls.map((call) => call[0])).toEqual(["/auth/mfa/challenge", "/auth/mfa/setup", "/auth/mfa/activate"]);
    expect(acceptCsrfToken).toHaveBeenLastCalledWith("next");
  });
});
