import { createLeadSchema, type CreateLeadInput, type LeadImportResponse } from "@lyvox/validation";
import { useState, type ChangeEvent, type RefObject } from "react";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";

export type LeadCsvPreview = { row: number; input?: CreateLeadInput; error?: string };
type CsvRow = { row: number; values: string[] };
const MAX_FILE_BYTES = 1_000_000;
const HEADERS = ["name", "email", "phone", "company", "estimatedValue", "source", "stageId", "responsibleId"];

function csvRows(text: string): CsvRow[] {
  const rows: CsvRow[] = []; let values: string[] = []; let field = ""; let quoted = false; let physicalRow = 1; let rowStart = 1;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]!; const next = text[index + 1];
    if (char === '"') { if (quoted && next === '"') { field += '"'; index += 1; } else quoted = !quoted; }
    else if (char === "," && !quoted) { values.push(field); field = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) { if (char === "\r" && next === "\n") index += 1; values.push(field); if (values.some((value) => value.trim())) rows.push({ row: rowStart, values }); values = []; field = ""; physicalRow += 1; rowStart = physicalRow; }
    else { field += char; if ((char === "\n" || char === "\r") && quoted) { if (char === "\r" && next === "\n") { field += next; index += 1; } physicalRow += 1; } }
  }
  if (quoted) throw new Error("Aspas não foram fechadas no CSV.");
  values.push(field); if (values.some((value) => value.trim())) rows.push({ row: rowStart, values }); return rows;
}

export function parseLeadCsv(text: string): LeadCsvPreview[] {
  try {
    const [header, ...rows] = csvRows(text.replace(/^\uFEFF/u, "")); const keys = header?.values.map((value) => value.trim()) ?? [];
    if (!keys.includes("name")) return [{ row: 1, error: "Cabeçalho obrigatório ausente: name" }];
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index); if (duplicates.length) return [{ row: 1, error: `Cabeçalhos duplicados: ${[...new Set(duplicates)].join(", ")}` }];
    const unknown = keys.filter((key) => !HEADERS.includes(key)); if (unknown.length) return [{ row: 1, error: `Cabeçalhos desconhecidos: ${unknown.join(", ")}` }];
    if (rows.length > 500) return [{ row: 1, error: `O arquivo contém ${rows.length} linhas; o limite é 500.` }];
    return rows.map(({ row, values }) => {
      if (values.length !== keys.length) return { row, error: `Quantidade de colunas inválida: esperado ${keys.length}, recebido ${values.length}.` };
      const raw = Object.fromEntries(keys.map((key, column) => [key, values[column]?.trim() || undefined]));
      const parsed = createLeadSchema.safeParse(raw);
      return parsed.success ? { row, input: parsed.data } : { row, error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") };
    });
  } catch (error) { return [{ row: 1, error: error instanceof Error ? error.message : "CSV inválido." }]; }
}

export function ImportLeadsDialog({ open, triggerRef, onClose, onSubmit }: { open: boolean; triggerRef?: RefObject<HTMLElement | null>; onClose: () => void; onSubmit: (rows: Array<{ row: number; data: CreateLeadInput }>) => Promise<LeadImportResponse> }) {
  const [preview, setPreview] = useState<LeadCsvPreview[]>([]); const [busy, setBusy] = useState(false); const [result, setResult] = useState<LeadImportResponse | null>(null); const [submitError, setSubmitError] = useState("");
  const valid = preview.flatMap((item) => item.input ? [{ row: item.row, data: item.input }] : []); const hasErrors = preview.some((item) => item.error);
  async function select(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; setResult(null); setSubmitError(""); if (!file) return setPreview([]); if (file.size > MAX_FILE_BYTES) return setPreview([{ row: 1, error: "O arquivo excede o limite de 1 MB." }]); setPreview(parseLeadCsv(await file.text())); }
  return <Dialog open={open} title="Importar leads" description="Revise o CSV antes de enviar. Limite de 500 linhas e 1 MB." onClose={onClose} triggerRef={triggerRef}><div className="grid gap-5">{submitError && <p role="alert" className="text-red-300">{submitError}</p>}<div><label htmlFor="lead-csv" className="font-semibold">Arquivo CSV</label><input id="lead-csv" type="file" accept=".csv,text/csv" className="mt-2 block min-h-11 w-full" onChange={(event) => { void select(event); }} /><p className="mt-1 text-sm text-brand-100">Cabeçalhos: name, email, phone, company, estimatedValue, source, stageId, responsibleId.</p></div>{preview.length > 0 && <section aria-labelledby="import-preview"><h3 id="import-preview">Prévia</h3><p className="mt-1 text-brand-50">{valid.length} válidas · {preview.length - valid.length} com erro</p><div className="mt-3 max-h-64 overflow-auto rounded-lg border border-border-subtle"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Linha</th><th className="p-2">Lead</th><th className="p-2">Validação</th></tr></thead><tbody>{preview.map((item) => <tr key={item.row} className="border-t border-border-subtle"><td className="p-2 font-mono">{item.row}</td><td className="p-2">{item.input?.name ?? "—"}</td><td className={`p-2 ${item.error ? "text-red-300" : "text-green-300"}`}>{item.error ?? "Pronta"}</td></tr>)}</tbody></table></div></section>}{result && <p role="status" className="rounded-lg border border-border-subtle p-3">Importação concluída: {result.created.length} criados e {result.errors.length} rejeitados.</p>}<div className="flex justify-end gap-3"><Button variant="ghost" onClick={onClose}>Fechar</Button><Button disabled={!valid.length || hasErrors} loading={busy} onClick={() => { setBusy(true); setSubmitError(""); void onSubmit(valid).then(setResult).catch(() => setSubmitError("Não foi possível importar o arquivo. A prévia foi preservada.")).finally(() => setBusy(false)); }}>Importar arquivo</Button></div></div></Dialog>;
}
