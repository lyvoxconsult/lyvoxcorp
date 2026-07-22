import { z } from "zod";

export type PersonType = "PF" | "PJ";

export function normalizePersonDocument(value: string): string {
  return value.replace(/\D/gu, "");
}

function checkDigits(document: string, factors: readonly number[]): number {
  const sum = factors.reduce((total, factor, index) => total + Number(document[index]) * factor, 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCpf(value: string): boolean {
  const document = normalizePersonDocument(value);
  if (!/^\d{11}$/u.test(document) || /^(\d)\1{10}$/u.test(document)) return false;
  const first = checkDigits(document, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = checkDigits(document, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return document.endsWith(`${first}${second}`);
}

export function isValidCnpj(value: string): boolean {
  const document = normalizePersonDocument(value);
  if (!/^\d{14}$/u.test(document) || /^(\d)\1{13}$/u.test(document)) return false;
  const first = checkDigits(document, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = checkDigits(document, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return document.endsWith(`${first}${second}`);
}

export function isValidPersonDocument(type: PersonType, value: string): boolean {
  return type === "PF" ? isValidCpf(value) : isValidCnpj(value);
}

export const cpfSchema = z.string().transform(normalizePersonDocument).refine(isValidCpf, "Invalid CPF");
export const cnpjSchema = z.string().transform(normalizePersonDocument).refine(isValidCnpj, "Invalid CNPJ");
export const personDocumentSchema = z.string().max(20).transform(normalizePersonDocument)
  .refine((value) => isValidCpf(value) || isValidCnpj(value), "Invalid CPF or CNPJ");
