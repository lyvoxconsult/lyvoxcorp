import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, ChevronLeft, ChevronRight, Eye, Plus, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Can } from "../../auth/Can";
import { useSession } from "../../auth/session-context";
import { NoResults, PageError, PageLoading } from "../../components/feedback/PageState";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { Input } from "../../components/ui/Input";
import { ApiProblem } from "../../lib/api-client";
import { ClientArchiveDialog } from "./ClientArchiveDialog";
import { ClientForm } from "./ClientForm";
import { createClient, listClients } from "./client-api";
import type { Client, ClientStatus } from "./client-types";
import { sanitizeListFilters } from "./client-validation";

const statuses: Record<ClientStatus, { label: string; tone: "success" | "neutral" | "warning" }> = {
  ACTIVE: { label: "Ativo", tone: "success" },
  INACTIVE: { label: "Inativo", tone: "neutral" },
  CHURNED: { label: "Churned", tone: "warning" },
};

function useDebounced(value: string, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => { const timer = window.setTimeout(() => setDebounced(value), delay); return () => window.clearTimeout(timer); }, [delay, value]);
  return debounced;
}

function ClientRows({ clients, onArchive }: { clients: Client[]; onArchive: (client: Client, trigger: HTMLButtonElement) => void }) {
  return <tbody>{clients.map((client) => <tr key={client.id} className="border-t border-border-subtle align-top">
    <td className="px-4 py-3"><Link className="font-semibold text-white underline-offset-4 hover:underline" to={`/app/clientes/${client.id}`}>{client.name}</Link><p className="mt-1 text-sm text-brand-100">{client.type === "PJ" ? "Pessoa jurídica" : "Pessoa física"}</p></td>
    <td className="px-4 py-3 font-mono text-sm text-brand-50">{client.document}</td>
    <td className="px-4 py-3 text-brand-50">{client.email}</td>
    <td className="px-4 py-3"><Badge tone={statuses[client.status].tone}>{statuses[client.status].label}</Badge></td>
    <td className="px-4 py-3 text-brand-50">{client.responsibles.length ? client.responsibles.map((item) => item.fullName).join(", ") : "Sem responsável"}</td>
    <td className="px-4 py-3"><div className="flex gap-1"><Link className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-brand-subtle hover:bg-surface-muted" aria-label={`Ver ${client.name}`} to={`/app/clientes/${client.id}`}><Eye aria-hidden="true" className="h-4 w-4" /></Link><Can permission="clients.archive"><Button variant="ghost" className="px-3" aria-label={`Arquivar ${client.name}`} onClick={(event) => onArchive(client, event.currentTarget)}><Archive aria-hidden="true" className="h-4 w-4" /></Button></Can></div></td>
  </tr>)}</tbody>;
}

