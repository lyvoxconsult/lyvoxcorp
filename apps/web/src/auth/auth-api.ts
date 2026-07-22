import { acceptCsrfToken, apiRequest, resetApiSession } from "../lib/api-client";

type Authenticated = { userId: string; csrfToken: string; expiresAt: string };
export type LoginResult = Authenticated | { status: "MFA_REQUIRED" | "MFA_ENROLLMENT_REQUIRED"; challengeToken: string; expiresAt: string };

export async function login(email: string, password: string): Promise<LoginResult> {
  resetApiSession();
  const result = await apiRequest<LoginResult>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  if ("csrfToken" in result) acceptCsrfToken(result.csrfToken);
  return result;
}

export async function completeMfa(challengeToken: string, proof: { code?: string; backupCode?: string }): Promise<Authenticated> {
  const result = await apiRequest<Authenticated>("/auth/mfa/challenge", { method: "POST", body: JSON.stringify({ challengeToken, ...proof }) });
  acceptCsrfToken(result.csrfToken);
  return result;
}

export function setupMfa(challengeToken: string): Promise<{ secret: string; otpauthUri: string }> {
  return apiRequest("/auth/mfa/setup", { method: "POST", body: JSON.stringify({ challengeToken }) });
}

export async function activateMfa(challengeToken: string, code: string): Promise<Authenticated & { backupCodes: string[] }> {
  const result = await apiRequest<Authenticated & { backupCodes: string[] }>("/auth/mfa/activate", { method: "POST", body: JSON.stringify({ challengeToken, code }) });
  acceptCsrfToken(result.csrfToken);
  return result;
}
