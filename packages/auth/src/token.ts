import { createHash, randomBytes } from "node:crypto";

export const OPAQUE_TOKEN_BYTES = 64;

export function generateOpaqueToken(): string {
  return randomBytes(OPAQUE_TOKEN_BYTES).toString("base64url");
}

export function hashOpaqueToken(token: string): string {
  if (token.length === 0) throw new Error("Token must not be empty");
  return createHash("sha256").update(token, "utf8").digest("hex");
}
