import { randomBytes } from "node:crypto";
import { argon2Verify, argon2id } from "hash-wasm";

export const ARGON2ID_OPTIONS = Object.freeze({
  type: "argon2id",
  memoryCost: 65_536,
  timeCost: 3,
  parallelism: 1,
  hashLength: 32,
});

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

export type PasswordPolicyViolation =
  | "minimum_length"
  | "maximum_length"
  | "missing_uppercase"
  | "missing_lowercase"
  | "missing_number"
  | "missing_symbol";

export interface PasswordPolicyResult {
  valid: boolean;
  violations: PasswordPolicyViolation[];
}

export function evaluatePasswordPolicy(password: string): PasswordPolicyResult {
  const violations: PasswordPolicyViolation[] = [];

  const characterLength = Array.from(password).length;
  if (characterLength < PASSWORD_MIN_LENGTH) violations.push("minimum_length");
  if (characterLength > PASSWORD_MAX_LENGTH) violations.push("maximum_length");
  if (!/\p{Lu}/u.test(password)) violations.push("missing_uppercase");
  if (!/\p{Ll}/u.test(password)) violations.push("missing_lowercase");
  if (!/\p{N}/u.test(password)) violations.push("missing_number");
  if (!/[^\p{L}\p{N}\s]/u.test(password)) violations.push("missing_symbol");

  return { valid: violations.length === 0, violations };
}

export async function hashPassword(password: string): Promise<string> {
  if (!evaluatePasswordPolicy(password).valid) {
    throw new Error("Password does not satisfy the configured policy");
  }

  return argon2id({
    password,
    salt: randomBytes(16),
    parallelism: ARGON2ID_OPTIONS.parallelism,
    iterations: ARGON2ID_OPTIONS.timeCost,
    memorySize: ARGON2ID_OPTIONS.memoryCost,
    hashLength: ARGON2ID_OPTIONS.hashLength,
    outputType: "encoded",
  });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  if (!hash.startsWith("$argon2id$")) return false;
  try {
    return await argon2Verify({ hash, password });
  } catch {
    return false;
  }
}

export async function hashSecretWithArgon2id(secret: string): Promise<string> {
  if (secret.length === 0) throw new Error("Secret must not be empty");
  return argon2id({
    password: secret,
    salt: randomBytes(16),
    parallelism: ARGON2ID_OPTIONS.parallelism,
    iterations: ARGON2ID_OPTIONS.timeCost,
    memorySize: ARGON2ID_OPTIONS.memoryCost,
    hashLength: ARGON2ID_OPTIONS.hashLength,
    outputType: "encoded",
  });
}

export async function verifyArgon2idSecret(hash: string, secret: string): Promise<boolean> {
  if (!hash.startsWith("$argon2id$")) return false;
  try {
    return await argon2Verify({ hash, password: secret });
  } catch {
    return false;
  }
}
