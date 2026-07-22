import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export const TOTP_SECRET_BYTES = 20;
export const TOTP_STEP_SECONDS = 30;
export const TOTP_DIGITS = 6;

export interface TotpVerificationOptions {
  timestamp?: number;
  window?: number;
  stepSeconds?: number;
  digits?: number;
}

export interface TotpVerificationResult {
  valid: boolean;
  counter?: number;
}

function encodeBase32(input: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of input) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

function decodeBase32(secret: string): Buffer {
  const normalized = secret.replace(/=+$/u, "").toUpperCase();
  if (normalized.length === 0 || !/^[A-Z2-7]+$/u.test(normalized)) {
    throw new Error("Invalid TOTP secret encoding");
  }

  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const character of normalized) {
    const index = BASE32_ALPHABET.indexOf(character);
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

function normalizeOptions(options: TotpVerificationOptions = {}) {
  const timestamp = options.timestamp ?? Date.now();
  const stepSeconds = options.stepSeconds ?? TOTP_STEP_SECONDS;
  const digits = options.digits ?? TOTP_DIGITS;
  const window = options.window ?? 1;

  if (!Number.isFinite(timestamp) || timestamp < 0) throw new Error("Invalid TOTP timestamp");
  if (!Number.isSafeInteger(stepSeconds) || stepSeconds <= 0) throw new Error("Invalid TOTP step");
  if (!Number.isSafeInteger(digits) || digits < 6 || digits > 8) throw new Error("Invalid TOTP digits");
  if (!Number.isSafeInteger(window) || window < 0 || window > 10) throw new Error("Invalid TOTP window");

  return { timestamp, stepSeconds, digits, window };
}

function codeForCounter(secret: string, counter: number, digits: number): string {
  if (!Number.isSafeInteger(counter) || counter < 0) throw new Error("Invalid TOTP counter");

  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", decodeBase32(secret)).update(message).digest();
  const offset = (digest[digest.length - 1] ?? 0) & 0x0f;
  const binary = (digest.readUInt32BE(offset) & 0x7fffffff) % 10 ** digits;
  return binary.toString().padStart(digits, "0");
}

export function generateTotpSecret(): string {
  return encodeBase32(randomBytes(TOTP_SECRET_BYTES));
}

export function generateTotpCode(
  secret: string,
  options: Omit<TotpVerificationOptions, "window"> = {},
): string {
  const normalized = normalizeOptions(options);
  const counter = Math.floor(normalized.timestamp / 1_000 / normalized.stepSeconds);
  return codeForCounter(secret, counter, normalized.digits);
}

export function verifyTotpCode(
  secret: string,
  code: string,
  options: TotpVerificationOptions = {},
): TotpVerificationResult {
  const normalized = normalizeOptions(options);
  const currentCounter = Math.floor(normalized.timestamp / 1_000 / normalized.stepSeconds);
  const received = Buffer.from(code, "utf8");
  let acceptedCounter: number | undefined;

  for (let offset = -normalized.window; offset <= normalized.window; offset += 1) {
    const counter = currentCounter + offset;
    if (counter < 0) continue;
    const expected = Buffer.from(codeForCounter(secret, counter, normalized.digits), "utf8");
    const sameLength = received.length === expected.length;
    const candidate = sameLength ? received : Buffer.alloc(expected.length);
    if (timingSafeEqual(candidate, expected) && sameLength && acceptedCounter === undefined) {
      acceptedCounter = counter;
    }
  }

  return acceptedCounter === undefined ? { valid: false } : { valid: true, counter: acceptedCounter };
}

export function verifyTotpWithReplayProtection(
  secret: string,
  code: string,
  lastAcceptedCounter: number | null,
  options: TotpVerificationOptions = {},
): TotpVerificationResult {
  if (lastAcceptedCounter !== null && (!Number.isSafeInteger(lastAcceptedCounter) || lastAcceptedCounter < 0)) {
    throw new Error("Invalid last accepted TOTP counter");
  }

  const result = verifyTotpCode(secret, code, options);
  if (!result.valid || result.counter === undefined) return { valid: false };
  if (lastAcceptedCounter !== null && result.counter <= lastAcceptedCounter) return { valid: false };
  return result;
}
