import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Archive, ArrowLeft, Edit3, Mail, MapPin, Phone, Tag, Users } from "lucide-react";
import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Can } from "../../auth/Can";
import { EmptyState } from "../../components/feedback/EmptyState";
import { PageError, PageLoading } from "../../components/feedback/PageState";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { ApiProblem } from "../../lib/api-client";
import { ClientArchiveDialog } from "./ClientArchiveDialog";
import { ClientForm } from "./ClientForm";
import { getClient, updateClient } from "./client-api";
import type { ClientStatus } from "./client-types";

const statusLabels: Record<ClientStatus, { label: string; tone: "success" | "neutral" | "warning" }> = {
  ACTIVE: { label: "Ativo", tone: "success" }, INACTIVE: { label: "Inativo", tone: "neutral" }, CHURNED: { label: "Churned", tone: "warning" },
};

function dateTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(value));
}

export function ClientDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const editTriggerRef = useRef<HTMLButtonElement>(null);
  const archiveTriggerRef = useRef<HTMLButtonElement>(null);
  const [editing, setEditing] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const query = useInfiniteQuery({
    queryKey: ["client", id],
    queryFn: ({ signal, pageParam }) => getClient(id, pageParam, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.timeline.meta.hasMore ? lastPage.timeline.meta.nextCursor ?? undefined : undefined,
    enabled: Boolean(id),
  });
  const detail = query.data?.pages[0];
  const client = detail?.client;
  const timeline = query.data?.pages.flatMap((page) => page.timeline.data) ?? [];
  const updateMutation = useMutation({ mutationFn: (draft: Parameters<typeof updateClient>[1]) => updateClient(id, draft, client!.version), onSuccess: async () => { await Promise.all([queryClient.invalidateQueries({ queryKey: ["client", id] }), queryClient.invalidateQueries({ queryKey: ["clients"] })]); setEditing(false); } });

  if (query.isPending) return <PageLoading label="Carregando cliente" />;
  if (query.isError) {
    const problem = query.error instanceof ApiProblem ? query.error : null;
    if (problem?.status === 404) return <EmptyState title="Cliente não encontrado" description="O registro não existe ou não está disponível para sua sessão." action={<Link to="/app/clientes"><Button>Voltar para clientes</Button></Link>} />;
    return <PageError forbidden={problem?.status === 403} onRetry={() => { void query.refetch(); }} />;
  }
  if (!client) return null;
  const status = statusLabels[client.status];
  const address = client.address;

  return <article aria-labelledby="client-name" className="grid gap-6">
    <Link to="/app/clientes" className="inline-flex min-h-11 items-center gap-2 justify-self-start text-brand-50 underline-offset-4 hover:underline"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Voltar para clientes</Link>
    <header className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-surface-raised p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6"><div><div className="mb-2 flex flex-wrap items-center gap-3"><p className="font-mono text-caption uppercase tracking-[0.2em] text-brand-100">{client.type === "PJ" ? "Pessoa jurídica" : "Pessoa física"}</p><Badge tone={status.tone}>{status.label}</Badge></div><h1 id="client-name">{client.name}</h1><p className="mt-2 font-mono text-sm text-brand-50">{client.document}</p></div><div className="flex flex-wrap gap-2"><Can permission="clients.update"><Button ref={editTriggerRef} variant="secondary" onClick={() => setEditing(true)}><Edit3 aria-hidden="true" className="h-4 w-4" />Editar</Button></Can><Can permission="clients.archive"><Button ref={archiveTriggerRef} variant="danger" onClick={() => setArchiving(true)}><Archive aria-hidden="true" className="h-4 w-4" />Arquivar</Button></Can></div></header>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.45fr)]">
      <section aria-labelledby="client-data-title" className="rounded-xl border border-border-subtle bg-surface-raised p-5 sm:p-6"><h2 id="client-data-title">Dados cadastrais</h2><dl className="mt-5 grid gap-5 sm:grid-cols-2">
        <div><dt className="text-sm text-brand-100">E-mail principal</dt><dd className="mt-1 break-all text-white"><Mail aria-hidden="true" className="mr-2 inline h-4 w-4" />{client.email}</dd></div>
        <div><dt className="text-sm text-brand-100">Responsáveis</dt><dd className="mt-1 text-white"><Users aria-hidden="true" className="mr-2 inline h-4 w-4" />{client.responsibles.length ? client.responsibles.map((item) => item.fullName).join(", ") : "Sem responsável"}</dd></div>
        <div className="sm:col-span-2"><dt className="text-sm text-brand-100">Endereço</dt><dd className="mt-1 text-white"><MapPin aria-hidden="true" className="mr-2 inline h-4 w-4" />{address ? [address.street, address.number, address.complement, address.district, address.city, address.state, address.postalCode].filter(Boolean).join(", ") : "Não informado"}</dd></div>
        <div className="sm:col-span-2"><dt className="text-sm text-brand-100">Contatos adicionais</dt><dd className="mt-2 grid gap-2">{client.contacts.length ? client.contacts.map((contact) => <span key={contact.id ?? `${contact.type}-${contact.value}`} className="break-all"><Phone aria-hidden="true" className="mr-2 inline h-4 w-4 text-brand-100" /><strong>{contact.label || contact.type}:</strong> {contact.value}</span>) : <span>Não informados</span>}</dd></div>
        <div className="sm:col-span-2"><dt className="text-sm text-brand-100">Tags</dt><dd className="mt-2 flex flex-wrap gap-2">{client.tags.length ? client.tags.map((tag) => <Badge key={tag}><Tag aria-hidden="true" className="mr-1 inline h-3 w-3" />{tag}</Badge>) : <span>Sem tags</span>}</dd></div>
      </dl></section>
      <aside aria-labelledby="record-title" className="rounded-xl border border-border-subtle bg-surface-raised p-5 sm:p-6"><h2 id="record-title">Registro</h2><dl className="mt-5 grid gap-4"><div><dt className="text-sm text-brand-100">Criado em</dt><dd className="mt-1">{dateTime(client.createdAt)}</dd></div><div><dt className="text-sm text-brand-100">Atualizado em</dt><dd className="mt-1">{dateTime(client.updatedAt)}</dd></div><div><dt className="text-sm text-brand-100">Versão</dt><dd className="mt-1 font-mono">{client.version}</dd></div></dl></aside>
    </div>
    <section aria-labelledby="timeline-title" className="rounded-xl border border-border-subtle bg-surface-raised p-5 sm:p-6"><h2 id="timeline-title">Histórico 360°</h2><p className="mt-1 text-brand-50">Interações registradas nos módulos da plataforma.</p>{timeline.length === 0 ? <div className="mt-5"><EmptyState title="Nenhuma interação registrada" description="As atividades reais vinculadas ao cliente aparecerão aqui." /></div> : <><ol className="mt-6 grid gap-4">{timeline.map((item) => <li key={item.id} className="border-l-2 border-brand-100 pl-4"><p className="font-semibold text-white">{item.summary}</p><p className="mt-1 text-brand-50">{item.sourceModule} · {item.eventType}</p><time className="mt-2 block font-mono text-xs text-brand-100" dateTime={item.occurredAt}>{dateTime(item.occurredAt)}</time></li>)}</ol>{query.hasNextPage && <Button className="mt-5" variant="secondary" loading={query.isFetchingNextPage} onClick={() => { void query.fetchNextPage(); }}>Carregar mais atividades</Button>}</>}</section>
    <Dialog open={editing} title="Editar cliente" description="Atualize os dados mantendo o histórico do registro." onClose={() => setEditing(false)} triggerRef={editTriggerRef}><ClientForm client={client} onCancel={() => setEditing(false)} onSubmit={(draft) => updateMutation.mutateAsync(draft).then(() => undefined)} /></Dialog>
    <ClientArchiveDialog client={client} open={archiving} onClose={() => setArchiving(false)} triggerRef={archiveTriggerRef} onArchived={() => navigate("/app/clientes", { replace: true })} />
  </article>;
}
