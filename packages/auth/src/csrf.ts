import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const CSRF_TOKEN_BYTES = 32;

export function generateCsrfToken(): string {
  return randomBytes(CSRF_TOKEN_BYTES).toString("base64url");
}

export function hashCsrfToken(token: string): string {
  if (token.length === 0) throw new Error("CSRF token must not be empty");
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function verifyCsrfToken(token: string, expectedHash: string): boolean {
  const actual = createHash("sha256").update(token, "utf8").digest();
  const normalizedHash = /^[a-f\d]{64}$/iu.test(expectedHash)
    ? Buffer.from(expectedHash, "hex")
    : Buffer.alloc(actual.length);
  const matches = timingSafeEqual(actual, normalizedHash);

  return normalizedHash.length === actual.length && /^[a-f\d]{64}$/iu.test(expectedHash) && matches;
}
