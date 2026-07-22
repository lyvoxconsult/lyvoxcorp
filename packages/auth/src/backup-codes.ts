import { randomBytes } from "node:crypto";
import { hashSecretWithArgon2id, verifyArgon2idSecret } from "./password.js";

export const BACKUP_CODE_COUNT = 8;

export interface BackupCodeSet {
  codes: string[];
  hashes: string[];
}

function generateBackupCode(): string {
  const value = randomBytes(10).toString("hex").toUpperCase();
  return `${value.slice(0, 5)}-${value.slice(5, 10)}-${value.slice(10, 15)}-${value.slice(15)}`;
}

export async function hashBackupCode(code: string): Promise<string> {
  return hashSecretWithArgon2id(code);
}

export async function generateBackupCodes(): Promise<BackupCodeSet> {
  const codes = Array.from({ length: BACKUP_CODE_COUNT }, generateBackupCode);
  const hashes: string[] = [];
  for (const code of codes) hashes.push(await hashBackupCode(code));
  return { codes, hashes };
}

export async function verifyBackupCode(
  code: string,
  hashes: readonly string[],
): Promise<{ valid: boolean; matchedIndex?: number }> {
  let matchedIndex: number | undefined;
  for (let index = 0; index < hashes.length; index += 1) {
    const hash = hashes[index];
    if (hash !== undefined && (await verifyArgon2idSecret(hash, code)) && matchedIndex === undefined) {
      matchedIndex = index;
    }
  }
  return matchedIndex === undefined ? { valid: false } : { valid: true, matchedIndex };
}