export function ClientsPage() {
  const session = useSession();
  const queryClient = useQueryClient();
  const createTriggerRef = useRef<HTMLButtonElement>(null);
  const archiveTriggerRef = useRef<HTMLElement | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Client | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ClientStatus | "">("");
  const [tag, setTag] = useState("");
  const [cursor, setCursor] = useState<string | undefined>();
  const [cursorHistory, setCursorHistory] = useState<Array<string | undefined>>([]);
  const debouncedSearch = useDebounced(search);
  const debouncedTag = useDebounced(tag);
  useEffect(() => { setCursor(undefined); setCursorHistory([]); }, [debouncedSearch, debouncedTag, status]);
  const filters = sanitizeListFilters({ search: debouncedSearch || undefined, status: status || undefined, tag: debouncedTag || undefined, cursor, pageSize: 20 });
  const query = useQuery({ queryKey: ["clients", filters], queryFn: ({ signal }) => listClients(filters, signal), placeholderData: keepPreviousData });
  const createMutation = useMutation({ mutationFn: createClient, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["clients"] }); setCreateOpen(false); } });
  const filtered = Boolean(debouncedSearch || status || debouncedTag);

  function nextPage() {
    if (!query.data?.meta.nextCursor) return;
    setCursorHistory((history) => [...history, cursor]);
    setCursor(query.data.meta.nextCursor);
  }
  function previousPage() {
    setCursorHistory((history) => { const copy = [...history]; setCursor(copy.pop()); return copy; });
  }

  return <section aria-labelledby="clients-title" className="grid gap-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-caption uppercase tracking-[0.2em] text-brand-100">Relacionamento</p><h1 id="clients-title">Clientes</h1><p className="mt-2 text-brand-50">Cadastros, responsáveis e histórico centralizados.</p></div><Can permission="clients.create"><Button ref={createTriggerRef} onClick={() => setCreateOpen(true)}><Plus aria-hidden="true" className="h-4 w-4" />Novo cliente</Button></Can></div>
    <div className="grid gap-3 rounded-xl border border-border-subtle bg-surface-raised p-4 md:grid-cols-[minmax(14rem,1fr)_12rem_minmax(10rem,0.5fr)]">
      <div className="relative"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-[2.65rem] h-4 w-4 text-brand-100" /><Input label="Buscar clientes" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome, CPF/CNPJ ou e-mail" className="pl-9" /></div>
      <div className="grid gap-2"><label htmlFor="client-status-filter" className="font-semibold">Status</label><select id="client-status-filter" value={status} onChange={(event) => setStatus(event.target.value as ClientStatus | "")} className="min-h-11 rounded-lg border border-border bg-surface-base px-3 py-2"><option value="">Todos</option><option value="ACTIVE">Ativo</option><option value="INACTIVE">Inativo</option><option value="CHURNED">Churned</option></select></div>
      <Input label="Filtrar por tag" value={tag} onChange={(event) => setTag(event.target.value)} placeholder="Ex.: recorrente" />
    </div>
    {query.isPending ? <PageLoading /> : query.isError ? <PageError forbidden={query.error instanceof ApiProblem && query.error.status === 403} onRetry={() => { void query.refetch(); }} /> : query.data.data.length === 0 ? <NoResults filtered={filtered} action={!filtered && session.can("clients.create") ? <Button onClick={() => setCreateOpen(true)}>Cadastrar cliente</Button> : undefined} /> : <>
      <div className="max-w-full overflow-x-auto rounded-xl border border-border-subtle bg-surface-raised" role="region" aria-label="Lista de clientes" tabIndex={0}><table className="w-full min-w-[58rem] border-collapse"><caption className="sr-only">Clientes encontrados</caption><thead><tr className="text-left font-heading text-sm text-brand-50"><th scope="col" className="px-4 py-3">Cliente</th><th scope="col" className="px-4 py-3">Documento</th><th scope="col" className="px-4 py-3">E-mail</th><th scope="col" className="px-4 py-3">Status</th><th scope="col" className="px-4 py-3">Responsáveis</th><th scope="col" className="px-4 py-3">Ações</th></tr></thead><ClientRows clients={query.data.data} onArchive={(client, trigger) => { archiveTriggerRef.current = trigger; setArchiveTarget(client); }} /></table></div>
      <nav aria-label="Paginação de clientes" className="flex items-center justify-between"><Button variant="secondary" disabled={!cursorHistory.length} onClick={previousPage}><ChevronLeft aria-hidden="true" className="h-4 w-4" />Anterior</Button><span className="text-sm text-brand-50" aria-live="polite">{query.isPlaceholderData ? "Atualizando…" : `${query.data.data.length} clientes nesta página`}</span><Button variant="secondary" disabled={!query.data.meta.hasMore} onClick={nextPage}>Próxima<ChevronRight aria-hidden="true" className="h-4 w-4" /></Button></nav>
    </>}
    <Dialog open={createOpen} title="Novo cliente" description="Cadastre os dados e vínculos do cliente." onClose={() => setCreateOpen(false)} triggerRef={createTriggerRef}><ClientForm onCancel={() => setCreateOpen(false)} onSubmit={(draft) => createMutation.mutateAsync(draft).then(() => undefined)} /></Dialog>
    <ClientArchiveDialog client={archiveTarget} open={Boolean(archiveTarget)} onClose={() => setArchiveTarget(null)} triggerRef={archiveTriggerRef} />
  </section>;
}
