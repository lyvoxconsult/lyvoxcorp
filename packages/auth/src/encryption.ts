import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ENVELOPE_VERSION = "v1";
const IV_BYTES = 12;
const AUTH_TAG_BYTES = 16;

function decodeEncryptionKey(keyBase64: string): Buffer {
  if (!/^[A-Za-z\d+/]{43}=$/u.test(keyBase64)) throw new Error("Invalid encryption key");
  const key = Buffer.from(keyBase64, "base64");
  if (key.length !== 32 || key.toString("base64") !== keyBase64) throw new Error("Invalid encryption key");
  return key;
}

function decodeBase64UrlPart(value: string): Buffer {
  if (value.length === 0 || !/^[A-Za-z\d_-]+$/u.test(value)) throw new Error("Invalid encrypted envelope");
  const decoded = Buffer.from(value, "base64url");
  if (decoded.toString("base64url") !== value) throw new Error("Invalid encrypted envelope");
  return decoded;
}

export function encryptSecret(plaintext: string, keyBase64: string, aad?: string): string {
  if (plaintext.length === 0) throw new Error("Secret must not be empty");
  const key = decodeEncryptionKey(keyBase64);
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key, iv, { authTagLength: AUTH_TAG_BYTES });
  if (aad !== undefined) cipher.setAAD(Buffer.from(aad, "utf8"));
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [ENVELOPE_VERSION, iv.toString("base64url"), ciphertext.toString("base64url"), tag.toString("base64url")].join(".");
}

export function decryptSecret(envelope: string, keyBase64: string, aad?: string): string {
  try {
    const key = decodeEncryptionKey(keyBase64);
    const parts = envelope.split(".");
    if (parts.length !== 4 || parts[0] !== ENVELOPE_VERSION) throw new Error("Invalid encrypted envelope");
    const iv = decodeBase64UrlPart(parts[1] ?? "");
    const ciphertext = decodeBase64UrlPart(parts[2] ?? "");
    const tag = decodeBase64UrlPart(parts[3] ?? "");
    if (iv.length !== IV_BYTES || tag.length !== AUTH_TAG_BYTES) throw new Error("Invalid encrypted envelope");

    const decipher = createDecipheriv("aes-256-gcm", key, iv, { authTagLength: AUTH_TAG_BYTES });
    if (aad !== undefined) decipher.setAAD(Buffer.from(aad, "utf8"));
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch {
    throw new Error("Unable to decrypt secret");
  }
}
