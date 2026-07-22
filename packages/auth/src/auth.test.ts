import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  ARGON2ID_OPTIONS,
  BACKUP_CODE_COUNT,
  CSRF_TOKEN_BYTES,
  OPAQUE_TOKEN_BYTES,
  PASSWORD_MAX_LENGTH,
  TOTP_SECRET_BYTES,
  createExpiredSessionCookieOptions,
  createSessionCookieOptions,
  decryptSecret,
  encryptSecret,
  evaluatePasswordPolicy,
  generateBackupCodes,
  generateCsrfToken,
  generateOpaqueToken,
  generateTotpCode,
  generateTotpSecret,
  hashCsrfToken,
  hashOpaqueToken,
  hashPassword,
  verifyBackupCode,
  verifyCsrfToken,
  verifyPassword,
  verifyTotpCode,
  verifyTotpWithReplayProtection,
} from "./index.js";

describe("password primitives", () => {
  it("enforces the canonical password policy", () => {
    expect(evaluatePasswordPolicy("short")).toEqual({
      valid: false,
      violations: ["minimum_length", "missing_uppercase", "missing_number", "missing_symbol"],
    });
    expect(evaluatePasswordPolicy("StrongPassword1!")).toEqual({ valid: true, violations: [] });
    expect(evaluatePasswordPolicy(`Strong1!${"x".repeat(PASSWORD_MAX_LENGTH)}`).violations).toContain(
      "maximum_length",
    );
  });

  it("uses the pinned Argon2id cost and verifies without throwing on malformed hashes", async () => {
    expect(ARGON2ID_OPTIONS).toMatchObject({ memoryCost: 65_536, timeCost: 3, parallelism: 1 });
    const hash = await hashPassword("StrongPassword1!");
    expect(hash).toMatch(/^\$argon2id\$v=19\$m=65536,t=3,p=1\$/u);
    await expect(verifyPassword(hash, "StrongPassword1!")).resolves.toBe(true);
    await expect(verifyPassword(hash, "WrongPassword1!")).resolves.toBe(false);
    await expect(verifyPassword("invalid", "StrongPassword1!")).resolves.toBe(false);
  });
});

describe("opaque and CSRF tokens", () => {
  it("creates a 64-byte opaque token and hashes it with SHA-256", () => {
    const token = generateOpaqueToken();
    expect(Buffer.from(token, "base64url")).toHaveLength(OPAQUE_TOKEN_BYTES);
    expect(hashOpaqueToken(token)).toMatch(/^[a-f\d]{64}$/u);
    expect(hashOpaqueToken(token)).toBe(hashOpaqueToken(token));
  });

  it("creates and compares CSRF token hashes safely", () => {
    const token = generateCsrfToken();
    const hash = hashCsrfToken(token);
    expect(Buffer.from(token, "base64url")).toHaveLength(CSRF_TOKEN_BYTES);
    expect(verifyCsrfToken(token, hash)).toBe(true);
    expect(verifyCsrfToken(`${token}x`, hash)).toBe(false);
    expect(verifyCsrfToken(token, "malformed")).toBe(false);
  });
});

describe("TOTP", () => {
  it("implements the RFC 6238 SHA-1 test vector", () => {
    const secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
    expect(generateTotpCode(secret, { timestamp: 59_000, digits: 8 })).toBe("94287082");
  });

  it("generates 160-bit secrets and rejects replayed counters", () => {
    const secret = generateTotpSecret();
    expect(secret).toMatch(/^[A-Z2-7]+$/u);
    expect(secret).toHaveLength((TOTP_SECRET_BYTES * 8) / 5);
    const timestamp = 1_800_000;
    const code = generateTotpCode(secret, { timestamp });
    const first = verifyTotpWithReplayProtection(secret, code, null, { timestamp, window: 0 });
    expect(first.valid).toBe(true);
    expect(first.counter).toBeDefined();
    expect(verifyTotpCode(secret, "000000", { timestamp, window: 0 }).valid).toBe(false);
    expect(verifyTotpWithReplayProtection(secret, code, first.counter ?? null, { timestamp, window: 0 })).toEqual({
      valid: false,
    });
  });
});

describe("AES-256-GCM secret encryption", () => {
  it("round-trips with authenticated associated data and rejects tampering", () => {
    const key = randomBytes(32).toString("base64");
    const envelope = encryptSecret("sensitive-value", key, "user-id");
    expect(envelope).toMatch(/^v1\./u);
    expect(decryptSecret(envelope, key, "user-id")).toBe("sensitive-value");
    const parts = envelope.split(".");
    const tag = parts[3] ?? "";
    parts[3] = `${tag.startsWith("A") ? "B" : "A"}${tag.slice(1)}`;
    expect(() => decryptSecret(parts.join("."), key, "user-id")).toThrow("Unable to decrypt secret");
    expect(() => decryptSecret(envelope, key, "different-user")).toThrow("Unable to decrypt secret");
  });

  it("requires a canonical 32-byte base64 key", () => {
    expect(() => encryptSecret("value", randomBytes(31).toString("base64"))).toThrow("Invalid encryption key");
  });
});

describe("backup codes", () => {
  it("creates exactly eight unique codes with Argon2id hashes and verifies their index", async () => {
    const set = await generateBackupCodes();
    expect(set.codes).toHaveLength(BACKUP_CODE_COUNT);
    expect(set.hashes).toHaveLength(BACKUP_CODE_COUNT);
    expect(new Set(set.codes).size).toBe(BACKUP_CODE_COUNT);
    expect(set.hashes.every((hash) => hash.startsWith("$argon2id$"))).toBe(true);
    await expect(verifyBackupCode(set.codes[3] ?? "", set.hashes)).resolves.toEqual({ valid: true, matchedIndex: 3 });
    await expect(verifyBackupCode("invalid-backup-code", set.hashes)).resolves.toEqual({ valid: false });
  }, 30_000);
});

describe("cookie policy", () => {
  it("enables Secure outside local environments and always uses HttpOnly/Lax", () => {
    expect(createSessionCookieOptions("development", 3_600)).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 3_600,
    });
    expect(createSessionCookieOptions("production")).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
    expect(createExpiredSessionCookieOptions("production")).toMatchObject({
      httpOnly: true,
      secure: true,
      maxAge: 0,
      expires: new Date(0),
    });
  });
});
