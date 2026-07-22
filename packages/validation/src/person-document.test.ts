import { describe, expect, it } from "vitest";
import { cnpjSchema, cpfSchema, isValidCnpj, isValidCpf, isValidPersonDocument, normalizePersonDocument } from "./person-document.js";

describe("person document validation", () => {
  it("normalizes and validates CPF check digits", () => {
    expect(normalizePersonDocument("529.982.247-25")).toBe("52998224725");
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("529.982.247-24")).toBe(false);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(cpfSchema.parse("529.982.247-25")).toBe("52998224725");
  });

  it("validates CNPJ and rejects cross-type documents", () => {
    expect(isValidCnpj("04.252.011/0001-10")).toBe(true);
    expect(isValidCnpj("04.252.011/0001-11")).toBe(false);
    expect(isValidCnpj("00.000.000/0000-00")).toBe(false);
    expect(cnpjSchema.parse("04.252.011/0001-10")).toBe("04252011000110");
    expect(isValidPersonDocument("PF", "04.252.011/0001-10")).toBe(false);
  });
});
