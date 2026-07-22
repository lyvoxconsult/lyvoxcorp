import { describe, expect, it } from "vitest";
import { parseLeadCsv } from "./ImportLeadsDialog";

describe("parseLeadCsv", () => {
  it("parses BOM, CRLF, quoted commas, newlines and escaped quotes with original row numbers", () => {
    const result = parseLeadCsv('\uFEFFname,company\r\n"Maria ""M.""","Empresa,\r\nGlobal"\r\nJoão,Acme');
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ row: 2, input: { name: 'Maria "M."', company: "Empresa,\r\nGlobal" } });
    expect(result[1]).toMatchObject({ row: 4, input: { name: "João", company: "Acme" } });
  });
  it("rejects malformed, duplicate and unknown headers", () => {
    expect(parseLeadCsv('name,company\n"Lead,Acme')[0]?.error).toMatch(/Aspas/);
    expect(parseLeadCsv("name,name\nA,B")[0]?.error).toMatch(/duplicados/);
    expect(parseLeadCsv("name,unexpected\nA,B")[0]?.error).toMatch(/desconhecidos/);
    expect(parseLeadCsv("name,company\nA,B,C")[0]?.error).toMatch(/colunas inválida/);
  });
  it("rejects files over 500 data rows without silently truncating", () => {
    const csv = ["name", ...Array.from({ length: 501 }, (_, index) => `Lead ${index}`)].join("\n");
    expect(parseLeadCsv(csv)).toEqual([{ row: 1, error: "O arquivo contém 501 linhas; o limite é 500." }]);
  });
});
